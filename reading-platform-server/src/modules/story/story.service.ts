import { prisma } from "../../config/db.config.js";
import { Prisma } from "../../generated/prisma/client.js";
import { ForbiddenError, NotFoundError } from "../../utils/api-error.js";
import { Role } from "../../generated/prisma/enums.js";
import {
  type CreateStoryInput,
  type UpdateStoryInput,
  type StoryQueryInput,
} from "./story.schema.js";

const noStories: Prisma.StoryWhereInput = { id: { in: [] } };

/**
 * Create a new story
 */
export async function createStory(data: CreateStoryInput, authorId: number) {
  return prisma.story.create({
    data: {
      ...data,
      authorId,
      createdById: authorId,
    },
  });
}

/**
 * List stories with filtering and pagination
 */
export async function getStories(
  query: StoryQueryInput,
  requesterId?: number,
  requesterRole?: Role
) {
  const { page, pageSize, authorId, isPublished, isPremium } = query;
  const skip = (page - 1) * pageSize;
  const isAdmin = requesterRole === Role.ADMIN;

  const where: Prisma.StoryWhereInput = { deletedAt: null };

  if (isPremium !== undefined) {
    where.isPremium = isPremium;
  }

  if (isAdmin) {
    if (authorId !== undefined) where.authorId = authorId;
    if (isPublished !== undefined) where.isPublished = isPublished;
  } else if (isPublished === false) {
    if (requesterId === undefined) {
      Object.assign(where, noStories);
    } else if (authorId !== undefined && authorId !== requesterId) {
      Object.assign(where, noStories);
    } else {
      where.isPublished = false;
      where.authorId = requesterId;
    }
  } else if (isPublished === true) {
    where.isPublished = true;
    if (authorId !== undefined) where.authorId = authorId;
  } else {
    if (authorId !== undefined) {
      where.AND = [
        { authorId },
        {
          OR: [
            { isPublished: true },
            ...(requesterId !== undefined ? [{ authorId: requesterId }] : []),
          ],
        },
      ];
    } else {
      where.OR = [
        { isPublished: true },
        ...(requesterId !== undefined ? [{ authorId: requesterId }] : []),
      ];
    }
  }

  const [total, stories] = await Promise.all([
    prisma.story.count({ where }),
    prisma.story.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    }),
  ]);

  return {
    stories,
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 0,
      hasNextPage: page < Math.ceil(total / pageSize),
      hasPrevPage: page > 1,
    },
  };
}

/**
 * Get a single story by ID with access checks and analytics
 */
export async function getStoryById(
  id: number,
  requesterId?: number,
  requesterRole?: Role
) {
  const story = await prisma.story.findFirst({
    where: { id, deletedAt: null },
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });

  if (!story) {
    throw new NotFoundError("Story not found");
  }

  const isAdmin = requesterRole === Role.ADMIN;
  const isAuthor = requesterId === story.authorId;

  if (!story.isPublished && !isAdmin && !isAuthor) {
    throw new ForbiddenError("You do not have access to this unpublished story");
  }

  let isLocked = false;
  let content = story.content;

  if (story.isPremium && !isAdmin && !isAuthor) {
    let hasSubscription = false;

    if (requesterId) {
      const activeSubscription = await prisma.subscription.findFirst({
        where: {
          userId: requesterId,
          status: "ACTIVE",
          endDate: { gt: new Date() },
        },
      });
      if (activeSubscription) hasSubscription = true;
    }

    if (!hasSubscription) {
      isLocked = true;
      content =
        content.length <= 200 ? content : content.substring(0, 200) + "...";
    }
  }

  await prisma.story.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });

  return { ...story, content, isLocked };
}


/**
 * Update story details
 */
export async function updateStory(
  id: number,
  data: UpdateStoryInput,
  requesterId: number,
  requesterRole: Role
) {
  const story = await prisma.story.findFirst({
    where: { id, deletedAt: null },
  });

  if (!story) throw new NotFoundError("Story not found");

  const isAdmin = requesterRole === Role.ADMIN;
  if (story.authorId !== requesterId && !isAdmin) {
    throw new ForbiddenError("You are not authorized to update this story");
  }

  return prisma.story.update({
    where: { id },
    data: {
      ...data,
      updatedById: requesterId,
    },
  });
}

/**
 * Soft delete a story
 */
export async function deleteStory(
  id: number,
  requesterId: number,
  requesterRole: Role
) {
  const story = await prisma.story.findFirst({
    where: { id, deletedAt: null },
  });

  if (!story) throw new NotFoundError("Story not found");

  const isAdmin = requesterRole === Role.ADMIN;
  if (story.authorId !== requesterId && !isAdmin) {
    throw new ForbiddenError("You are not authorized to delete this story");
  }

  await prisma.story.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return { message: "Story deleted successfully" };
}

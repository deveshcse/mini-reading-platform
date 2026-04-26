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
const PREMIUM_TEASER_CHARS = 200;

async function hasActiveSubscription(userId: number): Promise<boolean> {
  const row = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      endDate: { gt: new Date() },
    },
    select: { id: true },
  });
  return row != null;
}

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
  } else if (isPublished === false && requesterRole !== Role.READER) {
    // "Unpublished only" = current user's drafts (authors / admin). READER has no
    // drafts; if the client sends isPublished=false (common UI default), use the
    // main discovery branch below instead of returning an empty list.
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

  const [total, rows] = await Promise.all([
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

  const hasSub =
    requesterId != null ? await hasActiveSubscription(requesterId) : false;

  const stories = rows.map((s) => {
    const isAuthor = requesterId != null && s.authorId === requesterId;
    if (!s.isPremium || isAdmin || isAuthor) {
      return { ...s, isLocked: false };
    }
    if (hasSub) {
      return { ...s, isLocked: false };
    }
    const c = s.content;
    return {
      ...s,
      isLocked: true,
      content:
        c.length <= PREMIUM_TEASER_CHARS
          ? c
          : c.substring(0, PREMIUM_TEASER_CHARS) + "...",
    };
  });

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
    const hasSubscription =
      requesterId != null ? await hasActiveSubscription(requesterId) : false;

    if (!hasSubscription) {
      isLocked = true;
      content =
        content.length <= PREMIUM_TEASER_CHARS
          ? content
          : content.substring(0, PREMIUM_TEASER_CHARS) + "...";
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

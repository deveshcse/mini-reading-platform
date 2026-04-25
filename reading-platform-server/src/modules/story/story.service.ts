import { prisma } from "../../config/db.config.js";
import { ForbiddenError, NotFoundError } from "../../utils/api-error.js";
import { Role } from "../../generated/prisma/enums.js";
import {
  type CreateStoryInput,
  type UpdateStoryInput,
  type StoryQueryInput,
} from "./story.schema.js";

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

  // Base filters: ignore soft-deleted stories
  const where: any = {
    deletedAt: null,
  };

  if (authorId) where.authorId = authorId;
  if (isPremium !== undefined) where.isPremium = isPremium;

  // Visibility logic:
  // If no requester, or requester is not ADMIN and not the author of specific stories,
  // we must show only published content.
  const isAdmin = requesterRole === Role.ADMIN;

  if (!isAdmin) {
    if (isPublished !== undefined) {
      // Explicit filter from query
      where.isPublished = isPublished;
    } else {
      // Default visibility: published stories OR requester's own stories
      where.OR = [
        { isPublished: true },
        ...(requesterId ? [{ authorId: requesterId }] : []),
      ];
    }
  } else if (isPublished !== undefined) {
    where.isPublished = isPublished;
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
      totalPages: Math.ceil(total / pageSize),
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
  const story = await prisma.story.findUnique({
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

  // 1. Ownership/Visibility Check
  const isAdmin = requesterRole === Role.ADMIN;
  const isAuthor = requesterId === story.authorId;

  if (!story.isPublished && !isAdmin && !isAuthor) {
    throw new ForbiddenError("You do not have access to this unpublished story");
  }

  // 2. Premium Access Check & Teaser Logic
  let isLocked = false;

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
      // Provide a 200-character teaser
      (story as any).content = story.content.substring(0, 200) + "...";
    }
  }

  // 3. Analytics: Increment view count
  await prisma.story.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });

  return { ...story, isLocked };
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
  const story = await prisma.story.findUnique({
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
  const story = await prisma.story.findUnique({
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

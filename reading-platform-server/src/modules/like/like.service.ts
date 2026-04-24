import { prisma } from "../../config/db.config.js";
import { NotFoundError } from "../../utils/api-error.js";
import { type LikeQueryInput } from "./like.schema.js";

/**
 * Toggles a like for a story.
 * If user already liked, it removes the like.
 * If user hasn't liked, it creates a new like.
 */
export async function toggleLike(userId: number, storyId: number) {
  // 1. Verify story exists
  const story = await prisma.story.findUnique({
    where: { id: storyId, deletedAt: null },
  });

  if (!story) {
    throw new NotFoundError("Story not found");
  }

  // 2. Check if like exists
  const existingLike = await prisma.like.findUnique({
    where: {
      userId_storyId: {
        userId,
        storyId,
      },
    },
  });

  if (existingLike) {
    // Unlike
    await prisma.like.delete({
      where: {
        id: existingLike.id,
      },
    });
    return { status: "unliked", liked: false };
  } else {
    // Like
    await prisma.like.create({
      data: {
        userId,
        storyId,
      },
    });
    return { status: "liked", liked: true };
  }
}

/**
 * Get paginated list of users who liked a story
 */
export async function getStoryLikes(storyId: number, query: LikeQueryInput) {
  const { page, pageSize } = query;
  const skip = (page - 1) * pageSize;

  const [total, likes] = await Promise.all([
    prisma.like.count({ where: { storyId } }),
    prisma.like.findMany({
      where: { storyId },
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },

        },
      },
    }),
  ]);

  return {
    likes: likes.map((l) => l.user),
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

/**
 * Check if a user has liked a story
 */
export async function checkUserLiked(userId: number, storyId: number) {
  const like = await prisma.like.findUnique({
    where: {
      userId_storyId: {
        userId,
        storyId,
      },
    },
  });
  return !!like;
}

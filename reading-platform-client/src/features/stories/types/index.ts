/**
 * Shapes returned by the reading platform story API (aligned with Prisma + story.service).
 */
export interface StoryAuthor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Story {
  id: number;
  title: string;
  description: string | null;
  content: string;
  coverImage: string | null;
  isPublished: boolean;
  isPremium: boolean;
  viewCount: number;
  authorId: number;
  createdById: number | null;
  updatedById: number | null;
  createdAt: string;
  updatedAt: string;
  author?: StoryAuthor;
}

export interface StoriesMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface StoriesResponse {
  stories: Story[];
  meta: StoriesMeta;
}

/** `GET /stories/:id` — may truncate premium content and set `isLocked`. */
export type StoryWithAccess = Story & { isLocked: boolean };

/** User row returned inside `GET /stories/:id/likes`. */
export interface StoryLikeUser {
  id: number;
  firstName: string;
  lastName: string;
}

export interface StoryLikesMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface StoryLikesListResponse {
  likes: StoryLikeUser[];
  meta: StoryLikesMeta;
}

export interface LikeStatusResponse {
  liked: boolean;
}

export interface ToggleLikeResponse {
  status: "liked" | "unliked";
  liked: boolean;
}

import { type Request, type Response, type NextFunction } from "express";
import * as likeService from "./like.service.js";
import { sendSuccess } from "../../utils/api-response.js";
import { type LikeQueryInput } from "./like.schema.js";

export async function toggleLike(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = Number(req.user!.userId);
    const storyId = Number(req.params.storyId);
    const result = await likeService.toggleLike(userId, storyId);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function getStoryLikes(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const storyId = Number(req.params.storyId);
    const query = req.query as unknown as LikeQueryInput;
    const result = await likeService.getStoryLikes(storyId, query);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function checkUserLiked(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = Number(req.user!.userId);
    const storyId = Number(req.params.storyId);
    const liked = await likeService.checkUserLiked(userId, storyId);
    sendSuccess(res, { liked });
  } catch (error) {
    next(error);
  }
}

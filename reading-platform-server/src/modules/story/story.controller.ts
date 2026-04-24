import { type Request, type Response, type NextFunction } from "express";
import * as storyService from "./story.service.js";
import { sendSuccess } from "../../utils/api-response.js";
import {
  type CreateStoryInput,
  type UpdateStoryInput,
  type StoryQueryInput,
} from "./story.schema.js";

export async function createStory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = Number(req.user!.userId);
    const result = await storyService.createStory(req.body as CreateStoryInput, userId);
    sendSuccess(res, result, 201);
  } catch (error) {
    next(error);
  }
}

export async function getStories(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const query = req.query as unknown as StoryQueryInput;
    const requesterId = req.user ? Number(req.user.userId) : undefined;
    const requesterRoles = req.user?.roles;

    const result = await storyService.getStories(query, requesterId, requesterRoles);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function getStoryById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    const requesterId = req.user ? Number(req.user.userId) : undefined;
    const requesterRoles = req.user?.roles;

    const result = await storyService.getStoryById(id, requesterId, requesterRoles);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function updateStory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    const userId = Number(req.user!.userId);
    const roles = req.user!.roles;

    const result = await storyService.updateStory(id, req.body as UpdateStoryInput, userId, roles);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function deleteStory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    const userId = Number(req.user!.userId);
    const roles = req.user!.roles;

    const result = await storyService.deleteStory(id, userId, roles);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

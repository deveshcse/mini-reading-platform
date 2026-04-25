import { type Request, type Response } from "express";
import * as storyService from "./story.service.js";
import { sendSuccess } from "../../utils/api-response.js";
import {
  type CreateStoryInput,
  type UpdateStoryInput,
  type StoryQueryInput,
} from "./story.schema.js";

export async function createStory(req: Request, res: Response): Promise<void> {
  const userId = Number(req.user!.userId);
  const result = await storyService.createStory(
    req.validated!.body as CreateStoryInput,
    userId
  );
  sendSuccess(res, result, 201);
}

export async function getStories(req: Request, res: Response): Promise<void> {
  const query = req.validated!.query as StoryQueryInput;
  const requesterId = req.user ? Number(req.user.userId) : undefined;
  const requesterRole = req.user?.role;

  const result = await storyService.getStories(query, requesterId, requesterRole);
  sendSuccess(res, result);
}

export async function getStoryById(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const requesterId = req.user ? Number(req.user.userId) : undefined;
  const requesterRole = req.user?.role;

  const result = await storyService.getStoryById(id, requesterId, requesterRole);
  sendSuccess(res, result);
}

export async function updateStory(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const userId = Number(req.user!.userId);
  const role = req.user!.role;

  const result = await storyService.updateStory(
    id,
    req.validated!.body as UpdateStoryInput,
    userId,
    role
  );
  sendSuccess(res, result);
}

export async function deleteStory(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const userId = Number(req.user!.userId);
  const role = req.user!.role;

  const result = await storyService.deleteStory(id, userId, role);
  sendSuccess(res, result);
}

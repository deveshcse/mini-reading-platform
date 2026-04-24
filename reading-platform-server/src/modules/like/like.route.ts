import { Router } from "express";
import * as likeController from "./like.controller.js";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { likeParamsSchema, likeQuerySchema } from "./like.schema.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Engagement
 *   description: Likes and other user interactions
 */

/**
 * @swagger
 * /stories/{storyId}/like:
 *   post:
 *     summary: Toggle like on a story
 *     tags: [Engagement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storyId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Success (returns status liked or unliked)
 *       404:
 *         description: Story not found
 */
router.post(
  "/:storyId/like",
  authenticate,
  validate(likeParamsSchema),
  likeController.toggleLike
);

/**
 * @swagger
 * /stories/{storyId}/likes:
 *   get:
 *     summary: Get users who liked the story
 *     tags: [Engagement]
 *     parameters:
 *       - in: path
 *         name: storyId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: List of users retrieved
 */
router.get(
  "/:storyId/likes",
  validate(likeParamsSchema),
  validate(likeQuerySchema),
  likeController.getStoryLikes
);

/**
 * @swagger
 * /stories/{storyId}/like-status:
 *   get:
 *     summary: Check if current user liked the story
 *     tags: [Engagement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storyId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: returns boolean liked
 */
router.get(
  "/:storyId/like-status",
  authenticate,
  validate(likeParamsSchema),
  likeController.checkUserLiked
);

export default router;

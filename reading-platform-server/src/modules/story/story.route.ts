import { Router } from "express";
import * as storyController from "./story.controller.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { authenticate, optionalAuthenticate } from "../../middleware/authenticate.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  createStorySchema,
  updateStorySchema,
  storyQuerySchema,
} from "./story.schema.js";

const router = Router();



/**
 * @swagger
 * tags:
 *   name: Stories
 *   description: Story management and retrieval
 */

/**
 * @swagger
 * /stories:
 *   post:
 *     summary: Create a new story
 *     tags: [Stories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               content:
 *                 type: string
 *               coverImage:
 *                 type: string
 *               isPublished:
 *                 type: boolean
 *               isPremium:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Story created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Insufficient permissions)
 */
router.post(
  "/",
  authenticate,
  authorize("story", "create"),
  validate(createStorySchema),
  asyncHandler(storyController.createStory)
);

/**
 * @swagger
 * /stories:
 *   get:
 *     summary: List stories with filters and pagination
 *     tags: [Stories]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 10 }

 *       - in: query
 *         name: authorId
 *         schema: { type: integer }
 *       - in: query
 *         name: isPublished
 *         schema: { type: boolean }
 *       - in: query
 *         name: isPremium
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: List of stories retrieved successfully
 */
router.get(
  "/",
  optionalAuthenticate,
  validate(storyQuerySchema),
  asyncHandler(storyController.getStories)
);

/**
 * @swagger
 * /stories/{id}:
 *   get:
 *     summary: Get a story by ID
 *     tags: [Stories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Story details retrieved successfully
 *       403:
 *         description: Forbidden (Premium content or unpublished)
 *       404:
 *         description: Story not found
 */
router.get(
  "/:id",
  optionalAuthenticate,
  asyncHandler(storyController.getStoryById)
);

/**
 * @swagger
 * /stories/{id}:
 *   patch:
 *     summary: Update a story
 *     tags: [Stories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               content: { type: string }
 *               isPublished: { type: boolean }
 *               isPremium: { type: boolean }
 *     responses:
 *       200:
 *         description: Story updated successfully
 *       403:
 *         description: Forbidden (Not the author or admin)
 */
router.patch(
  "/:id",
  authenticate,
  authorize("story", "update"),
  validate(updateStorySchema),
  asyncHandler(storyController.updateStory)
);

/**
 * @swagger
 * /stories/{id}:
 *   delete:
 *     summary: Soft delete a story
 *     tags: [Stories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Story deleted successfully
 *       403:
 *         description: Forbidden (Not the author or admin)
 */
router.delete(
  "/:id",
  authenticate,
  authorize("story", "delete"),
  asyncHandler(storyController.deleteStory)
);

export default router;

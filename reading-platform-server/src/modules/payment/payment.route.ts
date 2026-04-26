import { Router } from "express";
import * as paymentController from "./payment.controller.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  createSubscriptionSchema,
  verifySubscriptionSchema,
} from "./payment.schema.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Razorpay subscription creation and signature verification
 */

/**
 * @swagger
 * /payments/create-subscription:
 *   post:
 *     summary: Create Razorpay subscription for a plan checkout
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [planId]
 *             properties:
 *               planId:
 *                 type: integer
 *                 description: Existing plan ID
 *               totalCount:
 *                 type: integer
 *                 description: Number of billing cycles (default 12)
 *     responses:
 *       200:
 *         description: Subscription created successfully
 *       400:
 *         description: Invalid plan or missing Razorpay plan mapping
 *       401:
 *         description: Unauthorized or Razorpay auth failure
 */
router.post(
  "/create-subscription",
  authenticate,
  validate(createSubscriptionSchema),
  asyncHandler(paymentController.createSubscription)
);

/**
 * @swagger
 * /payments/verify-subscription:
 *   post:
 *     summary: Verify Razorpay subscription signature and activate subscription
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [razorpay_payment_id, razorpay_subscription_id, razorpay_signature]
 *             properties:
 *               razorpay_payment_id:
 *                 type: string
 *               razorpay_subscription_id:
 *                 type: string
 *               razorpay_signature:
 *                 type: string
 *     responses:
 *       200:
 *         description: Signature verified
 *       400:
 *         description: Signature mismatch or missing fields
 */
router.post(
  "/verify-subscription",
  authenticate,
  validate(verifySubscriptionSchema),
  asyncHandler(paymentController.verifySubscription)
);

export default router;

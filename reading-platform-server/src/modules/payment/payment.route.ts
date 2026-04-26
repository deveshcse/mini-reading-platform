import { Router } from "express";
import * as paymentController from "./payment.controller.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { validate } from "../../middleware/validate.middleware.js";
import { createOrderSchema, verifyPaymentSchema } from "./payment.schema.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Razorpay order creation and signature verification
 */

/**
 * @swagger
 * /payments/create-order:
 *   post:
 *     summary: Create Razorpay order for checkout
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount:
 *                 type: integer
 *                 description: Amount in paise (minimum 100)
 *               currency:
 *                 type: string
 *                 example: INR
 *               receipt:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order created successfully
 *       400:
 *         description: Invalid amount
 *       401:
 *         description: Razorpay auth failure
 */
router.post(
  "/create-order",
  validate(createOrderSchema),
  asyncHandler(paymentController.createOrder)
);

/**
 * @swagger
 * /payments/verify-payment:
 *   post:
 *     summary: Verify Razorpay payment signature
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [razorpay_order_id, razorpay_payment_id, razorpay_signature]
 *             properties:
 *               razorpay_order_id:
 *                 type: string
 *               razorpay_payment_id:
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
  "/verify-payment",
  validate(verifyPaymentSchema),
  asyncHandler(paymentController.verifyPayment)
);

export default router;

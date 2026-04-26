import { type Request, type Response } from "express";
import { sendSuccess } from "../../utils/api-response.js";
import * as paymentService from "./payment.service.js";
import {
  type CreateSubscriptionInput,
  type VerifySubscriptionInput,
} from "./payment.schema.js";

export async function createSubscription(
  req: Request,
  res: Response
): Promise<void> {
  const input = req.validated!.body as CreateSubscriptionInput;
  const userId = Number(req.user!.userId);
  const result = await paymentService.createSubscription(userId, input);
  sendSuccess(res, result);
}

export async function verifySubscription(
  req: Request,
  res: Response
): Promise<void> {
  const input = req.validated!.body as VerifySubscriptionInput;
  const userId = Number(req.user!.userId);
  const result = await paymentService.verifySubscription(userId, input);
  sendSuccess(res, result);
}

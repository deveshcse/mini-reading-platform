import { type Request, type Response } from "express";
import { sendSuccess } from "../../utils/api-response.js";
import * as paymentService from "./payment.service.js";
import {
  type CreateOrderInput,
  type VerifyPaymentInput,
} from "./payment.schema.js";

export async function createOrder(req: Request, res: Response): Promise<void> {
  const input = req.validated!.body as CreateOrderInput;
  const result = await paymentService.createOrder(input);
  sendSuccess(res, result);
}

export async function verifyPayment(
  req: Request,
  res: Response
): Promise<void> {
  const input = req.validated!.body as VerifyPaymentInput;
  const result = await paymentService.verifyPayment(input);
  sendSuccess(res, result);
}

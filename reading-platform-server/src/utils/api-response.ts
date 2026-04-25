import { type Response } from "express";
import { logger } from "../config/logger.config.js";

/**
 * Sends a standardised success JSON response.
 *
 * Shape:
 * {
 *   "success": true,
 *   "data": <payload>
 * }
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200
): void {
  logger.info(
    {
      method: res.req?.method,
      url: res.req?.originalUrl,
      statusCode,
    },
    "API Success"
  );

  res.status(statusCode).json({
    success: true,
    data,
  });
}

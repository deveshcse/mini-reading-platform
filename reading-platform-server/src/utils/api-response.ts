import { type Response } from "express";

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
  res.status(statusCode).json({
    success: true,
    data,
  });
}

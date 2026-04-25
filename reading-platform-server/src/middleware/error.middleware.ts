import { type Request, type Response, type NextFunction } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/api-error.js";
import { logger } from "../config/logger.config.js";

/**
 * Central error handler.
 *
 * Handles:
 *  - ApiError subclasses  → operational, status from the error
 *  - ZodError             → 400 validation failure with field details
 *  - Unknown errors       → 500 Internal Server Error (stack hidden in prod)
 */
export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const meta = {
    method: req.method,
    url: req.originalUrl,
  };
  // ── Zod validation errors ─────────────────────────────────────────────────
  if (err instanceof ZodError) {
    logger.warn({ ...meta, err }, "Validation Error");
    res.status(400).json({
      success: false,
      error: {
        message: "Validation failed",
        details: err.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
    });
    return;
  }

  // ── Operational ApiError subclasses ───────────────────────────────────────
  if (err instanceof ApiError) {
    if (err.isOperational) {
      logger.warn({ ...meta, err }, "Operational API Error");
    } else {
      logger.error({ ...meta, err }, "Non-Operational API Error");
    }

    res.status(err.statusCode).json({
      success: false,
      error: { message: err.message },
    });
    return;
  }

  // ── Unexpected / programming errors ───────────────────────────────────────
  logger.error({ ...meta, err }, "Unexpected System Error");
  const message =
    process.env.NODE_ENV !== "production"
      ? (err as Error).message ?? "Internal Server Error"
      : "Internal Server Error";

  res.status(500).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV !== "production" && {
        stack: (err as Error).stack,
      }),
    },
  });
};

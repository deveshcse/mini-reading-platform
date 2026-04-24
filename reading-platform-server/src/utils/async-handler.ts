import {
  type Request,
  type Response,
  type NextFunction,
  type RequestHandler,
} from "express";

type AsyncFn = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

/**
 * Wraps an async route handler so any rejected promise is automatically
 * forwarded to Express's next(error) — eliminating try/catch boilerplate.
 */
export const asyncHandler = (fn: AsyncFn): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

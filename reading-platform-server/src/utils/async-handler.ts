import { type Request, type Response, type RequestHandler } from "express";

type AsyncRouteFn = (req: Request, res: Response) => Promise<void>;

/**
 * Wraps an async route handler so any rejected promise is automatically
 * forwarded to Express's next(error) — eliminating try/catch boilerplate.
 */
export const asyncHandler = (fn: AsyncRouteFn): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res)).catch(next);
  };
};

import { type Request, type Response, type NextFunction } from "express";
import { type ZodSchema, ZodError } from "zod";

/**
 * Validate request against a Zod schema.
 * The schema should wrap { body, query, params } as needed.
 *
 * On failure the ZodError is forwarded to the central error handler.
 */
export const validate =
  (schema: ZodSchema) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Forward to error middleware — it knows how to format ZodErrors
        next(error);
      } else {
        next(error);
      }
    }
  };

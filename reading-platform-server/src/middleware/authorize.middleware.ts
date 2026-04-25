import { type Request, type Response, type NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "../utils/api-error.js";
import { can, type Resource, type Action } from "../utils/statements.js";

/**
 * RBAC authorization middleware.
 *
 * @example
 * router.post("/", authenticate, authorize("story", "create"), controller.create);
 * router.delete("/:id", authenticate, authorize("story", "delete"), controller.delete);
 */
export const authorize = (resource: Resource, action: Action<typeof resource>) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required"));
    }

    if (!can(req.user.role, resource, action)) {
      return next(new ForbiddenError(`Cannot ${action} ${resource}`));
    }

    next();
  };
};
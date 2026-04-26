import { Router } from "express";
import * as planController from "./plan.controller.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  createPlanSchema,
  listPlansQuerySchema,
  planIdParamsSchema,
  updatePlanSchema,
} from "./plan.schema.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Plans
 *   description: Subscription plan management (admin only)
 */

router.post(
  "/",
  authenticate,
  authorize("plan", "create"),
  validate(createPlanSchema),
  asyncHandler(planController.createPlan)
);

router.get(
  "/",
  validate(listPlansQuerySchema),
  asyncHandler(planController.listPlans)
);

router.get(
  "/:id",
  validate(planIdParamsSchema),
  asyncHandler(planController.getPlanById)
);

router.patch(
  "/:id",
  authenticate,
  authorize("plan", "update"),
  validate(
    planIdParamsSchema.extend({
      body: updatePlanSchema.shape.body,
    })
  ),
  asyncHandler(planController.updatePlan)
);

router.delete(
  "/:id",
  authenticate,
  authorize("plan", "delete"),
  validate(planIdParamsSchema),
  asyncHandler(planController.deletePlan)
);

export default router;

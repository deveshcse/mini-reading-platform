import { type Request, type Response } from "express";
import { sendSuccess } from "../../utils/api-response.js";
import * as planService from "./plan.service.js";
import {
  type CreatePlanInput,
  type ListPlansQueryInput,
  type PlanIdParams,
  type UpdatePlanInput,
} from "./plan.schema.js";

export async function createPlan(req: Request, res: Response): Promise<void> {
  const input = req.validated!.body as CreatePlanInput;
  const plan = await planService.createPlan(input);
  sendSuccess(res, plan, 201);
}

export async function listPlans(req: Request, res: Response): Promise<void> {
  const query = req.validated!.query as ListPlansQueryInput;
  const result = await planService.listPlans(query);
  sendSuccess(res, result);
}

export async function getPlanById(req: Request, res: Response): Promise<void> {
  const { id } = req.validated!.params as PlanIdParams;
  const plan = await planService.getPlanById(id);
  sendSuccess(res, plan);
}

export async function updatePlan(req: Request, res: Response): Promise<void> {
  const { id } = req.validated!.params as PlanIdParams;
  const input = req.validated!.body as UpdatePlanInput;
  const plan = await planService.updatePlan(id, input);
  sendSuccess(res, plan);
}

export async function deletePlan(req: Request, res: Response): Promise<void> {
  const { id } = req.validated!.params as PlanIdParams;
  const result = await planService.deletePlan(id);
  sendSuccess(res, result);
}

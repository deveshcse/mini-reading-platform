import { prisma } from "../../config/db.config.js";
import { NotFoundError } from "../../utils/api-error.js";
import {
  type CreatePlanInput,
  type ListPlansQueryInput,
  type UpdatePlanInput,
} from "./plan.schema.js";

export async function createPlan(input: CreatePlanInput) {
  return prisma.plan.create({ data: input });
}

export async function listPlans(query: ListPlansQueryInput) {
  const { page, pageSize, isActive } = query;
  const skip = (page - 1) * pageSize;

  const where =
    isActive === undefined
      ? undefined
      : {
          isActive,
        };

  const [total, plans] = await Promise.all([
    prisma.plan.count({ where }),
    prisma.plan.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    plans,
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 0,
      hasNextPage: page < Math.ceil(total / pageSize),
      hasPrevPage: page > 1,
    },
  };
}

export async function getPlanById(id: number) {
  const plan = await prisma.plan.findUnique({ where: { id } });
  if (!plan) throw new NotFoundError("Plan not found");
  return plan;
}

export async function updatePlan(id: number, input: UpdatePlanInput) {
  const existing = await prisma.plan.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError("Plan not found");

  return prisma.plan.update({
    where: { id },
    data: input,
  });
}

export async function deletePlan(id: number) {
  const existing = await prisma.plan.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError("Plan not found");

  await prisma.plan.delete({ where: { id } });
  return { message: "Plan deleted successfully" };
}

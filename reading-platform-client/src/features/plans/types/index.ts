export const PlanInterval = {
  MONTHLY: "MONTHLY",
  QUARTERLY: "QUARTERLY",
  YEARLY: "YEARLY",
} as const;

export type PlanInterval = (typeof PlanInterval)[keyof typeof PlanInterval];

export const SubscriptionPlanName = {
  STANDARD: "STANDARD",
  PREMIUM: "PREMIUM",
  ENTERPRISE: "ENTERPRISE",
} as const;

export type SubscriptionPlanName = (typeof SubscriptionPlanName)[keyof typeof SubscriptionPlanName];

export interface Plan {
  id: number;
  name: SubscriptionPlanName;
  description: string | null;
  price: number;
  currency: string;
  interval: PlanInterval;
  intervalCount: number;
  isActive: boolean;
  razorpayPlanId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface PlansMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PlansResponse {
  plans: Plan[];
  meta: PlansMeta;
}

export interface CreateSubscriptionResponse {
  subscription_id: string;
  key_id?: string;
}

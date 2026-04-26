"use client";

import React, { useMemo, useState } from "react";
import Script from "next/script";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Can } from "@/shared/components/can";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useCreatePlan,
  useDeletePlan,
  usePlans,
  useUpdatePlan,
} from "@/features/plans/hooks/use-plans";
import { createPlanSchema } from "@/features/plans/schema";
import {
  PlanInterval,
  SubscriptionPlanName,
  type CreateSubscriptionResponse,
  type Plan,
} from "@/features/plans/types";
import apiClient from "@/shared/api/api-client";

interface RazorpayInstance {
  open: () => void;
  on: (event: "payment.failed", handler: (response: RazorpayFailureResponse) => void) => void;
}

interface RazorpayFailureResponse {
  error?: {
    description?: string;
  };
}

interface RazorpayOptions {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  handler: (response: RazorpayCheckoutSuccess) => void | Promise<void>;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayCheckoutSuccess {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

type CreateFormState = {
  name: keyof typeof SubscriptionPlanName;
  description: string;
  price: string;
  currency: string;
  interval: keyof typeof PlanInterval;
  intervalCount: string;
  isActive: boolean;
  razorpayPlanId: string;
};

const initialForm: CreateFormState = {
  name: SubscriptionPlanName.STANDARD,
  description: "",
  price: "",
  currency: "INR",
  interval: PlanInterval.MONTHLY,
  intervalCount: "1",
  isActive: true,
  razorpayPlanId: "",
};

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount);
}

function intervalLabel(interval: string, intervalCount: number) {
  const base = interval.toLowerCase();
  return intervalCount > 1 ? `${intervalCount} ${base}` : base;
}

function subscriptionTotalCount(interval: Plan["interval"]): number {
  if (interval === PlanInterval.YEARLY) return 1;
  if (interval === PlanInterval.QUARTERLY) return 4;
  return 12;
}

export function PlansSubscriptionPage() {
  const [scriptReady, setScriptReady] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [payingPlanId, setPayingPlanId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateFormState>(initialForm);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const activePlansQuery = usePlans({ page: 1, pageSize: 50, isActive: true });
  const allPlansQuery = usePlans({ page: 1, pageSize: 100 });

  const createPlanMutation = useCreatePlan();
  const updatePlanMutation = useUpdatePlan(editingPlan?.id ?? 0);
  const deletePlanMutation = useDeletePlan();

  const activePlans = useMemo(() => activePlansQuery.data?.plans ?? [], [activePlansQuery.data?.plans]);
  const allPlans = useMemo(() => allPlansQuery.data?.plans ?? [], [allPlansQuery.data?.plans]);

  const fallbackRazorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  const selectedPlan =
    activePlans.find((plan) => plan.id === selectedPlanId) ?? activePlans[0] ?? null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = createPlanSchema.safeParse({
      name: form.name,
      description: form.description || undefined,
      price: Number(form.price),
      currency: form.currency,
      interval: form.interval,
      intervalCount: Number(form.intervalCount),
      isActive: form.isActive,
      razorpayPlanId: form.razorpayPlanId.trim() || undefined,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Please check plan details");
      return;
    }

    await createPlanMutation.mutateAsync(parsed.data);
    setForm(initialForm);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    await updatePlanMutation.mutateAsync({
      description: editingPlan.description ?? "",
      price: editingPlan.price,
      currency: editingPlan.currency,
      interval: editingPlan.interval,
      intervalCount: editingPlan.intervalCount,
      isActive: editingPlan.isActive,
      razorpayPlanId: editingPlan.razorpayPlanId?.trim() || null,
    });
    setEditingPlan(null);
  };

  const openCheckout = async () => {
    if (!selectedPlan) {
      toast.error("No active plan selected.");
      return;
    }
    const RazorpayCtor = (window as Window & {
      Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
    }).Razorpay;
    if (!scriptReady || !RazorpayCtor) {
      toast.error("Payment gateway is loading. Please try again.");
      return;
    }

    setPayingPlanId(selectedPlan.id);
    try {
      const normalizedRazorpayPlanId = selectedPlan.razorpayPlanId?.trim();
      if (!normalizedRazorpayPlanId) {
        throw new Error("Selected plan is missing Razorpay plan id.");
      }

      if (normalizedRazorpayPlanId !== selectedPlan.razorpayPlanId) {
        await apiClient.patch(`/plans/${selectedPlan.id}`, {
          razorpayPlanId: normalizedRazorpayPlanId,
        });
      }

      const subscriptionRes = await apiClient.post("/payments/create-subscription", {
        planId: selectedPlan.id,
        totalCount: subscriptionTotalCount(selectedPlan.interval),
      });

      const subscription = subscriptionRes.data?.data as CreateSubscriptionResponse;
      const razorpayKey = subscription.key_id || fallbackRazorpayKey;
      if (!razorpayKey) throw new Error("Missing Razorpay key id.");
      if (!subscription.subscription_id) throw new Error("Missing Razorpay subscription id.");

      const checkout = new RazorpayCtor({
        key: razorpayKey,
        subscription_id: subscription.subscription_id,
        name: "Mini Reading Platform",
        description: `${selectedPlan.name} subscription`,
        handler: async (response: RazorpayCheckoutSuccess) => {
          await apiClient.post("/payments/verify-subscription", {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_subscription_id: response.razorpay_subscription_id,
            razorpay_signature: response.razorpay_signature,
          });
          toast.success("Payment verified successfully.");
          setPayingPlanId(null);
        },
        modal: {
          ondismiss: () => {
            toast.message("Payment modal closed.");
            setPayingPlanId(null);
          },
        },
      });

      checkout.on("payment.failed", (resp) => {
        toast.error(resp.error?.description || "Payment failed.");
        setPayingPlanId(null);
      });
      checkout.open();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to initialize payment.");
      setPayingPlanId(null);
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />

      <div className="space-y-8">
        <section className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Plans</p>
          <h1 className="mt-2 text-3xl font-black uppercase tracking-tight sm:text-4xl">
            Choose your subscription
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
            Pick a plan, then pay securely using Razorpay checkout.
          </p>
        </section>

        {activePlansQuery.isLoading ? (
          <div className="flex min-h-[25vh] items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary/50" />
          </div>
        ) : activePlans.length === 0 ? (
          <Card className="border-2">
            <CardContent className="py-8 text-center text-sm font-bold text-muted-foreground">
              No active plans yet.
            </CardContent>
          </Card>
        ) : (
          <section className="grid grid-cols-1 gap-5 md:gap-10 md:grid-cols-2">
            {activePlans.map((plan) => {
              const selected = selectedPlan?.id === plan.id;
              const paying = payingPlanId === plan.id;
              return (
                <Card
                  key={plan.id}
                  className={selected ? "border-2 border-primary ring-2 ring-primary/20" : "border-2"}
                >
                  <CardHeader>
                    <CardTitle className="text-xl font-black uppercase">{plan.name}</CardTitle>
                    <CardDescription>{plan.description || "Premium access to paid stories."}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-3xl font-black">
                      {formatPrice(plan.price, plan.currency)}
                      <span className="ml-1 text-xs font-bold uppercase text-muted-foreground">
                        / {intervalLabel(plan.interval, plan.intervalCount)}
                      </span>
                    </p>
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant={selected ? "default" : "outline"}
                        className="rounded-none border-2 font-bold uppercase"
                        onClick={() => setSelectedPlanId(plan.id)}
                      >
                        {selected ? "Selected" : "Select plan"}
                      </Button>
                      {selected && (
                        <Button
                          type="button"
                          onClick={() => void openCheckout()}
                          disabled={!scriptReady || Boolean(payingPlanId)}
                          className="rounded-none border-2 font-black uppercase tracking-widest"
                        >
                          {paying ? (
                            <>
                              <Loader2 className="size-4 animate-spin" aria-hidden />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="size-4" aria-hidden />
                              Pay with Razorpay
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </section>
        )}

        <Can resource="plan" action="create">
          <section className="space-y-4 border-t-2 pt-8">
            <h2 className="text-xl font-black uppercase tracking-tight">Manage plans</h2>
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Create plan</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => void handleCreate(e)} className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="name">Name</Label>
                    <select
                      id="name"
                      className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5"
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value as CreateFormState["name"] }))}
                    >
                      {Object.values(SubscriptionPlanName).map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                      id="currency"
                      value={form.currency}
                      onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="interval">Interval</Label>
                    <select
                      id="interval"
                      className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5"
                      value={form.interval}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, interval: e.target.value as CreateFormState["interval"] }))
                      }
                    >
                      {Object.values(PlanInterval).map((interval) => (
                        <option key={interval} value={interval}>
                          {interval}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="intervalCount">Interval count</Label>
                    <Input
                      id="intervalCount"
                      type="number"
                      min="1"
                      step="1"
                      value={form.intervalCount}
                      onChange={(e) => setForm((prev) => ({ ...prev, intervalCount: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="razorpayPlanId">Razorpay Plan ID (optional)</Label>
                    <Input
                      id="razorpayPlanId"
                      value={form.razorpayPlanId}
                      onChange={(e) => setForm((prev) => ({ ...prev, razorpayPlanId: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={form.description}
                      onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-2">
                    <Checkbox
                      id="isActive"
                      checked={form.isActive}
                      onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isActive: Boolean(checked) }))}
                    />
                    <Label htmlFor="isActive">Active plan</Label>
                  </div>
                  <div className="sm:col-span-2">
                    <Button
                      type="submit"
                      disabled={createPlanMutation.isPending}
                      className="rounded-none border-2 font-black uppercase"
                    >
                      {createPlanMutation.isPending ? "Creating..." : "Create plan"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>Existing plans</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {allPlans.map((plan) => (
                  <div key={plan.id} className="flex flex-col gap-2 border-2 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-black uppercase">
                        {plan.name} - {formatPrice(plan.price, plan.currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {plan.interval} x{plan.intervalCount} - {plan.isActive ? "Active" : "Inactive"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-none border-2"
                        onClick={() => setEditingPlan(plan)}
                      >
                        Edit
                      </Button>
                      <Can resource="plan" action="delete">
                        <Button
                          type="button"
                          variant="destructive"
                          className="rounded-none border-2"
                          disabled={deletePlanMutation.isPending}
                          onClick={() => deletePlanMutation.mutate(plan.id)}
                        >
                          Delete
                        </Button>
                      </Can>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {editingPlan && (
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Edit plan #{editingPlan.id}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => void handleUpdate(e)} className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor="editPrice">Price</Label>
                      <Input
                        id="editPrice"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={String(editingPlan.price)}
                        onChange={(e) =>
                          setEditingPlan((prev) => (prev ? { ...prev, price: Number(e.target.value || 0) } : prev))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="editCurrency">Currency</Label>
                      <Input
                        id="editCurrency"
                        value={editingPlan.currency}
                        onChange={(e) =>
                          setEditingPlan((prev) =>
                            prev ? { ...prev, currency: e.target.value.toUpperCase() } : prev
                          )
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="editInterval">Interval</Label>
                      <select
                        id="editInterval"
                        className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5"
                        value={editingPlan.interval}
                        onChange={(e) =>
                          setEditingPlan((prev) =>
                            prev ? { ...prev, interval: e.target.value as Plan["interval"] } : prev
                          )
                        }
                      >
                        {Object.values(PlanInterval).map((interval) => (
                          <option key={interval} value={interval}>
                            {interval}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="editIntervalCount">Interval count</Label>
                      <Input
                        id="editIntervalCount"
                        type="number"
                        min="1"
                        step="1"
                        value={String(editingPlan.intervalCount)}
                        onChange={(e) =>
                          setEditingPlan((prev) =>
                            prev ? { ...prev, intervalCount: Number(e.target.value || 1) } : prev
                          )
                        }
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label htmlFor="editDescription">Description</Label>
                      <Input
                        id="editDescription"
                        value={editingPlan.description ?? ""}
                        onChange={(e) =>
                          setEditingPlan((prev) => (prev ? { ...prev, description: e.target.value } : prev))
                        }
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label htmlFor="editRazorpayPlanId">Razorpay Plan ID</Label>
                      <Input
                        id="editRazorpayPlanId"
                        value={editingPlan.razorpayPlanId ?? ""}
                        onChange={(e) =>
                          setEditingPlan((prev) =>
                            prev ? { ...prev, razorpayPlanId: e.target.value || null } : prev
                          )
                        }
                      />
                    </div>
                    <div className="sm:col-span-2 flex items-center gap-2">
                      <Checkbox
                        id="editIsActive"
                        checked={editingPlan.isActive}
                        onCheckedChange={(checked) =>
                          setEditingPlan((prev) => (prev ? { ...prev, isActive: Boolean(checked) } : prev))
                        }
                      />
                      <Label htmlFor="editIsActive">Active plan</Label>
                    </div>
                    <div className="sm:col-span-2 flex gap-2">
                      <Button
                        type="submit"
                        className="rounded-none border-2 font-black uppercase"
                        disabled={updatePlanMutation.isPending}
                      >
                        {updatePlanMutation.isPending ? "Saving..." : "Save changes"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-none border-2"
                        onClick={() => setEditingPlan(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </section>
        </Can>
      </div>
    </>
  );
}

"use client";

import React, { useMemo, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthContext } from "@/features/auth/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlans } from "@/features/plans/hooks/use-plans";
import { useProfileSubscriptions } from "@/features/profile/hooks/use-profile";
import { PlanInterval, type CreateSubscriptionResponse, type Plan } from "@/features/plans/types";
import apiClient from "@/shared/api/api-client";
import { cn } from "@/lib/utils";

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
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const pathname = usePathname();
  const urlSearchParams = useSearchParams();
  const [scriptReady, setScriptReady] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [payingPlanId, setPayingPlanId] = useState<number | null>(null);

  const activePlansQuery = usePlans({ page: 1, pageSize: 50, isActive: true });
  const subscriptionsQuery = useProfileSubscriptions(isAuthenticated);

  const activePlans = useMemo(() => activePlansQuery.data?.plans ?? [], [activePlansQuery.data?.plans]);
  /** Compare loosely: API may return plan id as string; must not block checkout on this query. */
  const activeSubscriptionPlanId = subscriptionsQuery.data?.activeSubscription?.plan?.id;
  const isSubscribedToPlan = (planId: number) =>
    activeSubscriptionPlanId != null && Number(activeSubscriptionPlanId) === planId;

  const fallbackRazorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  const selectedPlan =
    activePlans.find((plan) => plan.id === selectedPlanId) ?? activePlans[0] ?? null;

  const postAuthReturnPath = useMemo(() => {
    const qs = urlSearchParams.toString();
    return `${pathname}${qs ? `?${qs}` : ""}`;
  }, [pathname, urlSearchParams]);

  const loginHref = `/auth/login?redirect=${encodeURIComponent(postAuthReturnPath)}`;
  const registerHref = `/auth/register?redirect=${encodeURIComponent(postAuthReturnPath)}`;

  const openCheckout = async () => {
    if (!isAuthenticated) {
      toast.message("Please sign in or create an account to subscribe.");
      return;
    }
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
          await queryClient.invalidateQueries({ queryKey: ["profile", "subscriptions"] });
          await queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
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
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Subscription
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Choose a plan
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Select the billing option that fits you. Checkout is handled securely by Razorpay.
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
          <section className="flex flex-wrap justify-center gap-6">
            {activePlans.map((plan) => {
              const selected = selectedPlan?.id === plan.id;
              const paying = payingPlanId === plan.id;
              const isSubscribedHere = isSubscribedToPlan(plan.id);
              return (
                <Card
                  key={plan.id}
                  className={cn(
                    "w-full max-w-sm border border-border transition-colors",
                    isSubscribedHere && "border-primary ring-1 ring-primary/25",
                    selected && !isSubscribedHere && "border-primary/50 ring-1 ring-primary/15"
                  )}
                >
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <CardTitle className="text-lg font-semibold tracking-tight">{plan.name}</CardTitle>
                      {isSubscribedHere && (
                        <Badge className="shrink-0 font-semibold">Subscribed</Badge>
                      )}
                    </div>
                    <CardDescription>
                      {plan.description || "Access paid stories and full reading on premium titles."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-2xl font-semibold tracking-tight">
                      {formatPrice(plan.price, plan.currency)}
                      <span className="ml-1 text-xs font-medium text-muted-foreground">
                        / {intervalLabel(plan.interval, plan.intervalCount)}
                      </span>
                    </p>
                    <div className="flex flex-col gap-2">
                      {isSubscribedHere ? (
                        <p className="text-center text-xs font-medium text-muted-foreground">
                          You&apos;re currently on this plan.
                        </p>
                      ) : (
                        <>
                          <Button
                            type="button"
                            variant={selected ? "default" : "outline"}
                            size="sm"
                            className="w-full font-medium"
                            onClick={() => setSelectedPlanId(plan.id)}
                          >
                            {selected ? "Selected" : "Select plan"}
                          </Button>
                          {selected &&
                            (authLoading ? (
                              <Button type="button" size="sm" disabled className="w-full font-medium">
                                <Loader2 className="size-4 animate-spin" aria-hidden />
                                Checking session…
                              </Button>
                            ) : !isAuthenticated ? (
                              <div className="space-y-2 rounded-md border border-border bg-muted/30 p-3">
                                <p className="text-center text-xs font-medium text-muted-foreground">
                                  Sign in or register to continue with checkout.
                                </p>
                                <Button asChild size="sm" className="w-full font-medium">
                                  <Link href={loginHref}>Sign in</Link>
                                </Button>
                                <Button asChild variant="outline" size="sm" className="w-full font-medium">
                                  <Link href={registerHref}>Create account</Link>
                                </Button>
                              </div>
                            ) : (
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => void openCheckout()}
                                disabled={!scriptReady || Boolean(payingPlanId)}
                                className="w-full font-medium"
                              >
                                {paying ? (
                                  <>
                                    <Loader2 className="size-4 animate-spin" aria-hidden />
                                    Processing...
                                  </>
                                ) : (
                                  "Subscribe"
                                )}
                              </Button>
                            ))}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </section>
        )}
      </div>
    </>
  );
}

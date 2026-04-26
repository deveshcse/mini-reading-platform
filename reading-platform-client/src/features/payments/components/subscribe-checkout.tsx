"use client";

import React, { useMemo, useState } from "react";
import Script from "next/script";
import { toast } from "sonner";
import { Sparkles, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import apiClient from "@/shared/api/api-client";
import type {
  CreateOrderInput,
  CreateOrderResponse,
  RazorpayCheckoutSuccess,
  VerifyPaymentInput,
} from "@/features/payments/types";

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
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  handler: (response: RazorpayCheckoutSuccess) => void | Promise<void>;
  modal?: {
    ondismiss?: () => void;
  };
  prefill?: {
    name?: string;
    email?: string;
  };
  theme?: {
    color?: string;
  };
}

const PREMIUM_AMOUNT_PAISE = 50000;

export function SubscribeCheckout() {
  const [isPaying, setIsPaying] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);

  const fallbackKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  const orderPayload: CreateOrderInput = useMemo(
    () => ({
      amount: PREMIUM_AMOUNT_PAISE,
      currency: "INR",
      receipt: `sub_${Date.now()}`,
    }),
    []
  );

  const openCheckout = async () => {
    const RazorpayCtor = (window as Window & {
      Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
    }).Razorpay;
    if (!scriptReady || !RazorpayCtor) {
      toast.error("Payment gateway is still loading. Please try again.");
      return;
    }

    setIsPaying(true);
    try {
      const orderRes = await apiClient.post("/payments/create-order", orderPayload);
      const order = orderRes.data?.data as CreateOrderResponse;

      if (!order?.order_id || !order?.amount || !order?.currency) {
        throw new Error("Order creation failed. Invalid response from server.");
      }

      const razorpayKey = order.key_id || fallbackKey;
      if (!razorpayKey) {
        throw new Error("Missing Razorpay key. Set NEXT_PUBLIC_RAZORPAY_KEY_ID.");
      }

      const rzp = new RazorpayCtor({
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        order_id: order.order_id,
        name: "Mini Reading Platform",
        description: "Premium subscription",
        handler: async (response: RazorpayCheckoutSuccess) => {
          const verifyPayload: VerifyPaymentInput = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          };

          await apiClient.post("/payments/verify-payment", verifyPayload);
          toast.success("Payment verified successfully. Premium access unlocked.");
          setIsPaying(false);
        },
        modal: {
          ondismiss: () => {
            toast.message("Payment cancelled by user.");
            setIsPaying(false);
          },
        },
        theme: { color: "#7c3aed" },
      });

      rzp.on("payment.failed", (resp: RazorpayFailureResponse) => {
        toast.error(resp.error?.description || "Payment failed. Please try again.");
        setIsPaying(false);
      });

      rzp.open();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to start payment. Please try again.";
      toast.error(message);
      setIsPaying(false);
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />

      <section className="border-2 bg-card p-6 sm:p-8">
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
              Premium Plan
            </p>
            <h1 className="text-2xl font-black uppercase tracking-tight sm:text-3xl">
              Unlock all premium stories
            </h1>
            <p className="text-sm text-muted-foreground">
              Pay once to start your premium subscription and continue reading full content.
            </p>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black">INR 500</span>
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              one-time test payment
            </span>
          </div>

          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" aria-hidden />
              Instant access to premium stories
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" aria-hidden />
              Secured by Razorpay signature verification
            </li>
          </ul>

          <Button
            type="button"
            onClick={() => void openCheckout()}
            disabled={!scriptReady || isPaying}
            className="h-11 w-full rounded-none border-2 font-black uppercase tracking-widest"
          >
            {isPaying ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Processing...
              </>
            ) : (
              "Pay with Razorpay"
            )}
          </Button>
        </div>
      </section>
    </>
  );
}

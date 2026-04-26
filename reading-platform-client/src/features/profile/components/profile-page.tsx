"use client";

import React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProfileActivity, useProfileMe, useProfilePayments, useProfileSubscriptions } from "@/features/profile/hooks/use-profile";
import type {
  ProfilePayment,
  ProfilePaymentSubscription,
  ProfileSubscription,
} from "@/features/profile/types";

function dateFmt(value: string) {
  return new Date(value).toLocaleString();
}

function moneyFmt(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount);
}

function intervalFmt(interval: string, intervalCount: number) {
  const i = interval.toLowerCase();
  return intervalCount > 1 ? `${intervalCount} ${i}` : i;
}

function DetailRows({ rows }: { rows: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="grid gap-2 sm:grid-cols-[minmax(7.5rem,auto)_1fr] sm:gap-x-4">
      {rows.map(({ label, value }) => (
        <React.Fragment key={label}>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
          <dd className="min-w-0 text-sm wrap-break-word text-foreground">{value}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}

function SubscriptionPaymentsTable({ payments }: { payments: ProfilePayment[] }) {
  if (!payments.length) return null;
  return (
    <div className="space-y-2 overflow-x-auto">
      <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">Payments for this subscription</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Razorpay payment</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="whitespace-nowrap text-xs">{dateFmt(p.createdAt)}</TableCell>
              <TableCell className="whitespace-nowrap text-xs">{moneyFmt(p.amount, p.currency)}</TableCell>
              <TableCell className="text-xs">{p.provider}</TableCell>
              <TableCell>
                <Badge variant={p.status === "SUCCESS" ? "default" : "outline"} className="rounded-none text-[10px] uppercase">
                  {p.status}
                </Badge>
              </TableCell>
              <TableCell className="max-w-[140px] font-mono text-[10px] break-all">
                {p.razorpayPaymentId ?? "—"}
              </TableCell>
              <TableCell className="max-w-[120px] font-mono text-[10px] break-all">
                {p.razorpayOrderId ?? "—"}
              </TableCell>
              <TableCell className="max-w-[180px] text-xs text-muted-foreground">
                {[
                  p.failureReason ? `Error: ${p.failureReason}` : null,
                  p.refundedAt ? `Refunded ${dateFmt(p.refundedAt)}` : null,
                ]
                  .filter(Boolean)
                  .join(" · ") || "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function BillingSubscriptionCell({ sub }: { sub: ProfilePaymentSubscription }) {
  const plan = sub.plan;
  return (
    <div className="max-w-[min(100%,20rem)] space-y-1.5 text-xs">
      <p className="font-semibold leading-tight">{plan.name}</p>
      {plan.description ? (
        <p className="text-[11px] leading-snug text-muted-foreground">{plan.description}</p>
      ) : null}
      <p className="text-muted-foreground">
        {moneyFmt(plan.price, plan.currency)} · {intervalFmt(plan.interval, plan.intervalCount)}
      </p>
      <div className="flex flex-wrap items-center gap-2 pt-0.5">
        <Badge variant={sub.status === "ACTIVE" ? "default" : "outline"} className="rounded-none text-[10px] uppercase">
          {sub.status}
        </Badge>
      </div>
      <p className="text-[10px] text-muted-foreground">
        <span className="font-medium text-foreground/80">Period:</span> {dateFmt(sub.startDate)} — {dateFmt(sub.endDate)}
      </p>
      {sub.razorpaySubscriptionId ? (
        <p className="font-mono text-[10px] wrap-break-word text-muted-foreground">{sub.razorpaySubscriptionId}</p>
      ) : null}
    </div>
  );
}

function SubscriptionDetailCard({ sub, title }: { sub: ProfileSubscription; title: string }) {
  const plan = sub.plan;
  const payments = sub.payments ?? [];

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Plan", value: <span className="font-medium">{plan.name}</span> },
    {
      label: "Price",
      value: `${moneyFmt(plan.price, plan.currency)} / ${intervalFmt(plan.interval, plan.intervalCount)}`,
    },
  ];

  if (plan.description) {
    rows.push({ label: "Plan description", value: plan.description });
  }
  if (plan.razorpayPlanId) {
    rows.push({
      label: "Razorpay plan id",
      value: <span className="font-mono text-xs break-all">{plan.razorpayPlanId}</span>,
    });
  }

  rows.push(
    { label: "Started", value: dateFmt(sub.startDate) },
    { label: "Current period ends", value: dateFmt(sub.endDate) },
    { label: "Record created", value: dateFmt(sub.createdAt) },
    { label: "Last updated", value: dateFmt(sub.updatedAt) }
  );

  if (sub.razorpaySubscriptionId) {
    rows.push({
      label: "Razorpay subscription",
      value: <span className="font-mono text-xs break-all">{sub.razorpaySubscriptionId}</span>,
    });
  }

  return (
    <Card className="border-2">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base font-black uppercase">{title}</CardTitle>
          <Badge
            variant={sub.status === "ACTIVE" ? "default" : "outline"}
            className="rounded-none text-[10px] uppercase"
          >
            {sub.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <DetailRows rows={rows} />
        <SubscriptionPaymentsTable payments={payments} />
      </CardContent>
    </Card>
  );
}

export function ProfilePage() {
  const [activeTab, setActiveTab] = React.useState("subscriptions");

  const meQuery = useProfileMe();
  const subscriptionsQuery = useProfileSubscriptions(activeTab === "subscriptions");
  const paymentsQuery = useProfilePayments(activeTab === "billing");
  const activityQuery = useProfileActivity(activeTab === "activity");

  if (meQuery.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary/50" />
      </div>
    );
  }

  if (meQuery.error || !meQuery.data) {
    return (
      <Card className="border-2">
        <CardContent className="py-8 text-center text-sm font-bold text-muted-foreground">
          Failed to load profile.
        </CardContent>
      </Card>
    );
  }

  const { user, account, stats, activeSubscription } = meQuery.data;

  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-2xl font-black uppercase tracking-tight">
              {user.firstName} {user.lastName}
            </CardTitle>
            <Badge variant="secondary" className="rounded-none uppercase">
              {user.role}
            </Badge>
            {activeSubscription ? (
              <Badge className="rounded-none uppercase">Active Plan: {activeSubscription.plan.name}</Badge>
            ) : (
              <Badge variant="outline" className="rounded-none uppercase">
                No active subscription
              </Badge>
            )}
          </div>
          <CardDescription className="text-sm">
            {user.email} · Joined {dateFmt(account.createdAt)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-xs font-bold uppercase sm:grid-cols-5">
            <div className="border-2 p-3">Stories: {stats.storiesCount}</div>
            <div className="border-2 p-3">Comments: {stats.commentsCount}</div>
            <div className="border-2 p-3">Bookmarks: {stats.bookmarksCount}</div>
            <div className="border-2 p-3">Payments: {stats.paymentsCount}</div>
            <div className="border-2 p-3">Subscriptions: {stats.subscriptionsCount}</div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="line" className="w-full justify-start rounded-none border-b-2 bg-transparent p-0">
          <TabsTrigger value="subscriptions" className="rounded-none px-4 py-2 font-black uppercase text-xs">
            Subscriptions
          </TabsTrigger>
          <TabsTrigger value="billing" className="rounded-none px-4 py-2 font-black uppercase text-xs">
            Billing
          </TabsTrigger>
          <TabsTrigger value="activity" className="rounded-none px-4 py-2 font-black uppercase text-xs">
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="pt-4">
          {subscriptionsQuery.isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="size-6 animate-spin text-primary/50" />
            </div>
          ) : subscriptionsQuery.error ? (
            <p className="text-sm text-muted-foreground">Failed to load subscriptions.</p>
          ) : (
            <div className="space-y-4">
              {subscriptionsQuery.data?.activeSubscription && (
                <SubscriptionDetailCard
                  sub={subscriptionsQuery.data.activeSubscription}
                  title="Active subscription"
                />
              )}

              {(() => {
                const active = subscriptionsQuery.data?.activeSubscription;
                const all = subscriptionsQuery.data?.subscriptions ?? [];
                const pastSubs = active ? all.filter((s) => s.id !== active.id) : all;
                return (
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                      {active ? "Other subscriptions" : "All subscriptions"}
                    </h3>
                    {pastSubs.length === 0 ? (
                      <Card className="border-2">
                        <CardContent className="py-6 text-center text-sm text-muted-foreground">
                          {active ? "No past subscription records." : "No subscription records yet."}
                        </CardContent>
                      </Card>
                    ) : (
                      pastSubs.map((sub) => (
                        <SubscriptionDetailCard
                          key={sub.id}
                          sub={sub}
                          title={`${sub.plan.name} · ${sub.status}`}
                        />
                      ))
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </TabsContent>

        <TabsContent value="billing" className="pt-4">
          {paymentsQuery.isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="size-6 animate-spin text-primary/50" />
            </div>
          ) : paymentsQuery.error ? (
            <p className="text-sm text-muted-foreground">Failed to load payments.</p>
          ) : (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-base font-black uppercase">Payment history</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Plan & subscription</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Payment status</TableHead>
                      <TableHead>Razorpay payment</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentsQuery.data?.payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="whitespace-nowrap align-top text-xs">
                          {dateFmt(payment.createdAt)}
                        </TableCell>
                        <TableCell className="align-top">
                          {payment.subscription ? (
                            <BillingSubscriptionCell sub={payment.subscription} />
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap align-top text-xs">
                          {moneyFmt(payment.amount, payment.currency)}
                        </TableCell>
                        <TableCell className="align-top text-xs">{payment.provider}</TableCell>
                        <TableCell className="align-top">
                          <Badge
                            variant={payment.status === "SUCCESS" ? "default" : "outline"}
                            className="rounded-none text-[10px] uppercase"
                          >
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[140px] align-top font-mono text-[10px] wrap-break-word">
                          {payment.razorpayPaymentId ?? "—"}
                        </TableCell>
                        <TableCell className="max-w-[180px] align-top text-xs text-muted-foreground">
                          {[
                            payment.razorpayOrderId ? `Order: ${payment.razorpayOrderId}` : null,
                            payment.failureReason ? `Error: ${payment.failureReason}` : null,
                            payment.refundedAt ? `Refunded ${dateFmt(payment.refundedAt)}` : null,
                          ]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activity" className="pt-4">
          {activityQuery.isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="size-6 animate-spin text-primary/50" />
            </div>
          ) : activityQuery.error ? (
            <p className="text-sm text-muted-foreground">Failed to load activity.</p>
          ) : (
            <div className="grid gap-4">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-sm font-black uppercase">Recent stories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {activityQuery.data?.recentStories.length ? (
                    activityQuery.data.recentStories.map((story) => (
                      <Link key={story.id} href={`/stories/${story.id}`} className="block border-2 p-2 hover:border-primary/40">
                        {story.title}
                      </Link>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No stories yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

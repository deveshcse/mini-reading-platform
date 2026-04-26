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

function dateFmt(value: string) {
  return new Date(value).toLocaleString();
}

function moneyFmt(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount);
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
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-base font-black uppercase">Current plan</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p>
                      {subscriptionsQuery.data.activeSubscription.plan.name} ·{" "}
                      {moneyFmt(
                        subscriptionsQuery.data.activeSubscription.plan.price,
                        subscriptionsQuery.data.activeSubscription.plan.currency
                      )}
                    </p>
                    <p className="text-muted-foreground">
                      Active until {dateFmt(subscriptionsQuery.data.activeSubscription.endDate)}
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-base font-black uppercase">History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {subscriptionsQuery.data?.subscriptions.map((sub) => (
                    <div key={sub.id} className="border-2 p-3 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-bold uppercase">
                          {sub.plan.name} · {sub.status}
                        </p>
                        <span className="text-xs text-muted-foreground">{dateFmt(sub.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
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
                      <TableHead>Plan</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentsQuery.data?.payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{dateFmt(payment.createdAt)}</TableCell>
                        <TableCell>{payment.subscription?.plan?.name ?? "-"}</TableCell>
                        <TableCell>{moneyFmt(payment.amount, payment.currency)}</TableCell>
                        <TableCell>
                          <Badge variant={payment.status === "SUCCESS" ? "default" : "outline"}>
                            {payment.status}
                          </Badge>
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
            <div className="grid gap-4 md:grid-cols-3">
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

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-sm font-black uppercase">Recent comments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {activityQuery.data?.recentComments.length ? (
                    activityQuery.data.recentComments.map((comment) => (
                      <div key={comment.id} className="border-2 p-2">
                        {comment.content}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No comments yet.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-sm font-black uppercase">Bookmarks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {activityQuery.data?.bookmarks.length ? (
                    activityQuery.data.bookmarks.map((bookmark) => (
                      <Link
                        key={bookmark.id}
                        href={`/stories/${bookmark.story.id}`}
                        className="block border-2 p-2 hover:border-primary/40"
                      >
                        {bookmark.story.title}
                      </Link>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No bookmarks yet.</p>
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

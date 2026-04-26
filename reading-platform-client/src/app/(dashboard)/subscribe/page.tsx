import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PlansSubscriptionPage } from "@/features/plans/components/plans-subscription-page";
import { PageBackLink } from "@/shared/components/page-back-link";
import { dashboardPageShell } from "@/shared/lib/dashboard-shell";

export default function SubscribePage() {
  return (
    <div className={dashboardPageShell}>
      <PageBackLink href="/stories" label="Back to feed" />
      <div className="mx-auto mt-2 w-full max-w-6xl">
        <Suspense
          fallback={
            <div className="flex min-h-[25vh] items-center justify-center">
              <Loader2 className="size-8 animate-spin text-primary/50" aria-hidden />
            </div>
          }
        >
          <PlansSubscriptionPage />
        </Suspense>
      </div>
    </div>
  );
}

import { PlansSubscriptionPage } from "@/features/plans/components/plans-subscription-page";
import { PageBackLink } from "@/shared/components/page-back-link";
import { dashboardPageShell } from "@/shared/lib/dashboard-shell";

export default function SubscribePage() {
  return (
    <div className={dashboardPageShell}>
      <PageBackLink href="/stories" label="Back to feed" />
      <div className="mx-auto mt-2 w-full max-w-6xl">
        <PlansSubscriptionPage />
      </div>
    </div>
  );
}

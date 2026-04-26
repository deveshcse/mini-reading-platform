import { ProfilePage } from "@/features/profile/components/profile-page";
import { PageBackLink } from "@/shared/components/page-back-link";
import { dashboardPageShell } from "@/shared/lib/dashboard-shell";

export default function Page() {
  return (
    <div className={dashboardPageShell}>
      <PageBackLink href="/stories" label="Back to feed" />
      <ProfilePage />
    </div>
  );
}

import { ResetPasswordForm } from "@/features/auth/components/reset-password-form"
import { PageBackLink } from "@/shared/components/page-back-link"
import { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <PageBackLink href="/login" label="Back to sign in" className="mb-3" />
        {/* Suspense is required for useSearchParams() in Next.js Client Components */}
        <Suspense fallback={<div>Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}

import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form"
import { PageBackLink } from "@/shared/components/page-back-link"

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <PageBackLink href="/login" label="Back to sign in" className="mb-3" />
        <ForgotPasswordForm />
      </div>
    </div>
  )
}


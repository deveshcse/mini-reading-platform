import { Suspense } from "react"
import { LoginForm } from "@/features/auth/components/login-form"
import { PageBackLink } from "@/shared/components/page-back-link"

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <PageBackLink href="/" label="Back to home" className="mb-3" />
        <Suspense fallback={<div className="h-64 animate-pulse rounded-md bg-muted" aria-hidden />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}

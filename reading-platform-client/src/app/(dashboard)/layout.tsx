import { AuthGuard } from "@/features/auth/components/auth-guard"
import { Header } from "@/shared/components/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden">
        <Header />
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          {children}
        </main>
      </div>
    </AuthGuard>
  )
}

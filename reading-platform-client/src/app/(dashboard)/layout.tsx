import { AuthGuard } from "@/features/auth/components/auth-guard"
import { Header } from "@/shared/components/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </AuthGuard>
  )
}

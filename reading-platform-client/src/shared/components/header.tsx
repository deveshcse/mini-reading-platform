"use client"

import React, { useState } from "react"
import { useAuthContext } from "@/features/auth/components/auth-provider"
import { Button } from "@/components/ui/button"
import { LogOut, Menu, User as UserIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Can } from "@/shared/components/can"
import { dashboardHeaderShell } from "@/shared/lib/dashboard-shell"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export type HeaderVariant = "default" | "public"

export interface HeaderProps {
  variant?: HeaderVariant
}

export function Header({ variant = "default" }: HeaderProps) {
  const { user, logout, isLoading } = useAuthContext()
  const pathname = usePathname()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const isPublic = variant === "public"
  const isSubscribeRoute = pathname === "/subscribe"

  const closeMobile = () => setMobileNavOpen(false)

  const showLogout = Boolean(user)
  const showGuestAuth = !isLoading && !user

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div
        className={cn(
          dashboardHeaderShell,
          "flex h-14 items-center justify-between gap-3 sm:h-16 sm:gap-4"
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Link
            href="/"
            className="group flex min-w-0 shrink-0 items-center gap-2"
          >
            <div className="flex size-9 shrink-0 items-center justify-center border-2 border-primary bg-primary text-primary-foreground transition-colors group-hover:bg-primary/90 sm:size-10">
              <span className="text-lg font-bold sm:text-xl">R</span>
            </div>
            <span className="hidden truncate text-base font-bold uppercase tracking-tighter sm:inline-block sm:text-lg md:text-xl">
              Reading
            </span>
          </Link>
        </div>

        <nav
          className="hidden items-center gap-5 text-[10px] font-black uppercase tracking-widest md:flex lg:gap-6 lg:text-xs"
          aria-label="Main"
        >
          <Link
            href="/stories"
            className="shrink-0 transition-colors hover:text-primary"
          >
            Stories
          </Link>
          <Can resource="story" action="create">
            <Link
              href="/stories/my"
              className="shrink-0 transition-colors hover:text-primary"
            >
              My stories
            </Link>
          </Can>
          <Link
            href="/subscribe"
            className={cn(
              "shrink-0 transition-colors hover:text-primary",
              isSubscribeRoute && "text-foreground"
            )}
            aria-current={isSubscribeRoute ? "page" : undefined}
          >
            SUBSCRIPTION
          </Link>
          <Can resource="plan" action="create">
            <Link
              href="/plans/manage"
              className="shrink-0 transition-colors hover:text-primary"
            >
              Manage plans
            </Link>
          </Can>
          {user && (
            <Link
              href="/profile"
              className="shrink-0 transition-colors hover:text-primary"
            >
              Profile
            </Link>
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3">
          {user && !isPublic && (
            <div className="hidden items-center gap-2 text-xs font-medium md:flex">
              <div className="flex size-7 items-center justify-center rounded-md border border-border bg-muted/60">
                <UserIcon className="size-3.5 text-muted-foreground" aria-hidden />
              </div>
              <span className="max-w-25 truncate text-foreground lg:max-w-35">
                {user.firstName} {user.lastName}
              </span>
            </div>
          )}

          {user && isPublic && (
            <Link
              href="/stories"
              className="hidden size-9 items-center justify-center border-2 border-primary bg-primary/15 text-sm font-black uppercase text-primary transition-colors hover:bg-primary/25 md:flex"
              aria-label={`${user.firstName} — open feed`}
            >
              {(user.firstName?.trim().charAt(0) || "?").toUpperCase()}
            </Link>
          )}

          {showGuestAuth && (
            <div className="hidden items-center gap-2 md:flex">
              <Button asChild variant="outline" size="sm" className="rounded-md font-medium">
                <Link href="/auth/register">Register</Link>
              </Button>
              <Button asChild size="sm" className="rounded-md font-medium">
                <Link href="/auth/login">Sign in</Link>
              </Button>
            </div>
          )}

          {showLogout && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void logout()}
              className="hidden gap-1.5 rounded-md border-destructive/35 text-destructive md:inline-flex"
            >
              <LogOut className="size-3.5 shrink-0" aria-hidden />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          )}

          <div className="md:hidden">
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="shrink-0 rounded-md border"
                  aria-label="Open menu"
                >
                  <Menu className="size-5" aria-hidden />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="flex w-[min(100vw-1rem,20rem)] flex-col gap-0 border-l-2 p-0 sm:max-w-sm"
              >
                <SheetHeader className="border-b-2 border-border p-4 text-left">
                  <SheetTitle className="text-xs font-black uppercase tracking-widest">
                    Menu
                  </SheetTitle>
                  {user && (
                    <p className="mt-2 text-sm font-bold uppercase tracking-tight text-muted-foreground">
                      {isPublic ? (
                        <span className="inline-flex size-10 items-center justify-center border-2 border-primary bg-primary/15 font-black text-primary">
                          {(user.firstName?.trim().charAt(0) || "?").toUpperCase()}
                        </span>
                      ) : (
                        <>
                          {user.firstName} {user.lastName}
                        </>
                      )}
                    </p>
                  )}
                </SheetHeader>
                <nav
                  className="flex flex-col gap-1 p-4"
                  aria-label="Mobile"
                >
                  <Link
                    href="/stories"
                    onClick={closeMobile}
                    className="rounded-none border-2 border-transparent px-3 py-3 text-xs font-black uppercase tracking-widest transition-colors hover:border-primary/30 hover:bg-muted/50"
                  >
                    Stories
                  </Link>
                  <Can resource="story" action="create">
                    <Link
                      href="/stories/my"
                      onClick={closeMobile}
                      className="rounded-none border-2 border-transparent px-3 py-3 text-xs font-black uppercase tracking-widest transition-colors hover:border-primary/30 hover:bg-muted/50"
                    >
                      My stories
                    </Link>
                  </Can>
                  <Link
                    href="/subscribe"
                    onClick={closeMobile}
                    className="rounded-none border-2 border-transparent px-3 py-3 text-xs font-black uppercase tracking-widest transition-colors hover:border-primary/30 hover:bg-muted/50"
                  >
                    SUBSCRIPTION
                  </Link>
                  <Can resource="plan" action="create">
                    <Link
                      href="/plans/manage"
                      onClick={closeMobile}
                      className="rounded-none border-2 border-transparent px-3 py-3 text-xs font-black uppercase tracking-widest transition-colors hover:border-primary/30 hover:bg-muted/50"
                    >
                      Manage plans
                    </Link>
                  </Can>
                  {user && (
                    <Link
                      href="/profile"
                      onClick={closeMobile}
                      className="rounded-none border-2 border-transparent px-3 py-3 text-xs font-black uppercase tracking-widest transition-colors hover:border-primary/30 hover:bg-muted/50"
                    >
                      Profile
                    </Link>
                  )}
                  {showGuestAuth && (
                    <>
                      <Link
                        href="/auth/register"
                        onClick={closeMobile}
                        className="rounded-none border-2 border-transparent px-3 py-3 text-xs font-black uppercase tracking-widest transition-colors hover:border-primary/30 hover:bg-muted/50"
                      >
                        Register
                      </Link>
                      <Link
                        href="/auth/login"
                        onClick={closeMobile}
                        className="rounded-none border-2 border-transparent px-3 py-3 text-xs font-black uppercase tracking-widest transition-colors hover:border-primary/30 hover:bg-muted/50"
                      >
                        Sign in
                      </Link>
                    </>
                  )}
                </nav>
                {showLogout ? (
                  <SheetFooter className="border-t-2 border-border p-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full rounded-md border-destructive/35 font-medium text-destructive"
                      onClick={() => {
                        closeMobile()
                        void logout()
                      }}
                    >
                      <LogOut className="size-3.5 shrink-0" aria-hidden />
                      Logout
                    </Button>
                  </SheetFooter>
                ) : showGuestAuth ? (
                  <SheetFooter className="flex flex-col gap-2 border-t-2 border-border p-4">
                    <Button
                      asChild
                      size="sm"
                      className="w-full rounded-md font-medium"
                    >
                      <Link href="/auth/login" onClick={closeMobile}>
                        Sign in
                      </Link>
                    </Button>
                  </SheetFooter>
                ) : null}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

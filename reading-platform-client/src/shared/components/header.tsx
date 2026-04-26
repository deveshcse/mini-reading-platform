"use client"

import React, { useState } from "react"
import { useAuthContext } from "@/features/auth/components/auth-provider"
import { Button } from "@/components/ui/button"
import { LogOut, Menu, User as UserIcon } from "lucide-react"
import Link from "next/link"
import { Can } from "@/shared/components/can"
import { dashboardHeaderShell } from "@/shared/lib/dashboard-shell"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export function Header() {
  const { user, logout } = useAuthContext()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const closeMobile = () => setMobileNavOpen(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
            Feed
          </Link>
          <Can resource="story" action="create">
            <Link
              href="/stories/my"
              className="shrink-0 transition-colors hover:text-primary"
            >
              My stories
            </Link>
          </Can>
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3">
          {user && (
            <div className="hidden items-center gap-2 text-xs font-bold md:flex md:text-sm">
              <div className="flex size-8 items-center justify-center border-2 border-muted-foreground/20 bg-muted sm:size-9">
                <UserIcon className="size-3.5 text-muted-foreground sm:size-4" />
              </div>
              <span className="max-w-[100px] truncate uppercase tracking-tight lg:max-w-[140px]">
                {user.firstName} {user.lastName}
              </span>
            </div>
          )}

          <Button
            variant="destructive"
            size="sm"
            onClick={logout}
            className="h-9 gap-1.5 rounded-none border-2 border-destructive px-2.5 font-bold transition-all hover:translate-y-[-1px] hover:bg-destructive/90 active:translate-y-0 sm:h-10 sm:gap-2 sm:px-4"
          >
            <LogOut className="size-3.5 sm:size-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>

          <div className="md:hidden">
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-lg"
                  className="shrink-0 rounded-none border-2"
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
                      {user.firstName} {user.lastName}
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
                    Feed
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
                    Plans
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

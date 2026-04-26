"use client"

import React from "react";
import { useAuthContext } from "@/features/auth/components/auth-provider";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { Can } from "@/shared/components/can";

export function Header() {
    const { user, logout } = useAuthContext();

    return (
        <header className="sticky top-0 z-50 w-full border-b-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="app-content flex h-14 items-center justify-between gap-4 sm:h-16">
                <div className="flex min-w-0 items-center gap-2">
                    <Link href="/" className="flex min-w-0 items-center gap-2 group shrink-0">
                        <div className="flex size-9 shrink-0 items-center justify-center border-2 border-primary bg-primary text-primary-foreground transition-colors group-hover:bg-primary/90 sm:size-10">
                            <span className="text-lg font-bold sm:text-xl">R</span>
                        </div>
                        <span className="hidden truncate text-lg font-bold uppercase tracking-tighter sm:inline-block md:text-xl">
                            Reading
                        </span>
                    </Link>
                </div>

                <nav className="hidden items-center gap-5 text-[10px] font-black uppercase tracking-widest md:flex lg:gap-6 lg:text-xs">
                    <Link href="/stories" className="shrink-0 transition-colors hover:text-primary">
                        Feed
                    </Link>
                    <Can resource="story" action="create">
                        <Link href="/stories/my" className="shrink-0 transition-colors hover:text-primary">
                            My stories
                        </Link>
                    </Can>
                </nav>

                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                    {user && (
                        <div className="hidden items-center gap-2 text-xs font-bold sm:flex sm:text-sm">
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
                        className="h-9 gap-1.5 rounded-none border-2 border-destructive px-3 font-bold transition-all hover:translate-y-[-1px] hover:bg-destructive/90 active:translate-y-0 sm:h-10 sm:gap-2 sm:px-4"
                    >
                        <LogOut className="size-3.5 sm:size-4" />
                        <span className="hidden sm:inline">Logout</span>
                    </Button>
                </div>
            </div>
        </header>
    );
}

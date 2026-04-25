"use client"

import React from "react";
import { useAuthContext } from "@/features/auth/components/auth-provider";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon } from "lucide-react";

export function Header() {
    const { user, logout } = useAuthContext();

    return (
        <header className="sticky top-0 z-50 w-full border-b-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-8">
            <div className="flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center bg-primary text-primary-foreground border-2 border-primary">
                        <span className="font-bold text-xl">R</span>
                    </div>
                    <span className="font-bold text-xl hidden sm:inline-block tracking-tighter uppercase">Reading Platform</span>
                </div>

                <div className="flex items-center gap-4 sm:gap-6">
                    {user && (
                        <div className="flex items-center gap-3 text-sm font-bold">
                            <div className="flex h-9 w-9 items-center justify-center bg-muted border-2 border-muted-foreground/20">
                                <UserIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <span className="max-w-[150px] truncate uppercase tracking-tight">
                                {user.firstName} {user.lastName}
                            </span>
                        </div>
                    )}

                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={logout}
                        className="rounded-none gap-2 h-10 px-4 border-2 border-destructive hover:bg-destructive/90 transition-all hover:translate-y-[-1px] active:translate-y-[0px] font-bold"
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="hidden sm:inline">Logout</span>
                    </Button>
                </div>
            </div>
        </header>
    );
}

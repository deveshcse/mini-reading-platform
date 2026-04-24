"use client"

import React from "react";
import { useAuthContext } from "@/features/auth/components/auth-provider";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

export function Header() {
    const { user, logout } = useAuthContext();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-8">
            <div className=" flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <span className="font-bold text-lg">T</span>
                    </div>
                    <span className="font-bold text-xl hidden sm:inline-block tracking-tight">TaskFlow</span>
                </div>

                <div className="flex items-center gap-4 sm:gap-6">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                            <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="max-w-[120px] truncate capitalize">{user?.name}</span>

                    </div>

                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={logout}
                        className="gap-2 h-9 px-4 shadow-sm"
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="hidden sm:inline">Logout</span>
                    </Button>
                </div>
            </div>
        </header>
    );
}

"use client"

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/features/auth/components/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

import { TooltipProvider } from "@/components/ui/tooltip";

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
                retry: false,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <AuthProvider>
                    <TooltipProvider>
                        {children}
                        <Toaster position="top-right" richColors />
                    </TooltipProvider>
                </AuthProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
};

"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PageBackLinkProps {
  href: string;
  label: string;
  className?: string;
}

/**
 * Explicit in-app back control (stable destination, not browser history).
 */
export function PageBackLink({ href, label, className }: PageBackLinkProps) {
  return (
    <Button
      asChild
      variant="ghost"
      size="sm"
      className={cn(
        "-ms-2 mb-1 h-auto rounded-none px-2 py-1.5 font-bold uppercase tracking-widest text-xs text-muted-foreground hover:text-foreground",
        className
      )}
    >
      <Link href={href} className="inline-flex items-center gap-2">
        <ArrowLeft className="size-4 shrink-0" aria-hidden />
        {label}
      </Link>
    </Button>
  );
}

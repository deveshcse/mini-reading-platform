"use client";

import React from "react";
import Link from "next/link";
import type { StoriesMeta, Story } from "@/features/stories/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BookMarked,
  BookOpen,
  Loader2,
  AlertCircle,
  Lock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_PAGE_SIZE_OPTIONS = [6, 9, 12, 24] as const;

export interface StoryListProps {
  stories: Story[] | undefined;
  isLoading: boolean;
  error: unknown;
  className?: string;
  emptyMessage?: string;
  /** When set with `onPageChange`, prev/next controls are shown under the grid. */
  meta?: StoriesMeta;
  onPageChange?: (page: number) => void;
  /** Current page size (for the optional per-page selector). */
  pageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: readonly number[];
}

export function StoryList({
  stories,
  isLoading,
  error,
  className,
  emptyMessage = "No stories in this list yet.",
  meta,
  onPageChange,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: StoryListProps) {
  if (isLoading) {
    return (
      <div className={cn("flex min-h-[40vh] flex-col items-center justify-center gap-3", className)}>
        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
          Loading
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center", className)}>
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm font-bold text-muted-foreground">
          Could not load stories. Try again later.
        </p>
      </div>
    );
  }

  if (!stories?.length) {
    return (
      <div className={cn("flex min-h-[40vh] flex-col items-center justify-center gap-4 border-2 border-dashed border-muted-foreground/25 p-12 text-center", className)}>
        <BookOpen className="h-10 w-10 text-muted-foreground/40" />
        <p className="max-w-xs text-sm font-bold uppercase tracking-tight text-muted-foreground">
          {emptyMessage}
        </p>
      </div>
    );
  }

  const showPager = Boolean(meta && onPageChange);
  const showPageSize =
    typeof pageSize === "number" &&
    typeof onPageSizeChange === "function" &&
    showPager;

  const gridClass = cn(
    "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3",
    !showPager && className
  );

  const list = (
    <ul className={gridClass}>
      {stories.map((story) => {
        const author = story.author;
        const isPremium = story.isPremium;
        const teaser = story.description?.trim() || null;

        return (
          <li key={story.id}>
            <Link href={`/stories/${story.id}`} className="block h-full group">
              <article
                className={cn(
                  "flex h-full flex-col overflow-hidden border-2 transition-colors",
                  isPremium
                    ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-500/70"
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                {/* Cover image */}
                {story.coverImage && (
                  <div className="relative aspect-[16/9] w-full overflow-hidden border-b-2 border-inherit bg-muted">
                    <img
                      src={story.coverImage}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                )}

                {/* Card body */}
                <div className="flex flex-1 flex-col gap-3 p-4">

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {!story.isPublished && (
                      <Badge
                        variant="secondary"
                        className="rounded-none text-[9px] font-black uppercase h-5"
                      >
                        Draft
                      </Badge>
                    )}
                    {isPremium && (
                      <Badge className="rounded-none border-2 border-amber-600/40 bg-amber-500/15 text-amber-900 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-100 h-5">
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase">
                          <BookMarked className="size-3" aria-hidden />
                          Premium
                        </span>
                      </Badge>
                    )}
                  </div>

                  {/* Title */}
                  <h2
                    className={cn(
                      "line-clamp-2 text-base font-black uppercase leading-tight tracking-tight transition-colors",
                      isPremium
                        ? "text-amber-950 dark:text-amber-100 group-hover:text-amber-800 dark:group-hover:text-amber-200"
                        : "group-hover:text-primary"
                    )}
                  >
                    {story.title}
                  </h2>

                  {/* Author */}
                  {author && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {author.firstName} {author.lastName}
                    </p>
                  )}

                  {/* Teaser or premium placeholder */}
                  <p
                    className={cn(
                      "line-clamp-3 flex-1 text-xs leading-relaxed",
                      isPremium ? "text-foreground/70" : "text-muted-foreground"
                    )}
                  >
                    {teaser ?? (
                      isPremium
                        ? "Subscribers only. Open to read a free preview."
                        : null
                    )}
                  </p>

                  {/* CTA row */}
                  <p
                    className={cn(
                      "mt-auto flex items-center gap-1 pt-1 text-[10px] font-black uppercase tracking-widest transition-colors",
                      isPremium
                        ? "text-amber-700 dark:text-amber-300 group-hover:text-amber-600"
                        : "text-muted-foreground group-hover:text-primary"
                    )}
                  >
                    {isPremium ? (
                      <>
                        <Lock className="size-3" aria-hidden />
                        Read preview
                      </>
                    ) : (
                      "Read story"
                    )}
                    <ArrowRight className="size-3 ml-auto transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </p>
                </div>
              </article>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  if (!showPager || !meta || !onPageChange) {
    return list;
  }

  const goToPage = onPageChange;

  return (
    <div className={cn("space-y-8", className)}>
      {list}
      <div className="flex flex-col items-stretch gap-4 border-t-2 border-primary/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          {showPageSize && (
            <div className="flex items-center gap-2">
              <span className="shrink-0">Per page</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => onPageSizeChange!(Number(v))}
              >
                <SelectTrigger
                  size="sm"
                  className="h-8 w-[4.5rem] rounded-none border-2 font-bold"
                  aria-label="Stories per page"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  {pageSizeOptions.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <p>
            Page {meta.page} of {Math.max(meta.totalPages, 1)}
            <span className="mx-2 text-border" aria-hidden>
              ·
            </span>
            {meta.total.toLocaleString()} stor
            {meta.total === 1 ? "y" : "ies"}
          </p>
        </div>

        <Pagination className="mx-0 w-full justify-center sm:w-auto sm:justify-end">
          <PaginationContent className="gap-2">
            <PaginationItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-9 rounded-none border-2"
                    disabled={!meta.hasPrevPage}
                    aria-label="Previous page"
                    onClick={() => goToPage(meta.page - 1)}
                  >
                    <ChevronLeft className="size-4" aria-hidden />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Previous page</TooltipContent>
              </Tooltip>
            </PaginationItem>
            <PaginationItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-9 rounded-none border-2"
                    disabled={!meta.hasNextPage}
                    aria-label="Next page"
                    onClick={() => goToPage(meta.page + 1)}
                  >
                    <ChevronRight className="size-4" aria-hidden />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Next page</TooltipContent>
              </Tooltip>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
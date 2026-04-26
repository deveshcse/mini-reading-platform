"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { StoriesMeta, Story } from "@/features/stories/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  UsersRound,
  Trash2,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Can } from "@/shared/components/can";
import { useDeleteStory } from "@/features/stories/hooks/use-stories";

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
  enableDeleteAction?: boolean;
}

interface StoryCardProps {
  story: Story;
  enableDeleteAction: boolean;
}

function StoryCard({ story, enableDeleteAction }: StoryCardProps) {
  const router = useRouter();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const deleteStoryMutation = useDeleteStory(story.id);
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
            <div className="relative aspect-video w-full overflow-hidden border-b-2 border-inherit bg-muted">
              <Image
                src={story.coverImage}
                alt=""
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
          )}

          {/* Card body */}
          <div className="flex flex-1 flex-col gap-3 p-4">
            {/* Badges — fixed min height so free/paid cards align when only premium shows a badge */}
            <div className="flex min-h-6 items-center gap-1.5">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                {!story.isPublished && (
                  <Badge
                    variant="secondary"
                    className="rounded-none text-[9px] font-black uppercase h-5"
                  >
                    Draft
                  </Badge>
                )}
                {isPremium ? (
                  <Badge className="rounded-none border-2 border-amber-600/40 bg-amber-500/15 text-amber-900 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-100 h-5">
                    <span className="flex items-center gap-1 text-[9px] font-black uppercase">
                      <BookMarked className="size-3" aria-hidden />
                      Premium
                    </span>
                  </Badge>
                ) : (
                  <Badge className="rounded-none border-2 border-primary/35 bg-primary/10 text-foreground dark:border-primary/40 dark:bg-primary/15 h-5">
                    <span className="flex items-center gap-1 text-[9px] font-black uppercase">
                      <UsersRound className="size-3 text-primary" aria-hidden />
                      Community
                    </span>
                  </Badge>
                )}
              </div>
              {enableDeleteAction && (
                <div className="flex items-center gap-1">
                  <Can resource="story" action="update">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-xs"
                          className="shrink-0 border-2"
                          aria-label={`Edit ${story.title}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            router.push(`/stories/edit/${story.id}`);
                          }}
                        >
                          <Pencil className="size-3.5" aria-hidden />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">Edit story</TooltipContent>
                    </Tooltip>
                  </Can>

                  <Can resource="story" action="delete">
                    <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon-xs"
                            className="shrink-0"
                            aria-label={`Delete ${story.title}`}
                            disabled={deleteStoryMutation.isPending}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsDeleteOpen(true);
                            }}
                          >
                            <Trash2 className="size-3.5" aria-hidden />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">Delete story</TooltipContent>
                      </Tooltip>
                      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this story?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This removes <span className="font-semibold">{story.title}</span> from your archive.
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              await deleteStoryMutation.mutateAsync();
                              setIsDeleteOpen(false);
                            }}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </Can>
                </div>
              )}
            </div>

            {/* Title */}
            <h2
              className={cn(
                "line-clamp-2 min-h-11 text-base font-semibold leading-snug tracking-tight transition-colors",
                isPremium
                  ? "text-amber-950 dark:text-amber-100 group-hover:text-amber-800 dark:group-hover:text-amber-200"
                  : "text-foreground group-hover:text-primary"
              )}
            >
              {story.title}
            </h2>

            {/* Author */}
            {author && (
              <p className="text-xs text-muted-foreground">
                {author.firstName} {author.lastName}
              </p>
            )}

            {/* Teaser or premium placeholder */}
            <p
              className={cn(
                "line-clamp-3 flex-1 text-sm leading-relaxed",
                isPremium
                  ? "text-primary/90 dark:text-primary"
                  : "text-muted-foreground"
              )}
            >
              {teaser ?? (
                isPremium
                  ? "Open the story for a short preview; subscribers see the full text."
                  : null
              )}
            </p>

            {/* CTA row */}
            <p
              className={cn(
                "mt-auto flex items-center gap-1.5 pt-2 text-xs font-medium transition-colors",
                isPremium
                  ? "text-amber-800 dark:text-amber-300 group-hover:text-amber-700 dark:group-hover:text-amber-200"
                  : "text-muted-foreground group-hover:text-primary"
              )}
            >
              {isPremium ? (
                <>
                  <Lock className="size-3.5 shrink-0 text-primary" aria-hidden />
                  Preview
                </>
              ) : (
                "Read"
              )}
              <ArrowRight className="size-3 ml-auto transition-transform group-hover:translate-x-0.5" aria-hidden />
            </p>
          </div>
        </article>
      </Link>
    </li>
  );
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
  enableDeleteAction = false,
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
      {stories.map((story) => (
        <StoryCard
          key={story.id}
          story={story}
          enableDeleteAction={enableDeleteAction}
        />
      ))}
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
                  className="h-8 w-18 rounded-none border-2 font-bold"
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
"use client";

import React, { useState } from "react";
import { useStories } from "@/features/stories/hooks/use-stories";
import { useAuthContext } from "@/features/auth/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Can } from "@/shared/components/can";
import { RoleGuard } from "@/features/auth/components/role-guard";
import { Role } from "@/shared/types/enums";
import { StoryList } from "@/features/stories/components/story-list";
import { dashboardPageShell } from "@/shared/lib/dashboard-shell";
import { cn } from "@/lib/utils";

const AUTHOR_ARCHIVE_ROLES = [Role.AUTHOR, Role.ADMIN] as const;

export default function MyStoriesPage() {
  const { user } = useAuthContext();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  const { data, isLoading, error } = useStories({
    authorId: user?.id ? Number(user.id) : undefined,
    page,
    pageSize,
  });

  const handlePageSizeChange = (next: number) => {
    setPageSize(next);
    setPage(1);
  };

  return (
    <RoleGuard allowedRoles={AUTHOR_ARCHIVE_ROLES}>
      <div className={cn(dashboardPageShell, "space-y-8 sm:space-y-12")}>
        <div className="flex flex-col gap-6 border-b-4 border-primary pb-6 sm:pb-8 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0 space-y-2">
            <h1 className="text-3xl font-black uppercase leading-none tracking-tighter sm:text-4xl md:text-5xl">
              My <span className="text-primary">Archive</span>
            </h1>
            <p className="text-xs font-bold uppercase tracking-tight text-muted-foreground sm:text-sm">
              Manage and refine your published and draft stories.
            </p>
          </div>

          <Can resource="story" action="create">
            <Button
              asChild
              size="sm"
              className="w-full rounded-none border-b-4 border-r-4 border-primary/50 font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all hover:border-transparent sm:w-auto"
            >
              <Link href="/stories/create" className="flex items-center justify-center gap-2">
                <Plus className="size-3.5" />
                New Story
              </Link>
            </Button>
          </Can>
        </div>

        <StoryList
          stories={data?.stories}
          isLoading={isLoading}
          error={error}
          meta={data?.meta}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </RoleGuard>
  );
}

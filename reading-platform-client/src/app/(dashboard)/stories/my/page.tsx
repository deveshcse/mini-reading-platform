"use client";

import React from "react";
import { useStories } from "@/features/stories/hooks/use-stories";
import { useAuthContext } from "@/features/auth/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Can } from "@/shared/components/can";
import { RoleGuard } from "@/features/auth/components/role-guard";
import { Role } from "@/shared/types/enums";
import { StoryList } from "@/features/stories/components/story-list";

const AUTHOR_ARCHIVE_ROLES = [Role.AUTHOR, Role.ADMIN] as const;

export default function MyStoriesPage() {
  const { user } = useAuthContext();
  const { data, isLoading, error } = useStories({ 
    authorId: user?.id ? Number(user.id) : undefined 
  });

  return (
    <RoleGuard allowedRoles={AUTHOR_ARCHIVE_ROLES}>
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-primary pb-8">
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter uppercase leading-none italic">
              My <span className="text-primary not-italic">Archive</span>
            </h1>
            <p className="text-muted-foreground font-bold tracking-tight uppercase text-sm">
              Manage and refine your published and draft stories.
            </p>
          </div>
          
          <Can resource="story" action="create">
            <Button asChild size="lg" className="rounded-none h-14 px-8 border-b-4 border-r-4 border-primary/50 hover:translate-x-[2px] hover:translate-y-[2px] hover:border-transparent transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] font-black uppercase tracking-widest italic">
              <Link href="/stories/create" className="flex items-center gap-2">
                <Plus className="w-5 h-5 not-italic" />
                New Story
              </Link>
            </Button>
          </Can>
        </div>

        <StoryList
          stories={data?.stories} 
          isLoading={isLoading} 
          error={error} 
        />
      </div>
    </div>
    </RoleGuard>
  );
}

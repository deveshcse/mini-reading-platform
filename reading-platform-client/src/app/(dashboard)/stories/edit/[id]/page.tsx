"use client";

import React from "react";
import { useStory, useUpdateStory } from "@/features/stories/hooks/use-stories";
import { useRouter, useParams } from "next/navigation";
import type { CreateStoryInput, UpdateStoryInput } from "@/features/stories/schema";
import { Loader2 } from "lucide-react";
import { RoleGuard } from "@/features/auth/components/role-guard";
import { Role } from "@/shared/types/enums";
import { StoryForm } from "@/features/stories/components/story-form";
import { dashboardPageShell } from "@/shared/lib/dashboard-shell";
import { cn } from "@/lib/utils";

const STORY_COMPOSE_ROLES = [Role.AUTHOR, Role.ADMIN] as const;

export default function EditStoryPage() {
  const params = useParams();
  const id = Number(params.id);
  const router = useRouter();
  
  const { data: story, isLoading: isLoadingStory } = useStory(id);
  const { mutate: updateStory, isPending: isUpdating } = useUpdateStory(id);

  const handleSubmit = (data: CreateStoryInput) => {
    const body: UpdateStoryInput = { ...data };
    updateStory(body, {
      onSuccess: () => {
        router.push(`/stories/${id}`);
      },
    });
  };

  if (isLoadingStory) {
    return (
      <RoleGuard allowedRoles={STORY_COMPOSE_ROLES}>
        <div className={cn(dashboardPageShell, "flex min-h-[50vh] items-center justify-center py-12")}>
          <Loader2 className="size-12 animate-spin text-primary/60" />
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={STORY_COMPOSE_ROLES}>
      <div className={cn(dashboardPageShell, "space-y-8 sm:space-y-12")}>
        <div className="border-b-4 border-primary pb-6 sm:pb-8">
          <h1 className="text-2xl font-black uppercase leading-none tracking-tighter sm:text-3xl md:text-4xl">
            Edit <span className="text-primary">Story</span>
          </h1>
          <p className="mt-2 text-xs font-bold uppercase tracking-tight text-muted-foreground sm:text-sm">
            Refine your words and perfect your narrative.
          </p>
        </div>

        <StoryForm
          initialData={story}
          onSubmit={handleSubmit}
          isLoading={isUpdating}
        />
      </div>
    </RoleGuard>
  );
}

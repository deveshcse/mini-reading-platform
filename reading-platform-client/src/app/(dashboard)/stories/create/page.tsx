"use client";

import React from "react";
import { useCreateStory } from "@/features/stories/hooks/use-stories";
import { useRouter } from "next/navigation";
import { CreateStoryInput } from "@/features/stories/schema";
import { RoleGuard } from "@/features/auth/components/role-guard";
import { Role } from "@/shared/types/enums";
import { StoryForm } from "@/features/stories/components/story-form";
import { dashboardPageShell } from "@/shared/lib/dashboard-shell";
import { cn } from "@/lib/utils";

const STORY_COMPOSE_ROLES = [Role.AUTHOR, Role.ADMIN] as const;

export default function CreateStoryPage() {
  const { mutate: createStory, isPending } = useCreateStory();
  const router = useRouter();

  const handleSubmit = (data: CreateStoryInput) => {
    createStory(data, {
      onSuccess: (story) => {
        router.push(`/stories/${story.id}`);
      },
    });
  };

  return (
    <RoleGuard allowedRoles={STORY_COMPOSE_ROLES}>
      <div className={cn(dashboardPageShell, "space-y-8 sm:space-y-12")}>
        <div className="border-b-4 border-primary pb-6 sm:pb-8">
          <h1 className="text-2xl font-black uppercase leading-none tracking-tighter sm:text-3xl md:text-4xl">
            Write <span className="text-primary">New</span> Story
          </h1>
          <p className="mt-2 text-xs font-bold uppercase tracking-tight text-muted-foreground sm:text-sm">
            Unleash your creativity and share your vision with the world.
          </p>
        </div>

        <StoryForm onSubmit={handleSubmit} isLoading={isPending} />
      </div>
    </RoleGuard>
  );
}

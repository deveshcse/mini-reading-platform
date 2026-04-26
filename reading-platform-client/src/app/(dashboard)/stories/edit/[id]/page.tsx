"use client";

import React from "react";
import { useStory, useUpdateStory } from "@/features/stories/hooks/use-stories";
import { useRouter, useParams } from "next/navigation";
import type { CreateStoryInput, UpdateStoryInput } from "@/features/stories/schema";
import { Loader2 } from "lucide-react";
import { RoleGuard } from "@/features/auth/components/role-guard";
import { Role } from "@/shared/types/enums";
import { StoryForm } from "@/features/stories/components/story-form";


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
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary/60" />
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={STORY_COMPOSE_ROLES}>
    <div className="p-8">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="border-b-4 border-primary pb-8">
          <h1 className="text-5xl font-black tracking-tighter uppercase leading-none italic">
            Edit <span className="text-primary not-italic">Story</span>
          </h1>
          <p className="text-muted-foreground font-bold tracking-tight uppercase text-sm mt-2">
            Refine your words and perfect your narrative.
          </p>
        </div>

        <StoryForm
          initialData={story}
          onSubmit={handleSubmit}
          isLoading={isUpdating}
        />
      </div>
    </div>
    </RoleGuard>
  );
}

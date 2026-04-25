"use client";

import React from "react";
import { StoryForm } from "@/features/stories/components/StoryForm";
import { useCreateStory } from "@/features/stories/hooks/use-stories";
import { useRouter } from "next/navigation";
import { CreateStoryInput } from "@/features/stories/schema";
import { RoleGuard } from "@/features/auth/components/role-guard";
import { Role } from "@/shared/types/enums";

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
    <div className="p-8">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="border-b-4 border-primary pb-8">
          <h1 className="text-5xl font-black tracking-tighter uppercase leading-none italic">
            Write <span className="text-primary not-italic">New</span> Story
          </h1>
          <p className="text-muted-foreground font-bold tracking-tight uppercase text-sm mt-2">
            Unleash your creativity and share your vision with the world.
          </p>
        </div>

        <StoryForm onSubmit={handleSubmit} isLoading={isPending} />
      </div>
    </div>
    </RoleGuard>
  );
}

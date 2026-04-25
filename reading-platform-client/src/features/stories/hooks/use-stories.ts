import { useQueryClient } from "@tanstack/react-query";
import { useAppQuery, useAppMutation } from "@/shared/lib/query-helper";
import apiClient from "@/shared/api/api-client";
import type { StoriesResponse, Story, StoryWithAccess } from "@/features/stories/types";
import type {
  CreateStoryInput,
  UpdateStoryInput,
  StoryQueryInput,
} from "@/features/stories/schema";

/**
 * Hook to fetch the public story feed with pagination and filters
 */
export const useStories = (params: StoryQueryInput = {}) => {
  return useAppQuery<StoriesResponse>({
    queryKey: ["stories", "list", params],
    config: {
      queryFn: async () => {
        const response = await apiClient.get("/stories", { params });
        return response.data.data as StoriesResponse;
      },
    },
  });
};

/**
 * Hook to fetch a single story by ID.
 * Returns the story and an isLocked flag for premium content.
 */
export const useStory = (id: number) => {
  return useAppQuery<StoryWithAccess>({
    queryKey: ["stories", id],
    config: {
      enabled: Number.isFinite(id) && id > 0,
      queryFn: async () => {
        const response = await apiClient.get(`/stories/${id}`);
        return response.data.data as StoryWithAccess;
      },
    },
  });
};

/**
 * Hook to create a new story
 */
export const useCreateStory = () => {
  const queryClient = useQueryClient();
  return useAppMutation<Story, Error, CreateStoryInput>({
    url: "/stories",
    method: "POST",
    successMessage: "Story created successfully!",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories", "list"] });
    },
  });
};

/**
 * Hook to update an existing story
 */
export const useUpdateStory = (id: number) => {
  const queryClient = useQueryClient();
  return useAppMutation<Story, Error, UpdateStoryInput>({
    url: `/stories/${id}`,
    method: "PATCH",
    successMessage: "Story updated successfully!",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories", "list"] });
      queryClient.invalidateQueries({ queryKey: ["stories", id] });
    },
  });
};

/**
 * Hook to soft-delete a story
 */
export const useDeleteStory = (id: number) => {
  const queryClient = useQueryClient();
  return useAppMutation<{ message: string }, Error, void>({
    url: `/stories/${id}`,
    method: "DELETE",
    successMessage: "Story deleted successfully!",
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["stories", id] });
      queryClient.invalidateQueries({ queryKey: ["stories", "list"] });
    },
  });
};

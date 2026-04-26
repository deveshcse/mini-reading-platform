import { useQueryClient } from "@tanstack/react-query";
import { useAppQuery, useAppMutation } from "@/shared/lib/query-helper";
import apiClient from "@/shared/api/api-client";
import { useAuthContext } from "@/features/auth/components/auth-provider";
import type {
  LikeStatusResponse,
  StoryLikesListResponse,
  ToggleLikeResponse,
} from "@/features/stories/types";

/**
 * Like count from `GET /stories/:id/likes` — uses minimal page size and reads `meta.total`.
 */
export function useStoryLikeCount(storyId: number) {
  return useAppQuery<StoryLikesListResponse>({
    queryKey: ["stories", storyId, "likes-count"],
    config: {
      enabled: Number.isFinite(storyId) && storyId > 0,
      queryFn: async () => {
        const response = await apiClient.get<{
          data: StoryLikesListResponse;
        }>(`/stories/${storyId}/likes`, {
          params: { page: 1, pageSize: 1 },
        });
        return response.data.data;
      },
    },
  });
}

export function useStoryLikeStatus(storyId: number) {
  const { isAuthenticated } = useAuthContext();
  return useAppQuery<LikeStatusResponse>({
    queryKey: ["stories", storyId, "like-status"],
    config: {
      enabled: isAuthenticated && Number.isFinite(storyId) && storyId > 0,
      queryFn: async () => {
        const response = await apiClient.get<{ data: LikeStatusResponse }>(
          `/stories/${storyId}/like-status`
        );
        return response.data.data;
      },
    },
  });
}

export function useToggleStoryLike(storyId: number) {
  const queryClient = useQueryClient();
  return useAppMutation<ToggleLikeResponse, Error, void>({
    url: `/stories/${storyId}/like`,
    method: "POST",
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["stories", storyId, "likes-count"],
      });
      queryClient.invalidateQueries({
        queryKey: ["stories", storyId, "like-status"],
      });
    },
  });
}

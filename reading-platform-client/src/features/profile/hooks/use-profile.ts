import { useAppQuery } from "@/shared/lib/query-helper";
import apiClient from "@/shared/api/api-client";
import type {
  ProfileActivityResponse,
  ProfileMeResponse,
  ProfilePaymentsResponse,
  ProfileSubscriptionsResponse,
} from "@/features/profile/types";

export const useProfileMe = () =>
  useAppQuery<ProfileMeResponse>({
    queryKey: ["profile", "me"],
    config: {
      queryFn: async () => {
        const response = await apiClient.get("/auth/me");
        return response.data.data as ProfileMeResponse;
      },
    },
  });

export const useProfileSubscriptions = (enabled: boolean) =>
  useAppQuery<ProfileSubscriptionsResponse>({
    queryKey: ["profile", "subscriptions"],
    config: {
      enabled,
      queryFn: async () => {
        const response = await apiClient.get("/auth/me/subscriptions");
        return response.data.data as ProfileSubscriptionsResponse;
      },
    },
  });

export const useProfilePayments = (enabled: boolean) =>
  useAppQuery<ProfilePaymentsResponse>({
    queryKey: ["profile", "payments"],
    config: {
      enabled,
      queryFn: async () => {
        const response = await apiClient.get("/auth/me/payments");
        return response.data.data as ProfilePaymentsResponse;
      },
    },
  });

export const useProfileActivity = (enabled: boolean) =>
  useAppQuery<ProfileActivityResponse>({
    queryKey: ["profile", "activity"],
    config: {
      enabled,
      queryFn: async () => {
        const response = await apiClient.get("/auth/me/activity");
        return response.data.data as ProfileActivityResponse;
      },
    },
  });

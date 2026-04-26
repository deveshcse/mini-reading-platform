import { useQueryClient } from "@tanstack/react-query";
import { useAppMutation, useAppQuery } from "@/shared/lib/query-helper";
import apiClient from "@/shared/api/api-client";
import type { CreatePlanInput, ListPlansQueryInput, UpdatePlanInput } from "@/features/plans/schema";
import type { Plan, PlansResponse } from "@/features/plans/types";

export const usePlans = (params: ListPlansQueryInput = {}) => {
  return useAppQuery<PlansResponse>({
    queryKey: ["plans", "list", params],
    config: {
      queryFn: async () => {
        const response = await apiClient.get("/plans", { params });
        return response.data.data as PlansResponse;
      },
    },
  });
};

export const useCreatePlan = () => {
  const queryClient = useQueryClient();
  return useAppMutation<Plan, Error, CreatePlanInput>({
    url: "/plans",
    method: "POST",
    successMessage: "Plan created successfully!",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans", "list"] });
    },
  });
};

export const useUpdatePlan = (id: number) => {
  const queryClient = useQueryClient();
  return useAppMutation<Plan, Error, UpdatePlanInput>({
    url: `/plans/${id}`,
    method: "PATCH",
    successMessage: "Plan updated successfully!",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans", "list"] });
      queryClient.invalidateQueries({ queryKey: ["plans", id] });
    },
  });
};

export const useDeletePlan = () => {
  const queryClient = useQueryClient();
  return useAppMutation<{ message: string }, Error, number>({
    successMessage: "Plan deleted successfully!",
    config: {
      mutationFn: async (id: number) => {
        const response = await apiClient.delete(`/plans/${id}`);
        return response.data.data as { message: string };
      },
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans", "list"] });
    },
  });
};

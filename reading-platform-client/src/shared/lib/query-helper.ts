import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
  QueryKey,
  type MutationFunctionContext,
} from "@tanstack/react-query";
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { toast } from "sonner";
import apiClient from "@/shared/api/api-client";

export type AppQueryParams = Record<string, string | number | boolean | null | undefined>;

function messageFromResponseData(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const root = data as Record<string, unknown>;
  const nested = root["error"];
  if (nested && typeof nested === "object" && nested !== null) {
    const msg = (nested as Record<string, unknown>)["message"];
    if (typeof msg === "string") return msg;
  }
  const direct = root["message"];
  if (typeof direct === "string") return direct;
  return undefined;
}

function resolveMutationErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const fromBody = messageFromResponseData(err.response?.data);
    if (fromBody) return fromBody;
  }
  return fallback;
}

// --- Types ---

type AppQueryConfig<TQueryFnData, TError, TData> = Omit<
  UseQueryOptions<TQueryFnData, TError, TData>,
  "queryKey" | "queryFn"
> & {
  queryFn?: UseQueryOptions<TQueryFnData, TError, TData>["queryFn"];
};

interface AppQueryOptions<TQueryFnData = unknown, TError = AxiosError, TData = TQueryFnData> {
  url?: string;
  queryKey: QueryKey;
  params?: AppQueryParams;
  config?: AppQueryConfig<TQueryFnData, TError, TData>;
}

interface AppMutationOptions<
  TData = unknown,
  TError = AxiosError,
  TVariables = void,
  TOnMutateResult = unknown,
> {
  url?: string;
  method?: "POST" | "PATCH" | "PUT" | "DELETE";
  onSuccess?: (
    data: TData,
    variables: TVariables,
    onMutateResult: TOnMutateResult | undefined,
    context: MutationFunctionContext
  ) => void;
  onError?: (
    error: TError,
    variables: TVariables,
    onMutateResult: TOnMutateResult | undefined,
    context: MutationFunctionContext
  ) => void;
  successMessage?: string;
  errorMessage?: string;
  config?: UseMutationOptions<TData, TError, TVariables, TOnMutateResult>;
}

// --- Query Helper ---

export const useAppQuery = <TQueryFnData = unknown, TError = AxiosError, TData = TQueryFnData>({
  url,
  queryKey,
  params,
  config,
}: AppQueryOptions<TQueryFnData, TError, TData>) => {
  const queryFn =
    config?.queryFn ??
    (async () => {
      if (!url) throw new Error("URL is required if queryFn is not provided");
      const response = await apiClient.get(url, { params });
      return response.data.data as TQueryFnData;
    });

  return useQuery<TQueryFnData, TError, TData>({
    ...config,
    queryKey,
    queryFn,
  });
};

// --- Mutation Helper ---

export const useAppMutation = <
  TData = unknown,
  TError = AxiosError,
  TVariables = void,
  TOnMutateResult = unknown,
>({
  url,
  method,
  onSuccess,
  onError,
  successMessage,
  errorMessage,
  config,
}: AppMutationOptions<TData, TError, TVariables, TOnMutateResult>) => {
  return useMutation<TData, TError, TVariables, TOnMutateResult>({
    mutationFn: config?.mutationFn || (async (variables) => {
      if (!url || !method) throw new Error("URL and Method are required if mutationFn is not provided");
      const axiosConfig: AxiosRequestConfig = {
        method,
        url,
        data: variables,
      };
      
      const response = await apiClient(axiosConfig);
      return response.data.data;
    }),
    ...config,
    onSuccess: (data, variables, onMutateResult, context) => {
        if (successMessage) toast.success(successMessage);
        onSuccess?.(data, variables, onMutateResult, context);
        config?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (err, variables, onMutateResult, context) => {
        const msg = errorMessage || resolveMutationErrorMessage(err, "Something went wrong");

        toast.error(msg);
        onError?.(err, variables, onMutateResult, context);
        config?.onError?.(err, variables, onMutateResult, context);
    },
  });
};

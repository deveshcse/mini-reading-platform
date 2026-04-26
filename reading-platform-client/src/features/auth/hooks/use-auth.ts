import { AxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { useAppMutation } from "@/shared/lib/query-helper";
import { authStore } from "@/features/auth/store/auth-store";
import { normalizeUser } from "@/features/auth/lib/normalize-user";
import { AuthResponse } from "@/features/auth/types";
import { useAuthContext } from "@/features/auth/components/auth-provider";
import { useRouter } from "next/navigation";
import { getSafeRedirectPath } from "@/features/auth/lib/safe-redirect";
import {
  ForgotPasswordInput,
  ResetPasswordInput,
  LoginInput,
  RegisterInput,
} from "@/features/auth/schema/auth-schema";
import apiClient from "@/shared/api/api-client";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { setUser, setIsAuthenticated } = useAuthContext();
  const router = useRouter();

  const loginMutation = useAppMutation<AuthResponse, AxiosError, LoginInput>({
    url: "/auth/login",
    method: "POST",
    successMessage: "Logged in successfully!",
    errorMessage: "Login failed. Please check your credentials.",
    onSuccess: (data) => {
      authStore.bumpAuthEpoch();
      authStore.setToken(data.accessToken);
      setUser(normalizeUser(data.user));
      setIsAuthenticated(true);
      const params = new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : ""
      );
      const next = getSafeRedirectPath(params.get("redirect") ?? params.get("returnUrl"));
      router.push(next ?? "/stories");
    },
  });

  const registerMutation = useAppMutation<AuthResponse, AxiosError, RegisterInput>({
    successMessage: "Account created successfully!",
    errorMessage: "Registration failed. Please try again.",
    onSuccess: (data) => {
      authStore.bumpAuthEpoch();
      authStore.setToken(data.accessToken);
      setUser(normalizeUser(data.user));
      setIsAuthenticated(true);
      const params = new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : ""
      );
      const next = getSafeRedirectPath(params.get("redirect") ?? params.get("returnUrl"));
      router.push(next ?? "/stories");
    },
    config: {
      mutationFn: async (variables: RegisterInput) => {
        const { "confirm-password": _confirm, ...body } = variables;
        const response = await apiClient.post("/auth/register", body);
        return response.data.data;
      },
    },
  });

  const logoutMutation = useAppMutation<void, AxiosError, void>({
    url: "/auth/logout",
    method: "POST",
    successMessage: "Logged out successfully!",
    config: {
      onSettled: (_data, error) => {
        authStore.reset();
        queryClient.clear();
        setUser(null);
        setIsAuthenticated(false);
        if (!error) {
          router.push("/auth/login");
        }
      },
    },
  });

  const forgotPasswordMutation = useAppMutation<unknown, AxiosError, ForgotPasswordInput>({
    url: "/auth/forgot-password",
    method: "POST",
    successMessage: "If an account exists, a reset link has been sent.",
  });

  const resetPasswordMutation = useAppMutation<unknown, AxiosError, ResetPasswordInput>({
    successMessage: "Password reset successfully! Please login.",
    onSuccess: () => {
      router.push("/auth/login");
    },
    config: {
      mutationFn: async (variables: ResetPasswordInput) => {
        const { "confirm-password": _confirm, ...body } = variables;
        const response = await apiClient.post("/auth/reset-password", body);
        return response.data.data;
      },
    },
  });

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    forgotPassword: forgotPasswordMutation.mutate,
    isForgetting: forgotPasswordMutation.isPending,
    isForgotSuccess: forgotPasswordMutation.isSuccess,
    resetPassword: resetPasswordMutation.mutate,
    isResetting: resetPasswordMutation.isPending,
  };
};

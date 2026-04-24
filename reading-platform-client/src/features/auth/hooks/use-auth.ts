import { AxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { useAppMutation } from "@/shared/lib/query-helper";
import { authStore } from "@/features/auth/store/auth-store";
import { AuthResponse } from "@/features/auth/types";
import { useAuthContext } from "@/features/auth/components/auth-provider";
import { TASK_KEYS } from "@/features/tasks/hooks/use-tasks";
import { useRouter } from "next/navigation";
import { 
  ForgotPasswordInput, 
  ResetPasswordInput, 
  LoginInput, 
  RegisterInput 
} from "@/features/auth/schema/auth-schema";

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
      setUser(data.user);
      setIsAuthenticated(true);
      router.push("/tasks");
    },
  });

  const registerMutation = useAppMutation<AuthResponse, AxiosError, RegisterInput>({
    url: "/auth/register",
    method: "POST",
    successMessage: "Account created successfully!",
    errorMessage: "Registration failed. Please try again.",
    onSuccess: (data) => {
      authStore.bumpAuthEpoch();
      authStore.setToken(data.accessToken);
      setUser(data.user);
      setIsAuthenticated(true);
      router.push("/tasks");
    },
  });

  const logoutMutation = useAppMutation<void, AxiosError, void>({
    url: "/auth/logout",
    method: "POST",
    successMessage: "Logged out successfully!",
    config: {
      onSettled: (_data, error) => {
        queryClient.removeQueries({ queryKey: TASK_KEYS.all });
        authStore.reset();
        setUser(null);
        setIsAuthenticated(false);
        if (!error) {
          router.push("/login");
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
    url: "/auth/reset-password",
    method: "POST",
    successMessage: "Password reset successfully! Please login.",
    onSuccess: () => {
      router.push("/login");
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

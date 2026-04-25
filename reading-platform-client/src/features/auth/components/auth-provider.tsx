"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { User } from "@/features/auth/types";
import { authStore } from "@/features/auth/store/auth-store";
import apiClient from "@/shared/api/api-client";

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/auth/logout", {});
    } catch {
      // Server logout failed; local session is still cleared below.
    } finally {
      authStore.reset();
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [queryClient]);

  // Silent refresh (ONLY ONCE per app load)
  useEffect(() => {
    const silentRefresh = async () => {
      // Prevent duplicate calls
      if (authStore.hasTriedRefresh()) {
        setIsLoading(false);
        return;
      }

      authStore.markRefreshTried();
      const epochAtRefreshStart = authStore.getAuthEpoch();

      try {
        const response = await apiClient.post("/auth/refresh", {});

        const { user, accessToken } = response.data.data;

        if (!accessToken || typeof accessToken !== "string") {
          throw new Error("Invalid refresh response");
        }

        authStore.setToken(accessToken);
        setUser(user);
        setIsAuthenticated(true);
      } catch {
        // Login/register may have completed while refresh was in flight; do not wipe that session.
        if (authStore.getAuthEpoch() === epochAtRefreshStart) {
          authStore.clearToken();
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    silentRefresh();
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      setUser,
      isAuthenticated,
      setIsAuthenticated,
      isLoading,
      logout,
    }),
    [user, isAuthenticated, isLoading, logout]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
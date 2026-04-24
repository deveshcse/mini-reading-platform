import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { authStore } from "@/features/auth/store/auth-store";

/** 401 on these paths is expected without a session; do not trigger cookie refresh. */
function isAuthPublicPath(url: string | undefined): boolean {
  if (!url) return false;
  const path = url.replace(/^https?:\/\/[^/]+/, "");
  return (
    path.includes("/auth/login") ||
    path.includes("/auth/register") ||
    path.includes("/auth/forgot-password") ||
    path.includes("/auth/reset-password")
  );
}

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Refresh control
let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authStore.getToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

//  Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const is401 = error.response?.status === 401;
    const isRefreshCall = originalRequest.url?.includes("/auth/refresh");
    const skipRefreshWithoutToken =
      !authStore.getToken() && isAuthPublicPath(originalRequest.url);

    // Skip if:
    // - not 401
    // - already retried
    // - refresh endpoint itself
    // - unauthenticated call to login/register/etc. (avoid refresh on wrong-password 401)
    if (
      !is401 ||
      originalRequest._retry ||
      isRefreshCall ||
      skipRefreshWithoutToken
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // If refresh already running → queue
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const response = await axios.post(
        `${apiClient.defaults.baseURL}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      const accessToken = response.data?.data?.accessToken;

      if (!accessToken || typeof accessToken !== "string") {
        throw new Error("Invalid refresh response");
      }

      authStore.setToken(accessToken);

      processQueue(null, accessToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }

      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      authStore.clearToken();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
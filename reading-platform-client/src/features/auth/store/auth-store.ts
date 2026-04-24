// In-memory Auth Store (NO localStorage)

let accessToken: string | null = null;
let hasTriedRefresh = false;
/** Bumped on login/register so a stale silent-refresh failure cannot clear a new session. */
let authEpoch = 0;

export const authStore = {
  // Token handling
  setToken: (token: string) => {
    accessToken = token;
  },

  getToken: () => accessToken,

  clearToken: () => {
    accessToken = null;
  },

  bumpAuthEpoch: () => {
    authEpoch += 1;
  },

  getAuthEpoch: () => authEpoch,

  // Refresh tracking (important)
  markRefreshTried: () => {
    hasTriedRefresh = true;
  },

  hasTriedRefresh: () => hasTriedRefresh,

  reset: () => {
    accessToken = null;
    hasTriedRefresh = false;
    authEpoch = 0;
  },
};
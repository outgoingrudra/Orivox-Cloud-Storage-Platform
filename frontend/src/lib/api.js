import axios from "axios";

import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from "./token";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_URL,

  /*
    Required because refreshToken
    is stored in an HttpOnly cookie.
  */
  withCredentials: true,
});

let refreshPromise = null;

/*
  These routes may legitimately return 401
  because of wrong credentials / invalid token.

  In those cases we should NOT try to refresh
  the current session.
*/
const NO_REFRESH_ROUTES = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/resend-verification",
  "/auth/verify-email",
];

// ==================== REQUEST INTERCEPTOR ====================

api.interceptors.request.use(
  (config) => {
    const token =
      getAccessToken();

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) =>
    Promise.reject(error)
);

// ==================== RESPONSE INTERCEPTOR ====================

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest =
      error.config;

    /*
      If Axios didn't create a normal
      request config, don't try anything.
    */
    if (!originalRequest) {
      return Promise.reject(error);
    }

    const shouldSkipRefresh =
      NO_REFRESH_ROUTES.some(
        (route) =>
          originalRequest.url?.includes(
            route
          )
      );

    /*
      Refresh only when:

      1. Backend returned 401
      2. We haven't already retried
      3. This isn't a public auth request
    */
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      shouldSkipRefresh
    ) {
      return Promise.reject(error);
    }

    /*
      Never try to refresh the refresh request.

      Otherwise:
      refresh → 401
      → refresh again
      → infinite loop
    */
    if (
      originalRequest.url?.includes(
        "/auth/refresh"
      )
    ) {
      clearAccessToken();

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      /*
        Suppose dashboard fires:

        /dashboard → 401
        /files     → 401
        /folders   → 401

        We don't want 3 refresh requests.

        All of them wait for this same promise.
      */
      if (!refreshPromise) {
        refreshPromise =
          axios
            .post(
              `${API_URL}/auth/refresh`,
              {},
              {
                withCredentials: true,
              }
            )
            .then((response) => {
              const token =
                response.data.data
                  .accessToken;

              setAccessToken(token);

              return token;
            })
            .finally(() => {
              refreshPromise = null;
            });
      }

      const newAccessToken =
        await refreshPromise;

      /*
        Attach the new token to the
        original failed request.
      */
      originalRequest.headers =
        originalRequest.headers || {};

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      /*
        Retry original request.
      */
      return api(originalRequest);
    } catch (refreshError) {
      /*
        Refresh token/session itself
        is no longer valid.
      */
      clearAccessToken();

      return Promise.reject(
        refreshError
      );
    }
  }
);
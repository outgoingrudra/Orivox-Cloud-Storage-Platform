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

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry
    ) {
      return Promise.reject(error);
    }

    /*
      Don't try to refresh when the refresh
      endpoint itself returns 401.
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
        If 5 requests simultaneously get 401,
        we should NOT send 5 refresh requests.

        They all wait for the same promise.
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

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      clearAccessToken();

      return Promise.reject(
        refreshError
      );
    }
  }
);
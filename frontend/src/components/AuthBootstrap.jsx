"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { api } from "@/lib/api";

import {
  setAccessToken,
  clearAccessToken,
} from "@/lib/token";

import {
  setAuthenticated,
  setUnauthenticated,
} from "@/store/authSlice";

export default function AuthBootstrap({
  children,
}) {
  const dispatch = useDispatch();

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        /*
          Access token disappears after browser refresh.

          Refresh cookie is HttpOnly and still exists,
          so ask backend for a fresh access token.
        */
        const refreshResponse =
          await api.post("/auth/refresh");

        const token =
          refreshResponse.data.data.accessToken;

        setAccessToken(token);

        const meResponse =
          await api.get("/auth/me");

        if (!active) return;

        dispatch(
          setAuthenticated(
            meResponse.data.data
          )
        );
      } catch {
        clearAccessToken();

        if (!active) return;

        dispatch(
          setUnauthenticated()
        );
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, [dispatch]);

  return children;
}
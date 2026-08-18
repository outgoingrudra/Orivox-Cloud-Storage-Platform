"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import {
  LogOut,
  LoaderCircle,
  ShieldOff,
} from "lucide-react";

import { api } from "@/lib/api";
import {
  clearAccessToken,
} from "@/lib/token";

import {
  setUnauthenticated,
} from "@/store/authSlice";

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const user =
    useSelector(
      (state) => state.auth.user
    );

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [
    loggingOutAll,
    setLoggingOutAll,
  ] = useState(false);

  async function handleLogout() {
    if (
      loggingOut ||
      loggingOutAll
    ) {
      return;
    }

    try {
      setLoggingOut(true);

      await api.post(
        "/auth/logout"
      );
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );
    } finally {
      clearSession();
    }
  }

  async function handleLogoutAll() {
    if (
      loggingOut ||
      loggingOutAll
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Log out from all devices?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setLoggingOutAll(true);

      await api.post(
        "/auth/logout-all"
      );
    } catch (error) {
      console.error(
        "Logout all devices failed:",
        error
      );
    } finally {
      /*
        This browser must also become
        unauthenticated immediately.
      */
      clearSession();
    }
  }

  function clearSession() {
    clearAccessToken();

    dispatch(
      setUnauthenticated()
    );

    router.replace(
      "/login"
    );
  }

  return (
    <main className="min-h-screen bg-base-100 p-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold">
            Dashboard
          </h1>

          <p className="mt-3 opacity-60">
            Welcome back,{" "}
            {user?.name}.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={
              handleLogout
            }
            disabled={
              loggingOut ||
              loggingOutAll
            }
            className="btn btn-outline"
          >
            {loggingOut ? (
              <>
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />

                Logging out...
              </>
            ) : (
              <>
                <LogOut
                  size={17}
                />

                Logout
              </>
            )}
          </button>

          <button
            type="button"
            onClick={
              handleLogoutAll
            }
            disabled={
              loggingOut ||
              loggingOutAll
            }
            className="btn btn-error btn-outline"
          >
            {loggingOutAll ? (
              <>
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />

                Logging out...
              </>
            ) : (
              <>
                <ShieldOff
                  size={17}
                />

                Logout all devices
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
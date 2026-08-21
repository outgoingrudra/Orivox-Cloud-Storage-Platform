"use client";

import { useState } from "react";

import {
  KeyRound,
  Laptop,
  LoaderCircle,
  LogOut,
  MonitorSmartphone,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import { motion } from "framer-motion";

import { useSessions } from "@/features/settings/useSessions";
import { useRevokeSession } from "@/features/settings/useRevokeSession";
import { useLogoutOthers } from "@/features/settings/useLogoutOthers";
import { useLogoutAll } from "@/features/settings/useLogoutAll";

import ChangePasswordModal from "@/features/settings/components/ChangePasswordModal";

function getDeviceInfo(userAgent = "") {
  const value = userAgent.toLowerCase();

  let device = "Unknown device";
  let DeviceIcon = MonitorSmartphone;

  if (
    value.includes("android") ||
    value.includes("iphone") ||
    value.includes("mobile")
  ) {
    device = "Mobile device";
    DeviceIcon = Smartphone;
  } else if (
    value.includes("windows") ||
    value.includes("macintosh") ||
    value.includes("linux")
  ) {
    device = "Computer";
    DeviceIcon = Laptop;
  }

  let browser = "Browser";

  if (value.includes("edg/")) {
    browser = "Microsoft Edge";
  } else if (value.includes("chrome/")) {
    browser = "Google Chrome";
  } else if (value.includes("firefox/")) {
    browser = "Firefox";
  } else if (value.includes("safari/")) {
    browser = "Safari";
  }

  return {
    device,
    browser,
    DeviceIcon,
  };
}

function formatLastActive(date) {
  if (!date) return "Unknown";

  const value = new Date(date);

  const seconds = Math.floor(
    (Date.now() - value.getTime()) / 1000
  );

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  return value.toLocaleDateString();
}

export default function SecuritySettings() {
  const [changePasswordOpen, setChangePasswordOpen] =
    useState(false);

  const {
    data,
    isLoading,
    isError,
    error,
  } = useSessions();

  const revokeMutation = useRevokeSession();
  const logoutOthersMutation = useLogoutOthers();
  const logoutAllMutation = useLogoutAll();

  const sessions = data?.sessions || [];

  const otherSessions = sessions.filter(
    (session) => !session.current
  );

  async function handleRevoke(session) {
    if (
      revokeMutation.isPending ||
      logoutOthersMutation.isPending ||
      logoutAllMutation.isPending
    ) {
      return;
    }

    const message = session.current
      ? "Sign out of this device?"
      : "Sign out this device?";

    const confirmed = window.confirm(message);

    if (!confirmed) return;

    try {
      await revokeMutation.mutateAsync(
        session.id
      );
    } catch {
      // Mutation error shown below.
    }
  }

  async function handleLogoutOthers() {
    if (
      logoutOthersMutation.isPending ||
      logoutAllMutation.isPending
    ) {
      return;
    }

    const confirmed = window.confirm(
      "Sign out all other devices? This device will stay signed in."
    );

    if (!confirmed) return;

    try {
      await logoutOthersMutation.mutateAsync();
    } catch {
      // Mutation error shown below.
    }
  }

  async function handleLogoutAll() {
    if (
      logoutAllMutation.isPending ||
      logoutOthersMutation.isPending
    ) {
      return;
    }

    const confirmed = window.confirm(
      "Sign out everywhere? You will also be signed out from this device."
    );

    if (!confirmed) return;

    try {
      await logoutAllMutation.mutateAsync();
    } catch {
      // Mutation error shown below.
    }
  }

  const sessionActionPending =
    revokeMutation.isPending ||
    logoutOthersMutation.isPending ||
    logoutAllMutation.isPending;

  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: 0.14,
      }}
      className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6"
    >
      {/* ==================== HEADER ==================== */}

      <div className="flex items-center gap-3">
        <motion.div
          whileHover={{
            rotate: -4,
            scale: 1.06,
          }}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-base-200"
        >
          <ShieldCheck size={18} />
        </motion.div>

        <div>
          <h2 className="font-bold">
            Security
          </h2>

          <p className="mt-0.5 text-xs opacity-45">
            Manage your password and signed-in devices.
          </p>
        </div>
      </div>

      {/* ==================== PASSWORD ==================== */}

      <div className="mt-6">
        <motion.div
          whileHover={{
            x: 3,
          }}
          className="flex flex-col gap-4 rounded-2xl border border-base-300 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-base-200">
              <KeyRound size={18} />
            </div>

            <div>
              <p className="text-sm font-semibold">
                Password
              </p>

              <p className="mt-1 text-xs leading-5 opacity-45">
                Change your password securely without leaving your account.
              </p>
            </div>
          </div>

          <motion.button
            type="button"
            whileHover={{
              y: -2,
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.97,
            }}
            onClick={() =>
              setChangePasswordOpen(true)
            }
            className="btn btn-outline btn-sm rounded-xl"
          >
            <KeyRound size={15} />
            Change password
          </motion.button>
        </motion.div>
      </div>

      {/* ==================== ACTIVE SESSIONS ==================== */}

      <div className="mt-7">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold">
              Active sessions
            </h3>

            <p className="mt-1 text-xs opacity-40">
              Devices currently signed into your account.
            </p>
          </div>

          {!isLoading &&
            !isError && (
              <span className="text-xs font-semibold opacity-40">
                {sessions.length} active
              </span>
            )}
        </div>

        {/* LOADING */}

        {isLoading && (
          <div className="mt-4 flex items-center justify-center rounded-2xl border border-base-300 py-10">
            <LoaderCircle
              size={22}
              className="animate-spin opacity-40"
            />
          </div>
        )}

        {/* ERROR */}

        {isError && (
          <div className="alert alert-error mt-4 rounded-xl text-sm">
            {error?.response?.data?.message ||
              "Unable to load active sessions."}
          </div>
        )}

        {/* EMPTY */}

        {!isLoading &&
          !isError &&
          sessions.length === 0 && (
            <div className="mt-4 rounded-2xl border border-base-300 p-6 text-center">
              <MonitorSmartphone
                size={23}
                className="mx-auto opacity-30"
              />

              <p className="mt-3 text-sm font-semibold">
                No active sessions
              </p>
            </div>
          )}

        {/* SESSION LIST */}

        {!isLoading &&
          !isError &&
          sessions.length > 0 && (
            <div className="mt-4 space-y-3">
              {sessions.map(
                (session, index) => {
                  const {
                    device,
                    browser,
                    DeviceIcon,
                  } =
                    getDeviceInfo(
                      session.userAgent
                    );

                  const revoking =
                    revokeMutation.isPending &&
                    revokeMutation.variables ===
                      session.id;

                  return (
                    <motion.div
                      key={session.id}
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay:
                          index * 0.04,
                      }}
                      whileHover={{
                        y: -2,
                      }}
                      className="rounded-2xl border border-base-300 p-4 transition"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                          <motion.div
                            whileHover={{
                              scale: 1.07,
                              rotate: -3,
                            }}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-base-200"
                          >
                            <DeviceIcon size={18} />
                          </motion.div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold">
                                {browser} on{" "}
                                {device}
                              </p>

                              {session.current && (
                                <span className="badge badge-neutral badge-sm">
                                  This device
                                </span>
                              )}
                            </div>

                            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs opacity-40">
                              <span>
                                IP:{" "}
                                {session.ipAddress ||
                                  "Unknown"}
                              </span>

                              <span>
                                Last active:{" "}
                                {formatLastActive(
                                  session.lastUsedAt
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <motion.button
                          type="button"
                          whileHover={{
                            scale: 1.03,
                          }}
                          whileTap={{
                            scale: 0.96,
                          }}
                          disabled={
                            sessionActionPending
                          }
                          onClick={() =>
                            handleRevoke(
                              session
                            )
                          }
                          className="btn btn-ghost btn-sm rounded-xl text-error"
                        >
                          {revoking ? (
                            <LoaderCircle
                              size={15}
                              className="animate-spin"
                            />
                          ) : (
                            <LogOut size={15} />
                          )}

                          {revoking
                            ? "Signing out..."
                            : session.current
                              ? "Sign out"
                              : "Revoke"}
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                }
              )}
            </div>
          )}

        {/* ==================== ERRORS ==================== */}

        {revokeMutation.isError && (
          <p className="mt-3 text-xs text-error">
            {revokeMutation.error
              ?.response?.data
              ?.message ||
              "Unable to revoke session."}
          </p>
        )}

        {logoutOthersMutation.isError && (
          <p className="mt-3 text-xs text-error">
            {logoutOthersMutation.error
              ?.response?.data
              ?.message ||
              "Unable to sign out other devices."}
          </p>
        )}

        {/* ==================== SIGN OUT OTHER DEVICES ==================== */}

        {!isLoading &&
          !isError &&
          otherSessions.length > 0 && (
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              whileHover={{
                y: -2,
              }}
              className="mt-5 flex flex-col gap-4 rounded-2xl border border-base-300 bg-base-200/40 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-semibold">
                  Other signed-in devices
                </p>

                <p className="mt-1 text-xs leading-5 opacity-45">
                  Sign out{" "}
                  {otherSessions.length}{" "}
                  other active{" "}
                  {otherSessions.length === 1
                    ? "session"
                    : "sessions"}{" "}
                  while keeping this device signed in.
                </p>
              </div>

              <motion.button
                type="button"
                whileHover={{
                  y: -2,
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                disabled={
                  sessionActionPending
                }
                onClick={
                  handleLogoutOthers
                }
                className="btn btn-outline btn-sm shrink-0 rounded-xl"
              >
                {logoutOthersMutation.isPending ? (
                  <LoaderCircle
                    size={15}
                    className="animate-spin"
                  />
                ) : (
                  <LogOut size={15} />
                )}

                {logoutOthersMutation.isPending
                  ? "Signing out..."
                  : "Sign out other devices"}
              </motion.button>
            </motion.div>
          )}
      </div>

      {/* ==================== DANGER ZONE ==================== */}

      <div className="mt-7 border-t border-base-300 pt-6">
        <div className="flex items-center gap-2">
          <ShieldAlert
            size={17}
            className="text-error"
          />

          <h3 className="text-sm font-bold text-error">
            Danger zone
          </h3>
        </div>

        <motion.div
          whileHover={{
            y: -2,
          }}
          className="mt-3 flex flex-col gap-4 rounded-2xl border border-error/25 bg-error/5 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-sm font-semibold">
              Sign out everywhere
            </p>

            <p className="mt-1 max-w-md text-xs leading-5 opacity-50">
              End every active session,
              including this device. You
              will need to sign in again.
            </p>
          </div>

          <motion.button
            type="button"
            whileHover={{
              y: -2,
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.97,
            }}
            disabled={
              sessionActionPending
            }
            onClick={
              handleLogoutAll
            }
            className="btn btn-error btn-sm shrink-0 rounded-xl"
          >
            {logoutAllMutation.isPending ? (
              <LoaderCircle
                size={15}
                className="animate-spin"
              />
            ) : (
              <LogOut size={15} />
            )}

            {logoutAllMutation.isPending
              ? "Signing out..."
              : "Sign out everywhere"}
          </motion.button>
        </motion.div>

        {logoutAllMutation.isError && (
          <p className="mt-3 text-xs text-error">
            {logoutAllMutation.error
              ?.response?.data
              ?.message ||
              "Unable to sign out everywhere."}
          </p>
        )}
      </div>

      {/* ==================== CHANGE PASSWORD MODAL ==================== */}

      <ChangePasswordModal
        open={changePasswordOpen}
        onClose={() =>
          setChangePasswordOpen(false)
        }
      />
    </motion.section>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  CheckCircle2,
  CircleX,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
} from "lucide-react";

import { api } from "@/lib/api";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();

  const token =
    searchParams.get("token");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    setError("");

    if (!token) {
      setError(
        "Password reset link is invalid."
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (
      password !== confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);

      await api.post(
        "/auth/reset-password",
        {
          token,
          password,
        }
      );

      setSuccess(true);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "This password reset link is invalid or has expired.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  // ==================== MISSING TOKEN ====================

  if (!token) {
    return (
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-5 py-12">
        <div className="w-full text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-base-200">
            <CircleX size={27} />
          </div>

          <h1 className="mt-6 text-3xl font-bold">
            Invalid reset link
          </h1>

          <p className="mt-3 leading-7 opacity-65">
            This password reset link is
            missing the required token.
          </p>

          <Link
            href="/forgot-password"
            className="btn btn-neutral mt-8 w-full"
          >
            Request new reset link
          </Link>

          <Link
            href="/login"
            className="btn btn-ghost mt-2 w-full"
          >
            Back to sign in
          </Link>
        </div>
      </section>
    );
  }

  // ==================== SUCCESS ====================

  if (success) {
    return (
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-5 py-12">
        <div className="w-full text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-base-200">
            <CheckCircle2 size={27} />
          </div>

          <h1 className="mt-6 text-3xl font-bold">
            Password changed
          </h1>

          <p className="mt-3 leading-7 opacity-65">
            Your password has been reset
            successfully.
          </p>

          <p className="mt-2 text-sm opacity-55">
            Sign in again using your new
            password.
          </p>

          <Link
            href="/login"
            className="btn btn-neutral mt-8 w-full"
          >
            Sign in
          </Link>
        </div>
      </section>
    );
  }

  // ==================== FORM ====================

  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-5 py-12">
      <div className="w-full">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-base-200">
          <LockKeyhole size={22} />
        </div>

        <h1 className="mt-6 text-3xl font-bold">
          Create a new password
        </h1>

        <p className="mt-2 text-sm leading-6 opacity-60">
          Choose a new password for your
          Orivox account.
        </p>

        {error && (
          <div className="alert alert-error mt-6 text-sm">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          {/* NEW PASSWORD */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              New password
            </label>

            <div className="relative">
              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
                disabled={loading}
                className="input input-bordered w-full pr-12"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (value) => !value
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* CONFIRM PASSWORD */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Confirm new password
            </label>

            <div className="relative">
              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                autoComplete="new-password"
                placeholder="Enter password again"
                disabled={loading}
                className="input input-bordered w-full pr-12"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    (value) => !value
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-neutral w-full"
          >
            {loading ? (
              <>
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />

                Changing password...
              </>
            ) : (
              "Reset password"
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
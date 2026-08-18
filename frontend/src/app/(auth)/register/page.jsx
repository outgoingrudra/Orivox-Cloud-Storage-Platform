"use client";

import { useState } from "react";
import Link from "next/link";

import {
  Eye,
  EyeOff,
  LoaderCircle,
  MailCheck,
} from "lucide-react";

import { api } from "@/lib/api";

export default function RegisterPage() {
  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [registeredEmail, setRegisteredEmail] =
    useState(null);

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    setError("");

    const normalizedName =
      name.trim();

    const normalizedEmail =
      email.trim().toLowerCase();

    // ==================== BASIC VALIDATION ====================

    if (
      normalizedName.length < 2
    ) {
      setError(
        "Name must contain at least 2 characters."
      );

      return;
    }

    if (!normalizedEmail) {
      setError(
        "Email is required."
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
        "/auth/register",
        {
          name:
            normalizedName,

          email:
            normalizedEmail,

          /*
            Do NOT trim passwords.

            Password should remain exactly
            what the user typed.
          */
          password,
        }
      );

      /*
        User is NOT authenticated yet.

        Backend requires email verification
        before login.
      */
      setRegisteredEmail(
        normalizedEmail
      );
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Unable to create your account. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  // ==================== SUCCESS STATE ====================

  if (registeredEmail) {
    return (
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-5 py-12">
        <div className="w-full text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-base-200">
            <MailCheck size={27} />
          </div>

          <h1 className="mt-6 text-3xl font-bold">
            Check your email
          </h1>

          <p className="mt-3 leading-7 opacity-65">
            We sent a verification link to{" "}
            <span className="font-semibold opacity-100">
              {registeredEmail}
            </span>
            .
          </p>

          <p className="mt-2 text-sm opacity-55">
            Verify your email before signing in to Orivox.
          </p>

          <Link
            href="/login"
            className="btn btn-neutral mt-8 w-full"
          >
            Go to sign in
          </Link>

          <button
            type="button"
            onClick={() =>
              setRegisteredEmail(null)
            }
            className="btn btn-ghost mt-2 w-full"
          >
            Use another email
          </button>
        </div>
      </section>
    );
  }

  // ==================== REGISTER FORM ====================

  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-5 py-12">
      <div className="w-full">
        <h1 className="text-3xl font-bold">
          Create your account
        </h1>

        <p className="mt-2 text-sm opacity-60">
          Start your Orivox workspace.
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
          {/* NAME */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              autoComplete="name"
              placeholder="Your name"
              disabled={loading}
              className="input input-bordered w-full"
            />
          </div>

          {/* EMAIL */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              autoComplete="email"
              placeholder="you@example.com"
              disabled={loading}
              className="input input-bordered w-full"
            />
          </div>

          {/* PASSWORD */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Password
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
                    (value) =>
                      !value
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
              Confirm password
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
                    (value) =>
                      !value
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

          {/* SUBMIT */}

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

                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm opacity-70">
          Already have an account?{" "}

          <Link
            href="/login"
            className="font-semibold opacity-100 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
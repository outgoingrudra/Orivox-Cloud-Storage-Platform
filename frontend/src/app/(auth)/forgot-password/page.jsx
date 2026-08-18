"use client";

import { useState } from "react";
import Link from "next/link";

import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  LoaderCircle,
} from "lucide-react";

import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    setError("");

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Email is required.");
      return;
    }

    try {
      setLoading(true);

      await api.post(
        "/auth/forgot-password",
        {
          email: normalizedEmail,
        }
      );

      setSuccess(true);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Unable to process your request. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
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
            Check your email
          </h1>

          <p className="mt-3 leading-7 opacity-65">
            If an Orivox account exists for{" "}
            <span className="font-semibold opacity-100">
              {email.trim().toLowerCase()}
            </span>
            , you'll receive a password reset link.
          </p>

          <p className="mt-2 text-sm opacity-55">
            Check your inbox and spam folder.
          </p>

          <Link
            href="/login"
            className="btn btn-neutral mt-8 w-full"
          >
            Back to sign in
          </Link>

          <button
            type="button"
            onClick={() => {
              setSuccess(false);
            }}
            className="btn btn-ghost mt-2 w-full"
          >
            Try another email
          </button>
        </div>
      </section>
    );
  }

  // ==================== FORM ====================

  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-5 py-12">
      <div className="w-full">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-base-200">
          <KeyRound size={22} />
        </div>

        <h1 className="mt-6 text-3xl font-bold">
          Forgot your password?
        </h1>

        <p className="mt-2 text-sm leading-6 opacity-60">
          Enter your email and we'll send you a
          password reset link.
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
          <div>
            <label className="mb-2 block text-sm font-medium">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              autoComplete="email"
              placeholder="you@example.com"
              disabled={loading}
              className="input input-bordered w-full"
            />
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

                Sending...
              </>
            ) : (
              "Send reset link"
            )}
          </button>
        </form>

        <Link
          href="/login"
          className="mt-6 flex items-center justify-center gap-2 text-sm font-medium opacity-70 hover:opacity-100"
        >
          <ArrowLeft size={16} />

          Back to sign in
        </Link>
      </div>
    </section>
  );
}
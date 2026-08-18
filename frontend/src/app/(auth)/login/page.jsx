"use client";

import { useState } from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { Eye, EyeOff, LoaderCircle } from "lucide-react";

import { useDispatch } from "react-redux";

import { api } from "@/lib/api";

import { setAccessToken } from "@/lib/token";

import { setAuthenticated } from "@/store/authSlice";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Email is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        email: normalizedEmail,

        password,
      });

      const { user, accessToken } = response.data.data;

      setAccessToken(accessToken);

      dispatch(setAuthenticated(user));

      router.replace("/dashboard");
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to login. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-5 py-12">
      <div className="w-full">
        <h1 className="text-3xl font-bold">Welcome back</h1>

        <p className="mt-2 text-sm opacity-60">
          Sign in to your Orivox workspace.
        </p>

        {error && <div className="alert alert-error mt-6 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">Email</label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              className="input input-bordered w-full"
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium">Password</label>

              <Link
                href="/forgot-password"
                className="text-sm underline-offset-4 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                className="input input-bordered w-full pr-12"
                placeholder="Enter your password"
                disabled={loading}
              />

              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                <LoaderCircle size={17} className="animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm opacity-70">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-semibold opacity-100 hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  CheckCircle2,
  CircleX,
  Clock3,
} from "lucide-react";

export default function EmailVerifiedPage() {
  const searchParams = useSearchParams();

  const status =
    searchParams.get("status");

  const config = {
    success: {
      icon: CheckCircle2,
      title: "Email verified",
      message:
        "Your email has been verified successfully. You can now sign in to Orivox.",
    },

    expired: {
      icon: Clock3,
      title: "Verification link expired",
      message:
        "This verification link has expired. Request a new verification email and try again.",
    },

    invalid: {
      icon: CircleX,
      title: "Invalid verification link",
      message:
        "This verification link is invalid or has already been used.",
    },
  };

  const result =
    config[status] ||
    config.invalid;

  const Icon = result.icon;

  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-5 py-12">
      <div className="w-full text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-base-200">
          <Icon size={27} />
        </div>

        <h1 className="mt-6 text-3xl font-bold">
          {result.title}
        </h1>

        <p className="mt-3 leading-7 opacity-65">
          {result.message}
        </p>

        {status === "success" ? (
          <Link
            href="/login"
            className="btn btn-neutral mt-8 w-full"
          >
            Sign in
          </Link>
        ) : (
          <>
            <Link
              href="/resend-verification"
              className="btn btn-neutral mt-8 w-full"
            >
              Request new link
            </Link>

            <Link
              href="/login"
              className="btn btn-ghost mt-2 w-full"
            >
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
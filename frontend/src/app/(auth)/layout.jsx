"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

import Link from "next/link";

import {
  Cloud,
  LoaderCircle,
} from "lucide-react";

import ThemeSwitcher from "@/components/ThemeSwitcher";

export default function AuthLayout({
  children,
}) {
  const router = useRouter();

  const status =
    useSelector(
      (state) => state.auth.status
    );

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  /*
    Critical:
    Don't render login/register while we're
    still checking the refresh cookie.

    Otherwise logged-in users briefly see
    the login page on every refresh.
  */
  if (
    status === "checking" ||
    status === "authenticated"
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-base-100">
        <LoaderCircle
          size={26}
          className="animate-spin"
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-base-100">
      <header className="flex h-16 items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-base-content text-base-100">
            <Cloud size={19} />
          </div>

          <span className="text-lg font-bold">
            Orivox
          </span>
        </Link>

        <ThemeSwitcher />
      </header>

      {children}
    </main>
  );
}
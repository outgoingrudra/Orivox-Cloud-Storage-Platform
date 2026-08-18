"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

import {
  LoaderCircle,
} from "lucide-react";

export default function AppLayout({
  children,
}) {
  const router = useRouter();

  const status =
    useSelector(
      (state) => state.auth.status
    );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (
    status === "checking" ||
    status === "unauthenticated"
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-base-100">
        <LoaderCircle
          size={28}
          className="animate-spin"
        />
      </main>
    );
  }

  return children;
}
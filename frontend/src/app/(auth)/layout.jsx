"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

import Link from "next/link";

import {
  Cloud,
  LoaderCircle,
} from "lucide-react";

import {
  motion,
} from "framer-motion";

import ThemeSwitcher from "@/components/ThemeSwitcher";

export default function AuthLayout({
  children,
}) {
  const router = useRouter();

  const status = useSelector(
    (state) => state.auth.status
  );

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  // ==================== SESSION CHECK ====================

  if (
    status === "checking" ||
    status === "authenticated"
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-base-100">
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.92,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 0.25,
          }}
          className="flex flex-col items-center gap-3"
        >
          <LoaderCircle
            size={28}
            className="animate-spin"
          />

          <p className="text-sm opacity-50">
            Restoring your session...
          </p>
        </motion.div>
      </main>
    );
  }

  // ==================== AUTH SHELL ====================

  return (
    <main
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-base-100
        text-base-content
      "
    >
      {/* Soft decorative background */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          -z-10
          overflow-hidden
        "
      >
        <div
          className="
            absolute
            -left-24
            top-24
            h-72
            w-72
            rounded-full
            bg-base-300/40
            blur-3xl
          "
        />

        <div
          className="
            absolute
            -right-24
            bottom-16
            h-80
            w-80
            rounded-full
            bg-base-200
            blur-3xl
          "
        />
      </div>

      {/* ==================== HEADER ==================== */}

      <motion.header
        initial={{
          opacity: 0,
          y: -12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.35,
          ease: "easeOut",
        }}
        className="
          mx-auto
          flex
          h-16
          max-w-7xl
          items-center
          justify-between
          px-5
          sm:px-8
          lg:px-10
        "
      >
        <Link
          href="/"
          className="group flex items-center gap-2.5"
        >
          <motion.div
            whileHover={{
              rotate: -5,
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.96,
            }}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              bg-base-content
              text-base-100
              shadow-sm
            "
          >
            <Cloud size={19} />
          </motion.div>

          <span
            className="
              text-lg
              font-bold
              tracking-tight
              transition-opacity
              group-hover:opacity-75
            "
          >
            Orivox
          </span>
        </Link>

        <ThemeSwitcher />
      </motion.header>

      {/* ==================== CONTENT ==================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 18,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.45,
          delay: 0.05,
          ease: "easeOut",
        }}
      >
        {children}
      </motion.div>
    </main>
  );
}
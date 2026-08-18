"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, CircleX, Clock3, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function EmailVerifiedPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  const config = {
    success: {
      icon: CheckCircle2,
      title: "Email verified",
      message: "Your email has been verified successfully. You can now sign in to Orivox.",
    },
    expired: {
      icon: Clock3,
      title: "Verification link expired",
      message: "This verification link has expired. Request a new verification email and try again.",
    },
    invalid: {
      icon: CircleX,
      title: "Invalid verification link",
      message: "This verification link is invalid or may have already been used.",
    },
  };

  const result = config[status] || config.invalid;
  const Icon = result.icon;
  const isSuccess = status === "success";

  return (
    <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center justify-center overflow-hidden px-5 py-10 sm:px-8 lg:px-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.55, scale: 1, x: [0, 18, -10, 0], y: [0, -14, 10, 0] }}
        transition={{
          opacity: { duration: 0.8 },
          scale: { duration: 0.8 },
          x: { duration: 10, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 8, repeat: Infinity, ease: "easeInOut" },
        }}
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-base-300 blur-[130px]"
      />

      <motion.div
        initial={{ opacity: 0, y: 45, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 155, damping: 18 }}
        className="w-full max-w-[460px]"
      >
        <motion.div
          initial={{ opacity: 0, rotateX: 12 }}
          animate={{ opacity: 1, rotateX: 0 }}
          transition={{ duration: 0.55 }}
          whileHover={{ y: -3 }}
          className="relative overflow-hidden rounded-[2rem] border border-base-300 bg-base-100/90 p-7 text-center shadow-2xl shadow-base-300/25 backdrop-blur-xl sm:p-9"
        >
          <motion.div
            initial={{ x: "-130%" }}
            animate={{ x: "180%" }}
            transition={{ delay: 0.2, duration: 1.5, ease: "easeInOut" }}
            className="pointer-events-none absolute top-0 h-px w-52 bg-gradient-to-r from-transparent via-base-content/50 to-transparent"
          />

          <motion.div
            initial={{ scale: 0, rotate: -35 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.08, type: "spring", stiffness: 270, damping: 14 }}
            whileHover={{ rotate: isSuccess ? 6 : -6, scale: 1.08 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-base-content text-base-100 shadow-lg"
          >
            <Icon size={29} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="mt-6 text-3xl font-black tracking-[-0.03em] sm:text-4xl"
          >
            {result.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 0.65, y: 0 }}
            transition={{ delay: 0.28 }}
            className="mt-4 leading-7"
          >
            {result.message}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 }}
            className="mt-8"
          >
            {isSuccess ? (
              <motion.div whileHover={{ scale: 1.015, y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link href="/login" className="btn btn-neutral h-12 w-full rounded-xl font-semibold">
                  Sign in
                  <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1.5 }}>
                    <ArrowRight size={17} />
                  </motion.span>
                </Link>
              </motion.div>
            ) : (
              <div className="space-y-2">
                <motion.div whileHover={{ scale: 1.015, y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Link href="/resend-verification" className="btn btn-neutral h-12 w-full rounded-xl font-semibold">
                    Request new link
                  </Link>
                </motion.div>

                <motion.div whileHover={{ x: -3 }} whileTap={{ scale: 0.98 }}>
                  <Link href="/login" className="btn btn-ghost h-12 w-full rounded-xl">
                    Back to sign in
                  </Link>
                </motion.div>
              </div>
            )}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.4, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mt-5 flex items-center justify-center gap-2 text-xs"
        >
          <ShieldCheck size={14} />
          Secure verification powered by Orivox
        </motion.div>
      </motion.div>
    </section>
  );
}
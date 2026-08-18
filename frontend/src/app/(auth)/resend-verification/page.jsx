"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, LoaderCircle, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { api } from "@/lib/api";

export default function ResendVerificationPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;

    setError("");
    setSuccess(false);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Email is required.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/resend-verification", {
        email: normalizedEmail,
      });

      setSuccess(true);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to send verification email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center justify-center overflow-hidden px-5 py-10 sm:px-8 lg:px-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.55, scale: 1, x: [0, 18, -10, 0], y: [0, -15, 10, 0] }}
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
            whileHover={{ y: -3 }}
            transition={{ duration: 0.55 }}
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
              whileHover={{ rotate: 6, scale: 1.08 }}
              transition={{ delay: 0.08, type: "spring", stiffness: 270, damping: 14 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-base-content text-base-100 shadow-lg"
            >
              <CheckCircle2 size={29} />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="mt-6 text-3xl font-black tracking-[-0.03em] sm:text-4xl"
            >
              Verification email sent
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 0.65, y: 0 }}
              transition={{ delay: 0.28 }}
              className="mt-4 leading-7"
            >
              We sent a new verification link to{" "}
              <span className="font-semibold opacity-100">
                {email.trim().toLowerCase()}
              </span>
              .
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.38 }}
              className="mt-2 text-sm"
            >
              Check your inbox and spam folder.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42 }}
              className="mt-8 space-y-2"
            >
              <motion.div whileHover={{ scale: 1.015, y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link href="/login" className="btn btn-neutral h-12 w-full rounded-xl font-semibold">
                  Back to sign in
                  <ArrowRight size={17} />
                </Link>
              </motion.div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSuccess(false)}
                className="btn btn-ghost h-12 w-full rounded-xl"
              >
                Send again
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.4, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mt-5 flex items-center justify-center gap-2 text-xs"
          >
            <ShieldCheck size={14} />
            Secure email verification
          </motion.div>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center justify-center overflow-hidden px-5 py-10 sm:px-8 lg:px-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.55, scale: 1, x: [0, 20, -10, 0], y: [0, -18, 12, 0] }}
        transition={{
          opacity: { duration: 0.8 },
          scale: { duration: 0.8 },
          x: { duration: 10, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 8, repeat: Infinity, ease: "easeInOut" },
        }}
        className="pointer-events-none absolute -left-24 top-16 -z-10 h-72 w-72 rounded-full bg-base-300 blur-[100px]"
      />

      <motion.div
        animate={{ x: [0, -20, 14, 0], y: [0, 18, -10, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-24 bottom-12 -z-10 h-80 w-80 rounded-full bg-base-200 blur-[105px]"
      />

      <motion.div
        initial={{ opacity: 0, y: 45, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 155, damping: 18 }}
        className="w-full max-w-[460px]"
      >
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            whileHover={{ rotate: -8, scale: 1.08 }}
            transition={{ delay: 0.08, type: "spring", stiffness: 270, damping: 15 }}
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-base-content text-base-100 shadow-lg"
          >
            <Mail size={24} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="mt-6 text-3xl font-black tracking-[-0.035em] sm:text-4xl"
          >
            Resend verification
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 0.55, y: 0 }}
            transition={{ delay: 0.24 }}
            className="mx-auto mt-3 max-w-sm text-sm leading-6"
          >
            Enter the email you used to create your Orivox account and we’ll send a fresh verification link.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30, rotateX: 7 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ delay: 0.12, duration: 0.55, ease: "easeOut" }}
          whileHover={{ y: -3 }}
          className="relative overflow-hidden rounded-[2rem] border border-base-300 bg-base-100/90 p-6 shadow-2xl shadow-base-300/25 backdrop-blur-xl sm:p-8"
        >
          <motion.div
            initial={{ x: "-130%" }}
            animate={{ x: "190%" }}
            transition={{ delay: 0.35, duration: 1.6, ease: "easeInOut" }}
            className="pointer-events-none absolute top-0 h-px w-52 bg-gradient-to-r from-transparent via-base-content/50 to-transparent"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.28 }}
            className="mb-6 flex items-center gap-2 rounded-xl bg-base-200 px-3 py-2.5 text-xs font-medium opacity-70"
          >
            <Sparkles size={14} />
            A new link will replace your previous verification attempt.
          </motion.div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key={error}
                initial={{ opacity: 0, x: -18, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 18 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                className="alert alert-error mb-6 rounded-xl text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <label htmlFor="email" className="mb-2 block text-sm font-semibold">
                Email
              </label>

              <motion.div
                whileFocusWithin={{ scale: 1.012, y: -2 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                className="relative"
              >
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                  disabled={loading}
                  className="input input-bordered h-12 w-full rounded-xl bg-base-100 pl-11 focus:shadow-lg"
                />
              </motion.div>
            </motion.div>

            <motion.button
              type="submit"
              disabled={loading}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={loading ? {} : { scale: 1.02, y: -2 }}
              whileTap={loading ? {} : { scale: 0.97 }}
              className="btn btn-neutral h-12 w-full rounded-xl font-semibold"
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center gap-2"
                  >
                    <LoaderCircle size={17} className="animate-spin" />
                    Sending...
                  </motion.span>
                ) : (
                  <motion.span
                    key="normal"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2"
                  >
                    Send verification email

                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1.5 }}
                    >
                      <ArrowRight size={17} />
                    </motion.span>
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-7 border-t border-base-300 pt-6"
          >
            <motion.div whileHover={{ x: -4 }} whileTap={{ scale: 0.97 }}>
              <Link href="/login" className="flex items-center justify-center gap-2 text-sm font-semibold opacity-55 transition hover:opacity-100">
                <ArrowLeft size={16} />
                Already verified? Sign in
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.4, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-5 flex items-center justify-center gap-2 text-xs"
        >
          <ShieldCheck size={14} />
          Secure verification flow
        </motion.div>
      </motion.div>
    </section>
  );
}
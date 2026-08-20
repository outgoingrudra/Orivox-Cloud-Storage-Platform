"use client";

import Link from "next/link";

import {
  KeyRound,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import { motion } from "framer-motion";

export default function SecuritySettings() {
  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: 0.14,
      }}
      whileHover={{
        y: -2,
      }}
      className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6"
    >
      <div className="flex items-center gap-3">
        <motion.div
          whileHover={{
            rotate: -4,
            scale: 1.06,
          }}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-base-200"
        >
          <ShieldCheck size={18} />
        </motion.div>

        <div>
          <h2 className="font-bold">
            Security
          </h2>

          <p className="mt-0.5 text-xs opacity-45">
            Protect access to your Orivox account.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {/* PASSWORD */}

        <motion.div
          whileHover={{
            x: 3,
          }}
          className="flex flex-col gap-4 rounded-2xl border border-base-300 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-base-200">
              <LockKeyhole
                size={18}
              />
            </div>

            <div>
              <p className="text-sm font-semibold">
                Password
              </p>

              <p className="mt-1 text-xs leading-5 opacity-45">
                Reset your password using a secure email verification link.
              </p>
            </div>
          </div>

          <Link
            href="/forgot-password"
            className="btn btn-outline btn-sm rounded-xl"
          >
            <KeyRound size={15} />
            Change password
          </Link>
        </motion.div>

        {/* SESSIONS */}

        <motion.div
          whileHover={{
            x: 3,
          }}
          className="flex flex-col gap-4 rounded-2xl border border-base-300 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-base-200">
              <ShieldCheck
                size={18}
              />
            </div>

            <div>
              <p className="text-sm font-semibold">
                Active sessions
              </p>

              <p className="mt-1 text-xs leading-5 opacity-45">
                Review devices currently signed into your account.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled
            className="btn btn-outline btn-sm rounded-xl"
          >
            Coming soon
          </button>
        </motion.div>
      </div>
    </motion.section>
  );
}
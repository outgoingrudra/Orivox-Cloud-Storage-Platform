"use client";

import {
  AlertTriangle,
  RefreshCw,
  RotateCcw,
} from "lucide-react";

import { motion } from "framer-motion";

export default function AppError({
  error,
  reset,
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <motion.div
        initial={{
          opacity: 0,
          y: 30,
          scale: 0.94,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          type: "spring",
          stiffness: 180,
          damping: 20,
        }}
        className="w-full max-w-xl rounded-[2rem] border border-base-300 bg-base-100 p-7 text-center shadow-xl"
      >
        <motion.div
          initial={{
            scale: 0,
            rotate: -25,
          }}
          animate={{
            scale: 1,
            rotate: 0,
          }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 16,
          }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-base-200"
        >
          <AlertTriangle size={28} />
        </motion.div>

        <h1 className="mt-6 text-2xl font-black tracking-[-0.03em] sm:text-3xl">
          This workspace hit a problem
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 opacity-55">
          Something went wrong while loading this part of Orivox. You can retry
          without leaving the application.
        </p>

        {error?.message && (
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.15,
            }}
            className="mt-6 rounded-xl border border-base-300 bg-base-200/50 p-4 text-left"
          >
            <p className="text-xs font-bold uppercase tracking-[0.14em] opacity-35">
              Error
            </p>

            <p className="mt-2 break-words text-sm opacity-65">
              {error.message}
            </p>

            {error?.digest && (
              <p className="mt-2 font-mono text-[11px] opacity-30">
                ID: {error.digest}
              </p>
            )}
          </motion.div>
        )}

        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
          <motion.button
            type="button"
            whileHover={{
              y: -2,
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.97,
            }}
            onClick={reset}
            className="btn btn-neutral rounded-xl"
          >
            <RotateCcw size={16} />
            Try again
          </motion.button>

          <motion.button
            type="button"
            whileHover={{
              y: -2,
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.97,
            }}
            onClick={() =>
              window.location.reload()
            }
            className="btn btn-outline rounded-xl"
          >
            <RefreshCw size={16} />
            Reload
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
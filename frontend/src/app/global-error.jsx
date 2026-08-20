"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Cloud,
  Home,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import { motion } from "framer-motion";

export default function GlobalError({
  error,
  reset,
}) {
  return (
    <html lang="en">
      <body>
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-base-100 px-5 py-10 text-base-content">
          {/* ==================== BACKGROUND GRID ==================== */}

          <div
            className="pointer-events-none absolute inset-0 opacity-[0.045]"
            style={{
              backgroundImage: `
                linear-gradient(to right, currentColor 1px, transparent 1px),
                linear-gradient(to bottom, currentColor 1px, transparent 1px)
              `,
              backgroundSize: "44px 44px",
            }}
          />

          {/* ==================== BROKEN CLOUD CORE ==================== */}

          <motion.div
            animate={{
              scale: [1, 1.06, 0.98, 1],
              rotate: [0, 2, -2, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute left-1/2 top-[16%] -translate-x-1/2"
          >
            <div className="relative">
              <div className="h-56 w-56 rounded-full bg-base-300/60 blur-[90px]" />

              <motion.div
                animate={{
                  opacity: [0.3, 0.8, 0.3],
                  scale: [1, 1.08, 1],
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                }}
                className="absolute inset-0 m-auto flex h-24 w-24 items-center justify-center rounded-[2rem] border border-base-300 bg-base-100/80 shadow-2xl backdrop-blur-xl"
              >
                <ShieldAlert size={38} />
              </motion.div>
            </div>
          </motion.div>

          {/* ==================== FLOATING GLITCH ELEMENTS ==================== */}

          <motion.div
            animate={{
              y: [0, -14, 0],
              x: [0, 6, 0],
              rotate: [0, -4, 4, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute left-[8%] top-[24%] hidden h-13 w-13 items-center justify-center rounded-2xl border border-base-300 bg-base-100/80 shadow-xl backdrop-blur lg:flex"
          >
            <AlertTriangle size={22} />
          </motion.div>

          <motion.div
            animate={{
              y: [0, 16, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute right-[10%] top-[28%] hidden h-12 w-12 items-center justify-center rounded-full border border-base-300 bg-base-100/80 shadow-xl backdrop-blur lg:flex"
          >
            <Cloud size={21} />
          </motion.div>

          {/* ==================== CONTENT ==================== */}

          <section className="relative z-10 mx-auto mt-28 w-full max-w-3xl text-center">
            <motion.div
              initial={{
                opacity: 0,
                y: 35,
                scale: 0.92,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              transition={{
                type: "spring",
                stiffness: 150,
                damping: 18,
              }}
            >
              <motion.div
                initial={{
                  opacity: 0,
                  y: -10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="mx-auto inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] backdrop-blur-xl"
              >
                <Sparkles size={14} />
                Orivox recovery mode
              </motion.div>

              <motion.h1
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.08,
                }}
                className="mt-8 text-4xl font-black tracking-[-0.05em] sm:text-6xl"
              >
                System link interrupted.
              </motion.h1>

              <motion.p
                initial={{
                  opacity: 0,
                  y: 14,
                }}
                animate={{
                  opacity: 0.55,
                  y: 0,
                }}
                transition={{
                  delay: 0.16,
                }}
                className="mx-auto mt-4 max-w-xl text-sm leading-7 sm:text-base"
              >
                Orivox hit an unexpected error while processing this workspace.
                Your stored files are not affected by this screen.
              </motion.p>

              {/* ==================== ERROR CARD ==================== */}

              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                  scale: 0.96,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                transition={{
                  delay: 0.25,
                }}
                className="mx-auto mt-8 max-w-xl rounded-2xl border border-base-300 bg-base-100/80 p-5 text-left shadow-xl backdrop-blur-xl"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-base-200">
                    <AlertTriangle size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      Unexpected application error
                    </p>

                    <p className="mt-1 break-words text-xs leading-5 opacity-45">
                      {error?.message ||
                        "An unknown error interrupted the application."}
                    </p>

                    {error?.digest && (
                      <p className="mt-3 font-mono text-[11px] opacity-30">
                        Error ID: {error.digest}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* ==================== ACTIONS ==================== */}

              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.34,
                }}
                className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"
              >
                <motion.button
                  type="button"
                  whileHover={{
                    y: -3,
                    scale: 1.02,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  onClick={reset}
                  className="btn btn-neutral h-12 rounded-xl px-6"
                >
                  <RotateCcw size={17} />
                  Try again
                </motion.button>

                <motion.div
                  whileHover={{
                    y: -3,
                    scale: 1.02,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                >
                  <Link
                    href="/dashboard"
                    className="btn btn-outline h-12 w-full rounded-xl px-6 sm:w-auto"
                  >
                    <Home size={17} />
                    Dashboard
                  </Link>
                </motion.div>

                <motion.button
                  type="button"
                  whileHover={{
                    y: -3,
                    scale: 1.02,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  onClick={() =>
                    window.location.reload()
                  }
                  className="btn btn-ghost h-12 rounded-xl px-6"
                >
                  <RefreshCw size={17} />
                  Reload app
                </motion.button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 0.3,
              }}
              transition={{
                delay: 0.55,
              }}
              className="mt-10 flex items-center justify-center gap-2 text-xs"
            >
              <Cloud size={14} />
              Orivox Cloud Storage
            </motion.div>
          </section>
        </main>
      </body>
    </html>
  );
}
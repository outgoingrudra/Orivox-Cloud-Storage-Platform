"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Cloud,
  FileQuestion,
  Home,
  Orbit,
  SearchX,
  Sparkles,
} from "lucide-react";

import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-base-100 px-5 py-10 text-base-content">
      {/* ==================== BACKGROUND GRID ==================== */}

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: "42px 42px",
        }}
      />

      {/* ==================== GLOW ORBS ==================== */}

      <motion.div
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.08, 0.96, 1],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-base-300/70 blur-[120px]"
      />

      <motion.div
        animate={{
          x: [0, -30, 25, 0],
          y: [0, 25, -20, 0],
          scale: [1, 0.95, 1.06, 1],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-base-200 blur-[130px]"
      />

      {/* ==================== FLOATING OBJECTS ==================== */}

      <motion.div
        animate={{
          y: [0, -14, 0],
          rotate: [0, 5, -4, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-[8%] top-[18%] hidden h-14 w-14 items-center justify-center rounded-2xl border border-base-300 bg-base-100/80 shadow-xl backdrop-blur lg:flex"
      >
        <FileQuestion size={24} />
      </motion.div>

      <motion.div
        animate={{
          y: [0, 16, 0],
          rotate: [0, -5, 4, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute right-[10%] top-[22%] hidden h-12 w-12 items-center justify-center rounded-full border border-base-300 bg-base-100/80 shadow-xl backdrop-blur lg:flex"
      >
        <Orbit size={21} />
      </motion.div>

      <motion.div
        animate={{
          y: [0, -10, 0],
          x: [0, 8, 0],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[14%] left-[14%] hidden h-12 w-12 items-center justify-center rounded-xl border border-base-300 bg-base-100/80 shadow-xl backdrop-blur md:flex"
      >
        <Cloud size={21} />
      </motion.div>

      {/* ==================== CONTENT ==================== */}

      <section className="relative z-10 mx-auto w-full max-w-4xl text-center">
        <motion.div
          initial={{
            opacity: 0,
            y: 30,
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
          {/* badge */}

          <motion.div
            initial={{
              opacity: 0,
              y: -12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.1,
            }}
            className="mx-auto inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] backdrop-blur-xl"
          >
            <Sparkles size={14} />
            Lost in Orivox
          </motion.div>

          {/* 404 */}

          <div className="relative mt-8">
            <motion.h1
              initial={{
                opacity: 0,
                scale: 0.75,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                delay: 0.1,
                type: "spring",
                stiffness: 160,
                damping: 15,
              }}
              className="select-none text-[8rem] font-black leading-none tracking-[-0.08em] sm:text-[11rem] lg:text-[14rem]"
            >
              404
            </motion.h1>

            <motion.div
              animate={{
                x: ["-120%", "130%"],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                repeatDelay: 1.4,
                ease: "easeInOut",
              }}
              className="pointer-events-none absolute left-1/2 top-1/2 h-px w-72 -translate-x-1/2 bg-gradient-to-r from-transparent via-base-content/60 to-transparent sm:w-[30rem]"
            />
          </div>

          {/* title */}

          <motion.h2
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.22,
            }}
            className="text-2xl font-black tracking-[-0.03em] sm:text-4xl"
          >
            This file path vanished into the cloud.
          </motion.h2>

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
              delay: 0.3,
            }}
            className="mx-auto mt-4 max-w-xl text-sm leading-7 sm:text-base"
          >
            The page you&apos;re looking for may have been moved, deleted, renamed,
            or perhaps it never existed in this workspace.
          </motion.p>

          {/* search illusion */}

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
              delay: 0.38,
            }}
            className="mx-auto mt-8 flex max-w-lg items-center gap-3 rounded-2xl border border-base-300 bg-base-100/80 px-4 py-3 text-left shadow-xl backdrop-blur-xl"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-base-200">
              <SearchX size={19} />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold">
                Resource not found
              </p>

              <p className="mt-0.5 truncate text-xs opacity-40">
                Orivox searched this location but couldn&apos;t resolve it.
              </p>
            </div>
          </motion.div>

          {/* actions */}

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
              delay: 0.46,
            }}
            className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"
          >
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
                className="btn btn-neutral h-12 w-full rounded-xl px-6 sm:w-auto"
              >
                <Home size={17} />
                Back to dashboard
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
              onClick={() => history.back()}
              className="btn btn-outline h-12 rounded-xl px-6"
            >
              <ArrowLeft size={17} />
              Go back
            </motion.button>
          </motion.div>
        </motion.div>

        {/* bottom status */}

        <motion.div
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 0.35,
            y: 0,
          }}
          transition={{
            delay: 0.65,
          }}
          className="mt-10 flex items-center justify-center gap-2 text-xs"
        >
          <Cloud size={14} />
          Orivox Cloud Storage
        </motion.div>
      </section>
    </main>
  );
}
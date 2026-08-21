"use client";

import {
  MoonStar,
  Palette,
  Sparkles,
} from "lucide-react";

import { motion } from "framer-motion";

import ThemeSwitcher from "@/components/ThemeSwitcher";

export default function AppearanceSettings() {
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
        delay: 0.2,
      }}
      whileHover={{
        y: -2,
      }}
      className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6"
    >
      <div className="flex items-center gap-3">
        <motion.div
          whileHover={{
            rotate: 8,
            scale: 1.06,
          }}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-base-200"
        >
          <Palette size={18} />
        </motion.div>

        <div>
          <h2 className="font-bold">
            Appearance
          </h2>

          <p className="mt-0.5 text-xs opacity-45">
            Personalize how Orivox looks.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-base-300 bg-base-200/40 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-base-100">
              <MoonStar size={18} />
            </div>

            <div>
              <p className="text-sm font-semibold">
                Theme
              </p>

              <p className="mt-1 max-w-md text-xs leading-5 opacity-45">
                Switch between Orivox themes. Your selected theme is applied across the application.
              </p>
            </div>
          </div>

          <ThemeSwitcher />
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 text-xs opacity-40">
        <Sparkles
          size={14}
          className="mt-0.5 shrink-0"
        />

        <p>
          Black and white remains the primary Orivox design, with optional DaisyUI themes available.
        </p>
      </div>
    </motion.section>
  );
}
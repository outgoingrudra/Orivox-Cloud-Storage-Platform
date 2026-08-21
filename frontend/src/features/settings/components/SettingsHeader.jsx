"use client";

import { Settings2 } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-4"
    >
      <motion.div
        initial={{ scale: 0, rotate: -18 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 250,
          damping: 17,
        }}
        whileHover={{
          rotate: -5,
          scale: 1.06,
        }}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-base-content text-base-100"
      >
        <Settings2 size={21} />
      </motion.div>

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-35">
          Account
        </p>

        <h1 className="mt-1 text-3xl font-black tracking-[-0.035em] sm:text-4xl">
          Settings
        </h1>

        <p className="mt-1 text-sm opacity-50">
          Manage your account, security, appearance and storage.
        </p>
      </div>
    </motion.header>
  );
}
"use client";

import {
  Folder,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { motion } from "framer-motion";

export default function SharedFolderCard({
  share,
  index,
  onOpen,
}) {
  const folder = share.folder;
  const sharedBy =
    share.sharedBy;

  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: index * 0.04,
      }}
      whileHover={{
        y: -4,
        scale: 1.01,
      }}
      className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <motion.div
          whileHover={{
            rotate: -4,
            scale: 1.07,
          }}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-base-200"
        >
          <Folder size={21} />
        </motion.div>

        <span className="badge badge-outline badge-sm">
          {share.permission}
        </span>
      </div>

      <p className="mt-5 truncate font-semibold">
        {folder?.name ||
          "Shared folder"}
      </p>

      <div className="mt-4 flex items-center gap-2 rounded-xl bg-base-200/50 p-3">
        <UserRound size={15} />

        <div className="min-w-0">
          <p className="truncate text-xs font-semibold">
            Shared by{" "}
            {sharedBy?.name ||
              sharedBy?.email ||
              "Orivox user"}
          </p>

          {sharedBy?.email && (
            <p className="truncate text-[11px] opacity-40">
              {sharedBy.email}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs opacity-45">
        <ShieldCheck size={14} />

        {share.permission ===
        "EDITOR"
          ? "Can view and edit"
          : "Can view"}
      </div>

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
          onOpen?.(folder)
        }
        className="btn btn-neutral btn-sm mt-4 w-full rounded-xl"
      >
        <Folder size={15} />
        Open folder
      </motion.button>
    </motion.article>
  );
}
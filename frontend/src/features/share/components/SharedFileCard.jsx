"use client";

import {
  Download,
  FileText,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { motion } from "framer-motion";

import {
  formatBytes,
  getFileIcon,
} from "@/features/files/file.utils";

export default function SharedFileCard({
  share,
  index,
}) {
  const file = share.file;

  const Icon =
    getFileIcon(file?.mimeType) ||
    FileText;

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
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-base-200">
          <Icon size={21} />
        </div>

        <span className="badge badge-outline badge-sm">
          {share.permission}
        </span>
      </div>

      <p className="mt-5 truncate font-semibold">
        {file?.name || "Shared file"}
      </p>

      <div className="mt-1 flex gap-2 text-xs opacity-40">
        <span>
          {formatBytes(
            file?.size || 0
          )}
        </span>

        <span>•</span>

        <span>
          {file?.updatedAt
            ? new Date(
                file.updatedAt
              ).toLocaleDateString()
            : "—"}
        </span>
      </div>

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

      <button
        type="button"
        disabled
        className="btn btn-outline btn-sm mt-4 w-full rounded-xl"
      >
        <Download size={15} />
        Open / Download
      </button>
    </motion.article>
  );
}
"use client";

import {
  Folder,
  MoreVertical,
} from "lucide-react";

import { motion } from "framer-motion";

export default function FolderCard({
  folder,
  index,
  onOpen,
}) {
  const folderCount =
    folder._count?.folders ??
    folder.folderCount ??
    0;

  const fileCount =
    folder._count?.files ??
    folder.fileCount ??
    0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.04,
      }}
      whileHover={{
        y: -4,
        scale: 1.01,
      }}
      onDoubleClick={() =>
        onOpen(folder.id)
      }
      className="group cursor-pointer rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm transition"
    >
      <div className="flex items-start justify-between">
        <motion.button
          type="button"
          whileHover={{
            scale: 1.08,
            rotate: -3,
          }}
          whileTap={{
            scale: 0.95,
          }}
          onClick={() =>
            onOpen(folder.id)
          }
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-base-200"
          aria-label={`Open ${folder.name}`}
        >
          <Folder size={21} />
        </motion.button>

        <button
          type="button"
          onClick={(event) =>
            event.stopPropagation()
          }
          className="btn btn-ghost btn-circle btn-sm opacity-50 group-hover:opacity-100"
          aria-label={`Actions for ${folder.name}`}
        >
          <MoreVertical size={17} />
        </button>
      </div>

      <button
        type="button"
        onClick={() =>
          onOpen(folder.id)
        }
        className="mt-5 block w-full truncate text-left font-semibold hover:underline"
      >
        {folder.name}
      </button>

      <p className="mt-1 text-xs opacity-40">
        {folderCount} folders • {fileCount} files
      </p>
    </motion.article>
  );
}
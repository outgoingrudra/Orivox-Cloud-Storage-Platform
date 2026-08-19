"use client";

import { useState } from "react";

import {
  Folder,
  LoaderCircle,
  MoreVertical,
  Trash2,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import { useTrashFolder } from "@/features/files/useTrashFolder";

export default function FolderCard({
  folder,
  index,
  onOpen,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState("");

  const trashMutation = useTrashFolder();

  const folderCount =
    folder._count?.folders ??
    folder.folderCount ??
    0;

  const fileCount =
    folder._count?.files ??
    folder.fileCount ??
    0;

  async function handleTrash() {
    if (trashMutation.isPending) return;

    const confirmed = window.confirm(
      `Move "${folder.name}" to trash?`
    );

    if (!confirmed) return;

    setError("");

    try {
      await trashMutation.mutateAsync(
        folder.id
      );

      setMenuOpen(false);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to move folder to trash."
      );
    }
  }

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
      className="group relative cursor-pointer rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm transition"
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

        {/* ACTION MENU */}

        <div className="relative">
          <motion.button
            type="button"
            whileHover={{
              scale: 1.08,
            }}
            whileTap={{
              scale: 0.9,
            }}
            onClick={(event) => {
              event.stopPropagation();

              setMenuOpen(
                (value) => !value
              );
            }}
            className="btn btn-ghost btn-circle btn-sm opacity-50 transition group-hover:opacity-100"
            aria-label={`Actions for ${folder.name}`}
          >
            <MoreVertical size={17} />
          </motion.button>

          <AnimatePresence>
            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close folder actions"
                  onClick={(event) => {
                    event.stopPropagation();
                    setMenuOpen(false);
                  }}
                  className="fixed inset-0 z-40 cursor-default"
                />

                <motion.div
                  initial={{
                    opacity: 0,
                    y: -6,
                    scale: 0.95,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    y: -4,
                    scale: 0.96,
                  }}
                  transition={{
                    duration: 0.16,
                  }}
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                  className="absolute right-0 top-10 z-50 w-44 rounded-xl border border-base-300 bg-base-100 p-1.5 shadow-xl"
                >
                  <motion.button
                    type="button"
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleTrash}
                    disabled={
                      trashMutation.isPending
                    }
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-error transition hover:bg-error/10"
                  >
                    {trashMutation.isPending ? (
                      <LoaderCircle
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Trash2 size={16} />
                    )}

                    {trashMutation.isPending
                      ? "Moving..."
                      : "Move to trash"}
                  </motion.button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
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

      {error && (
        <motion.p
          initial={{
            opacity: 0,
            y: -3,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mt-3 text-xs text-error"
        >
          {error}
        </motion.p>
      )}
    </motion.article>
  );
}
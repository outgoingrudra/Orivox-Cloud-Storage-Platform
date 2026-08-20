"use client";

import { useState } from "react";

import {
  Download,
  FilePenLine,
  LoaderCircle,
  MoreVertical,
  MoveRight,
  Share2,
  Trash2,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import { useTrashFile } from "@/features/files/useTrashFile";
import { useTrashFolder } from "@/features/files/useTrashFolder";
import { useDownloadFile } from "@/features/files/useDownloadFile";

import RenameModal from "@/features/files/components/RenameModal";
import MoveModal from "@/features/files/components/MoveModal";
import ShareModal from "@/features/share/components/ShareModal";

export default function ExplorerRowActions({
  item,
  type,
}) {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const [renameOpen, setRenameOpen] =
    useState(false);

  const [moveOpen, setMoveOpen] =
    useState(false);

  const [shareOpen, setShareOpen] =
    useState(false);

  const [error, setError] =
    useState("");

  const downloadMutation =
    useDownloadFile();

  const trashFileMutation =
    useTrashFile();

  const trashFolderMutation =
    useTrashFolder();

  const isFile =
    type === "file";

  const trashMutation =
    isFile
      ? trashFileMutation
      : trashFolderMutation;

  async function handleDownload() {
    if (
      !isFile ||
      downloadMutation.isPending
    ) {
      return;
    }

    setError("");

    try {
      const data =
        await downloadMutation.mutateAsync(
          item.id
        );

      const downloadUrl =
        data.downloadUrl ||
        data.url;

      if (!downloadUrl) {
        throw new Error(
          "Download URL missing"
        );
      }

      setMenuOpen(false);

      window.location.href =
        downloadUrl;
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to download file."
      );
    }
  }

  async function handleTrash() {
    if (trashMutation.isPending) {
      return;
    }

    const confirmed =
      window.confirm(
        `Move "${item.name}" to trash?`
      );

    if (!confirmed) return;

    setError("");

    try {
      await trashMutation.mutateAsync(
        item.id
      );

      setMenuOpen(false);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          `Unable to move ${type} to trash.`
      );
    }
  }

  function handleShare() {
    setMenuOpen(false);
    setShareOpen(true);
  }

  function handleRename() {
    setMenuOpen(false);
    setRenameOpen(true);
  }

  function handleMove() {
    setMenuOpen(false);
    setMoveOpen(true);
  }

  return (
    <>
      <div
        className="relative"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <motion.button
          type="button"
          whileHover={{
            scale: 1.08,
          }}
          whileTap={{
            scale: 0.92,
          }}
          onClick={() =>
            setMenuOpen(
              (value) => !value
            )
          }
          className="btn btn-ghost btn-circle btn-sm"
          aria-label={`Actions for ${item.name}`}
        >
          <MoreVertical size={17} />
        </motion.button>

        <AnimatePresence>
          {menuOpen && (
            <>
              <button
                type="button"
                aria-label="Close actions"
                onClick={() =>
                  setMenuOpen(false)
                }
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
                className="absolute right-0 top-10 z-50 w-44 rounded-xl border border-base-300 bg-base-100 p-1.5 shadow-xl"
              >
                {isFile && (
                  <motion.button
                    type="button"
                    whileHover={{ x: 3 }}
                    whileTap={{
                      scale: 0.97,
                    }}
                    onClick={
                      handleDownload
                    }
                    disabled={
                      downloadMutation.isPending
                    }
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition hover:bg-base-200"
                  >
                    {downloadMutation.isPending ? (
                      <LoaderCircle
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Download
                        size={16}
                      />
                    )}

                    {downloadMutation.isPending
                      ? "Preparing..."
                      : "Download"}
                  </motion.button>
                )}

                <motion.button
                  type="button"
                  whileHover={{ x: 3 }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  onClick={
                    handleShare
                  }
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition hover:bg-base-200"
                >
                  <Share2 size={16} />
                  Share
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ x: 3 }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  onClick={
                    handleRename
                  }
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition hover:bg-base-200"
                >
                  <FilePenLine
                    size={16}
                  />
                  Rename
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ x: 3 }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  onClick={
                    handleMove
                  }
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition hover:bg-base-200"
                >
                  <MoveRight size={16} />
                  Move
                </motion.button>

                <div className="my-1 border-t border-base-300" />

                <motion.button
                  type="button"
                  whileHover={{ x: 3 }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  onClick={
                    handleTrash
                  }
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
                    <Trash2
                      size={16}
                    />
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

      {error && (
        <p className="mt-2 text-xs text-error">
          {error}
        </p>
      )}

      <RenameModal
        open={renameOpen}
        onClose={() =>
          setRenameOpen(false)
        }
        item={item}
        type={type}
      />

      <MoveModal
        open={moveOpen}
        onClose={() =>
          setMoveOpen(false)
        }
        item={item}
        type={type}
      />

      <ShareModal
        open={shareOpen}
        onClose={() =>
          setShareOpen(false)
        }
        item={item}
        type={type}
      />
    </>
  );
}
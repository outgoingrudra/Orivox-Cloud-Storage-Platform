"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

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

import { useTrashFile } from "@/components/features/files/useTrashFile";
import { useDownloadFile } from "@/components/features/files/useDownloadFile";

import RenameModal from "@/components/features/files/components/RenameModal";
import MoveModal from "@/components/features/files/components/MoveModal";

import ShareModal from "@/components/features/share/components/ShareModal";

import {
  formatBytes,
  getFileIcon,
} from "../file.utils";

export default function FileCard({
  file,
  index,
  permission,
  sharedRootId
}) {
  const menuRef =
    useRef(null);

  const Icon =
    getFileIcon(file.mimeType);

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

  const trashMutation =
    useTrashFile();

  // ==================== PERMISSIONS ====================

  const isOwner =
    !permission ||
    permission === "OWNER";

  const canEdit =
    isOwner ||
    permission === "EDITOR";

  // ==================== OUTSIDE CLICK ====================

  useEffect(() => {
    if (!menuOpen) return;

    function handleOutsideClick(
      event
    ) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target
        )
      ) {
        setMenuOpen(false);
      }
    }

    function handleEscape(
      event
    ) {
      if (
        event.key === "Escape"
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener(
      "pointerdown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [menuOpen]);

  // ==================== DOWNLOAD ====================

  async function handleDownload() {
    if (
      downloadMutation.isPending
    ) {
      return;
    }

    setError("");

    try {
      const data =
        await downloadMutation.mutateAsync(
          file.id
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
      console.error(
        "Download failed:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to download file."
      );
    }
  }

  // ==================== TRASH ====================

  async function handleTrash() {
    if (
      !isOwner ||
      trashMutation.isPending
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Move "${file.name}" to trash?`
      );

    if (!confirmed) return;

    setError("");

    try {
      await trashMutation.mutateAsync(
        file.id
      );

      setMenuOpen(false);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to move file to trash."
      );
    }
  }

  // ==================== ACTIONS ====================

  function handleRename() {
    if (!canEdit) return;

    setMenuOpen(false);
    setRenameOpen(true);
  }

  function handleMove() {
    if (!canEdit) return;

    setMenuOpen(false);
    setMoveOpen(true);
  }

  function handleShare() {
    if (!isOwner) return;

    setMenuOpen(false);
    setShareOpen(true);
  }

  return (
    <>
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
        className="group relative rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm"
      >
        <div className="flex items-start justify-between">
          <motion.div
            whileHover={{
              scale: 1.08,
              rotate: -3,
            }}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-base-200"
          >
            <Icon size={21} />
          </motion.div>

          {/* ==================== ACTION MENU ==================== */}

          <div
            ref={menuRef}
            className="relative"
          >
            <motion.button
              type="button"
              whileHover={{
                scale: 1.08,
              }}
              whileTap={{
                scale: 0.9,
              }}
              onClick={() =>
                setMenuOpen(
                  (value) =>
                    !value
                )
              }
              className="btn btn-ghost btn-circle btn-sm opacity-50 transition group-hover:opacity-100"
              aria-label={`Actions for ${file.name}`}
            >
              <MoreVertical
                size={17}
              />
            </motion.button>

            <AnimatePresence>
              {menuOpen && (
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
                  {/* DOWNLOAD — VIEWER+ */}

                  <motion.button
                    type="button"
                    whileHover={{
                      x: 3,
                    }}
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

                  {/* SHARE — OWNER ONLY */}

                  {isOwner && (
                    <motion.button
                      type="button"
                      whileHover={{
                        x: 3,
                      }}
                      whileTap={{
                        scale: 0.97,
                      }}
                      onClick={
                        handleShare
                      }
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition hover:bg-base-200"
                    >
                      <Share2
                        size={16}
                      />
                      Share
                    </motion.button>
                  )}

                  {/* RENAME — EDITOR / OWNER */}

                  {canEdit && (
                    <motion.button
                      type="button"
                      whileHover={{
                        x: 3,
                      }}
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
                  )}

                  {/* MOVE — EDITOR / OWNER */}

                  {canEdit && (
                    <motion.button
                      type="button"
                      whileHover={{
                        x: 3,
                      }}
                      whileTap={{
                        scale: 0.97,
                      }}
                      onClick={
                        handleMove
                      }
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition hover:bg-base-200"
                    >
                      <MoveRight
                        size={16}
                      />
                      Move
                    </motion.button>
                  )}

                  {/* TRASH — OWNER ONLY */}

                  {isOwner && (
                    <>
                      <div className="my-1 border-t border-base-300" />

                      <motion.button
                        type="button"
                        whileHover={{
                          x: 3,
                        }}
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
                            size={
                              16
                            }
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2
                            size={
                              16
                            }
                          />
                        )}

                        {trashMutation.isPending
                          ? "Moving..."
                          : "Move to trash"}
                      </motion.button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ==================== FILE INFO ==================== */}

        <p className="mt-5 truncate font-semibold">
          {file.name}
        </p>

        <div className="mt-1 flex gap-2 text-xs opacity-40">
          <span>
            {formatBytes(
              file.size
            )}
          </span>

          <span>•</span>

          <span>
            {new Date(
              file.updatedAt
            ).toLocaleDateString()}
          </span>
        </div>

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

      {/* ==================== RENAME ==================== */}

      {canEdit && (
        <RenameModal
          open={renameOpen}
          onClose={() =>
            setRenameOpen(false)
          }
          item={file}
          type="file"
        />
      )}

      {/* ==================== MOVE ==================== */}

      {canEdit && (
        <MoveModal
          open={moveOpen}
          onClose={() =>
            setMoveOpen(false)
          }
          item={file}
          type="file"
          permission={permission}
          sharedRootId={sharedRootId}
        />
      )}

      {/* ==================== SHARE ==================== */}

      {isOwner && (
        <ShareModal
          open={shareOpen}
          onClose={() =>
            setShareOpen(false)
          }
          item={file}
          type="file"
        />
      )}
    </>
  );
}
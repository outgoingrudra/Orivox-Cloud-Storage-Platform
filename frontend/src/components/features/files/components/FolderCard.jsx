"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FilePenLine,
  Folder,
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

import { useTrashFolder } from "@/components/features/files/useTrashFolder";

import RenameModal from "@/components/features/files/components/RenameModal";
import MoveModal from "@/components/features/files/components/MoveModal";

import ShareModal from "@/components/features/share/components/ShareModal";

export default function FolderCard({
  folder,
  index,
  onOpen,
  permission,
   sharedRootId,
}) {
  const menuRef =
    useRef(null);

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

  const trashMutation =
    useTrashFolder();

  // ==================== PERMISSIONS ====================

  /*
    No permission prop means this is
    the user's normal owned explorer.
  */
  const isOwner =
    !permission ||
    permission === "OWNER";

  const canEdit =
    isOwner ||
    permission === "EDITOR";

  const folderCount =
    folder._count?.children ??
    folder.folderCount ??
    0;

  const fileCount =
    folder._count?.files ??
    folder.fileCount ??
    0;

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
        onDoubleClick={() =>
          onOpen(folder.id)
        }
        className="group relative cursor-pointer rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm transition"
      >
        <div className="flex items-start justify-between">
          {/* ==================== FOLDER ICON ==================== */}

          <motion.button
            type="button"
            whileHover={{
              scale: 1.08,
              rotate: -3,
            }}
            whileTap={{
              scale: 0.95,
            }}
            onClick={(event) => {
              event.stopPropagation();

              onOpen(folder.id);
            }}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-base-200"
            aria-label={`Open ${folder.name}`}
          >
            <Folder size={21} />
          </motion.button>

          {/* ==================== ACTION MENU ==================== */}

          {canEdit && (
            <div
              ref={menuRef}
              className="relative"
              onClick={(event) =>
                event.stopPropagation()
              }
              onDoubleClick={(event) =>
                event.stopPropagation()
              }
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
                aria-label={`Actions for ${folder.name}`}
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

                    {/* RENAME — OWNER / EDITOR */}

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

                    {/* MOVE — OWNER / EDITOR */}

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
          )}
        </div>

        {/* ==================== FOLDER INFO ==================== */}

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();

            onOpen(folder.id);
          }}
          className="mt-5 block w-full truncate text-left font-semibold hover:underline"
        >
          {folder.name}
        </button>

        <p className="mt-1 text-xs opacity-40">
          {folderCount} folders •{" "}
          {fileCount} files
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

      {/* ==================== RENAME MODAL ==================== */}

      {canEdit && (
        <RenameModal
          open={renameOpen}
          onClose={() =>
            setRenameOpen(false)
          }
          item={folder}
          type="folder"
        />
      )}

      {/* ==================== MOVE MODAL ==================== */}

      {canEdit && (
        <MoveModal
          open={moveOpen}
          onClose={() =>
            setMoveOpen(false)
          }
          item={folder}
          type="folder"
           permission={permission}
           sharedRootId={sharedRootId}
        />
      )}

      {/* ==================== SHARE MODAL ==================== */}

      {isOwner && (
        <ShareModal
          open={shareOpen}
          onClose={() =>
            setShareOpen(false)
          }
          item={folder}
          type="folder"
        />
      )}
    </>
  );
}
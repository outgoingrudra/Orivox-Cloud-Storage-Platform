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
import { useTrashFolder } from "@/components/features/files/useTrashFolder";
import { useDownloadFile } from "@/components/features/files/useDownloadFile";

import RenameModal from "@/components/features/files/components/RenameModal";
import MoveModal from "@/components/features/files/components/MoveModal";

import ShareModal from "@/components/features/share/components/ShareModal";

export default function ExplorerRowActions({
  item,
  type,
  permission,
  sharedRootId
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

  // ==================== PERMISSIONS ====================

  const isOwner =
    !permission ||
    permission === "OWNER";

  const canEdit =
    isOwner ||
    permission === "EDITOR";

  /*
    VIEWER folder rows have zero actions.

    File rows still have Download,
    so they keep the action menu.
  */
  const hasActions =
    isFile ||
    canEdit ||
    isOwner;

  // ==================== OUTSIDE CLICK / ESC ====================

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

  // ==================== ACTIONS ====================

  function handleShare() {
    if (!isOwner) return;

    setMenuOpen(false);
    setShareOpen(true);
  }

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

  if (!hasActions) {
    return <div />;
  }

  return (
    <>
      <div
        ref={menuRef}
        className="relative flex justify-end"
        onClick={(event) =>
          event.stopPropagation()
        }
        onDoubleClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* ==================== THREE DOTS ==================== */}

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
              (value) =>
                !value
            )
          }
          className="btn btn-ghost btn-circle btn-sm"
          aria-label={`Actions for ${item.name}`}
        >
          <MoreVertical
            size={17}
          />
        </motion.button>

        {/* ==================== MENU ==================== */}

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{
                opacity: 0,
                y: -6,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: -4,
                scale: 0.97,
              }}
              transition={{
                duration: 0.14,
              }}
              className="absolute right-0 top-9 z-[60] w-44 origin-top-right rounded-xl border border-base-300 bg-base-100 p-1.5 shadow-xl"
            >
              {/* DOWNLOAD — VIEWER+ */}

              {isFile && (
                <motion.button
                  type="button"
                  whileHover={{
                    x: 2,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  onClick={
                    handleDownload
                  }
                  disabled={
                    downloadMutation.isPending
                  }
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-base-200"
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

              {/* SHARE — OWNER ONLY */}

              {isOwner && (
                <motion.button
                  type="button"
                  whileHover={{
                    x: 2,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  onClick={
                    handleShare
                  }
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-base-200"
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
                    x: 2,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  onClick={
                    handleRename
                  }
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-base-200"
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
                    x: 2,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  onClick={
                    handleMove
                  }
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-base-200"
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
                      x: 2,
                    }}
                    whileTap={{
                      scale: 0.98,
                    }}
                    onClick={
                      handleTrash
                    }
                    disabled={
                      trashMutation.isPending
                    }
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-error transition-colors hover:bg-error/10"
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
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ==================== ERROR ==================== */}

      {error && (
        <p className="mt-2 text-xs text-error">
          {error}
        </p>
      )}

      {/* ==================== RENAME ==================== */}

      {canEdit && (
        <RenameModal
          open={renameOpen}
          onClose={() =>
            setRenameOpen(false)
          }
          item={item}
          type={type}
        />
      )}

      {/* ==================== MOVE ==================== */}

      {canEdit && (
        <MoveModal
          open={moveOpen}
          onClose={() =>
            setMoveOpen(false)
          }
          item={item}
          type={type}
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
          item={item}
          type={type}
        />
      )}
    </>
  );
}
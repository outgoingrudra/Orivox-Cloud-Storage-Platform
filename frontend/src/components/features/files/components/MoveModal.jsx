"use client";

import { useEffect, useState } from "react";
import { Folder, LoaderCircle, MoveRight, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { api } from "@/lib/api";
import { useMoveFile } from "@/components/features/files/useMoveFile";
import { useMoveFolder } from "@/components/features/files/useMoveFolder";

export default function MoveModal({
  open,
  onClose,
  item,
  type,
  permission,
  sharedRootId,
}) {
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folders, setFolders] = useState([]);
  const [path, setPath] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);

  const [loadingFolders, setLoadingFolders] = useState(false);
  const [error, setError] = useState("");

  const moveFileMutation = useMoveFile();
  const moveFolderMutation = useMoveFolder();

  const moving =
    moveFileMutation.isPending ||
    moveFolderMutation.isPending;

  const isShared = Boolean(sharedRootId);
  const canMove =
    !isShared ||
    permission === "EDITOR" ||
    permission === "OWNER";

  // =====================================================
  // RESET WHEN OPENED
  // =====================================================

  useEffect(() => {
    if (!open) return;

    /*
      Normal workspace:
        root = null

      Shared workspace:
        root = sharedRootId

      This prevents the move picker from escaping
      outside the shared folder.
    */
    const rootId = sharedRootId || null;

    setCurrentFolderId(rootId);
    setSelectedFolderId(rootId);
    setFolders([]);
    setPath([]);
    setError("");
  }, [open, sharedRootId]);

  // =====================================================
  // LOAD DESTINATION FOLDERS
  // =====================================================

  useEffect(() => {
    if (!open) return;
    loadFolders(currentFolderId);
  }, [open, currentFolderId]);

  async function loadFolders(parentId) {
    try {
      setLoadingFolders(true);
      setError("");

      const response = await api.get("/folders", {
        params: {
          parentId: parentId || undefined,
          page: 1,
          limit: 100,
          sortBy: "name",
          order: "asc",
        },
      });

      let result =
        response.data.data.folders || [];

      /*
        Do not allow moving a folder
        directly into itself.
      */
      if (type === "folder") {
        result = result.filter(
          (folder) => folder.id !== item?.id
        );
      }

      setFolders(result);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load folders."
      );
    } finally {
      setLoadingFolders(false);
    }
  }

  // =====================================================
  // OPEN A FOLDER INSIDE PICKER
  // =====================================================

  function openDestinationFolder(folder) {
    setPath((current) => [
      ...current,
      folder,
    ]);

    setCurrentFolderId(folder.id);
    setSelectedFolderId(folder.id);
  }

  // =====================================================
  // BREADCRUMB NAVIGATION
  // =====================================================

  function goToRoot() {
    setPath([]);

    const rootId = sharedRootId || null;

    setCurrentFolderId(rootId);
    setSelectedFolderId(rootId);
  }

  function goToPath(index) {
    const nextPath =
      path.slice(0, index + 1);

    const destination =
      nextPath[nextPath.length - 1];

    setPath(nextPath);

    setCurrentFolderId(
      destination?.id ||
        sharedRootId ||
        null
    );

    setSelectedFolderId(
      destination?.id ||
        sharedRootId ||
        null
    );
  }

  // =====================================================
  // MOVE
  // =====================================================

  async function handleMove() {
    if (!item || moving) return;

    if (!canMove) {
      setError(
        "You only have view permission for this shared folder."
      );
      return;
    }

    setError("");

    try {
      if (type === "file") {
        await moveFileMutation.mutateAsync({
          fileId: item.id,
          folderId: selectedFolderId,
        });
      } else {
        await moveFolderMutation.mutateAsync({
          folderId: item.id,
          parentId: selectedFolderId,
        });
      }

      onClose();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          `Unable to move ${type}.`
      );
    }
  }

  function handleClose() {
    if (moving) return;

    setError("");
    onClose();
  }

  const rootLabel =
    isShared
      ? "Shared folder"
      : "My Files";

  // =====================================================
  // UI
  // =====================================================

  return (
    <AnimatePresence>
      {open && item && (
        <>
          <motion.button
            type="button"
            aria-label="Close move dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
            <motion.div
              initial={{
                opacity: 0,
                y: 35,
                scale: 0.9,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 20,
                scale: 0.95,
              }}
              transition={{
                type: "spring",
                stiffness: 240,
                damping: 22,
              }}
              className="w-full max-w-lg rounded-[1.75rem] border border-base-300 bg-base-100 p-6 shadow-2xl"
            >
              {/* HEADER */}

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-base-content text-base-100">
                    <MoveRight size={19} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold">
                      Move {type}
                    </h2>

                    <p className="mt-0.5 max-w-xs truncate text-xs opacity-45">
                      {item.name}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  disabled={moving}
                  className="btn btn-ghost btn-circle btn-sm"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* DESTINATION */}

              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-[0.14em] opacity-35">
                  Destination
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-1 text-sm">
                  <button
                    type="button"
                    onClick={goToRoot}
                    className={`rounded-lg px-2 py-1.5 transition ${
                      path.length === 0
                        ? "bg-base-200 font-semibold"
                        : "opacity-55 hover:bg-base-200 hover:opacity-100"
                    }`}
                  >
                    {rootLabel}
                  </button>

                  {path.map((folder, index) => (
                    <div
                      key={folder.id}
                      className="flex items-center gap-1"
                    >
                      <span className="opacity-25">
                        /
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          goToPath(index)
                        }
                        className={`rounded-lg px-2 py-1.5 transition ${
                          index === path.length - 1
                            ? "bg-base-200 font-semibold"
                            : "opacity-55 hover:bg-base-200 hover:opacity-100"
                        }`}
                      >
                        {folder.name}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* FOLDER LIST */}

              <div className="mt-5 min-h-64 max-h-80 overflow-y-auto rounded-2xl border border-base-300 p-2">
                {loadingFolders ? (
                  <div className="flex h-56 items-center justify-center">
                    <LoaderCircle
                      size={24}
                      className="animate-spin opacity-50"
                    />
                  </div>
                ) : folders.length === 0 ? (
                  <div className="flex h-56 flex-col items-center justify-center text-center">
                    <Folder
                      size={28}
                      className="opacity-30"
                    />

                    <p className="mt-3 text-sm font-semibold">
                      No folders here
                    </p>

                    <p className="mt-1 text-xs opacity-40">
                      You can still move the item into this location.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {folders.map((folder, index) => (
                      <motion.button
                        key={folder.id}
                        type="button"
                        initial={{
                          opacity: 0,
                          x: -8,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          delay:
                            index * 0.025,
                        }}
                        whileHover={{
                          x: 3,
                        }}
                        onClick={() =>
                          openDestinationFolder(
                            folder
                          )
                        }
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-base-200"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-base-200">
                          <Folder size={17} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {folder.name}
                          </p>

                          <p className="mt-0.5 text-[11px] opacity-35">
                            Open folder
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* ERROR */}

              {error && (
                <motion.div
                  initial={{
                    opacity: 0,
                    x: -10,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  className="alert alert-error mt-4 rounded-xl text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* CURRENT TARGET */}

              <div className="mt-4 rounded-xl bg-base-200/60 px-3 py-2.5">
                <p className="text-[11px] opacity-40">
                  Move to
                </p>

                <p className="mt-0.5 truncate text-sm font-semibold">
                  {path.length
                    ? path[path.length - 1].name
                    : rootLabel}
                </p>
              </div>

              {/* ACTIONS */}

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={moving}
                  className="btn btn-ghost rounded-xl"
                >
                  Cancel
                </button>

                <motion.button
                  type="button"
                  onClick={handleMove}
                  disabled={
                    moving ||
                    !canMove
                  }
                  whileHover={
                    moving || !canMove
                      ? {}
                      : {
                          y: -2,
                          scale: 1.02,
                        }
                  }
                  whileTap={
                    moving || !canMove
                      ? {}
                      : {
                          scale: 0.97,
                        }
                  }
                  className="btn btn-neutral rounded-xl"
                >
                  {moving ? (
                    <>
                      <LoaderCircle
                        size={16}
                        className="animate-spin"
                      />
                      Moving...
                    </>
                  ) : (
                    <>
                      <MoveRight size={16} />
                      Move here
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
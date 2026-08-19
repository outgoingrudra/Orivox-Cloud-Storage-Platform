"use client";

import { useState } from "react";

import {
  File,
  Folder,
  LoaderCircle,
  RefreshCw,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { motion } from "framer-motion";

import { useTrash } from "@/features/files/useTrash";
import { useRestoreFile } from "@/features/files/useRestoreFile";
import { useRestoreFolder } from "@/features/files/useRestoreFolder";
import { useDeleteFilePermanently } from "@/features/files/useDeleteFilePermanently";
import { useDeleteFolderPermanently } from "@/features/files/useDeleteFolderPermanently";

import {
  formatBytes,
  getFileIcon,
} from "@/features/files/file.utils";

export default function TrashPage() {
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useTrash();

  const restoreFileMutation =
    useRestoreFile();

  const restoreFolderMutation =
    useRestoreFolder();

  const deleteFileMutation =
    useDeleteFilePermanently();

  const deleteFolderMutation =
    useDeleteFolderPermanently();

  const [actionError, setActionError] =
    useState("");

  const files = data?.files || [];
  const folders = data?.folders || [];

  const totalItems =
    files.length + folders.length;

  // =====================================================
  // RESTORE FILE
  // =====================================================

  async function handleRestoreFile(file) {
    if (restoreFileMutation.isPending) return;

    setActionError("");

    try {
      await restoreFileMutation.mutateAsync(
        file.id
      );
    } catch (error) {
      setActionError(
        error.response?.data?.message ||
          "Unable to restore file."
      );
    }
  }

  // =====================================================
  // RESTORE FOLDER
  // =====================================================

  async function handleRestoreFolder(folder) {
    if (restoreFolderMutation.isPending) return;

    setActionError("");

    try {
      await restoreFolderMutation.mutateAsync(
        folder.id
      );
    } catch (error) {
      setActionError(
        error.response?.data?.message ||
          "Unable to restore folder."
      );
    }
  }

  // =====================================================
  // DELETE FILE
  // =====================================================

  async function handleDeleteFile(file) {
    if (deleteFileMutation.isPending) return;

    const confirmed =
      window.confirm(
        `Permanently delete "${file.name}"?\n\nThis action cannot be undone.`
      );

    if (!confirmed) return;

    setActionError("");

    try {
      await deleteFileMutation.mutateAsync(
        file.id
      );
    } catch (error) {
      setActionError(
        error.response?.data?.message ||
          "Unable to permanently delete file."
      );
    }
  }

  // =====================================================
  // DELETE FOLDER
  // =====================================================

  async function handleDeleteFolder(folder) {
    if (deleteFolderMutation.isPending) return;

    const confirmed =
      window.confirm(
        `Permanently delete "${folder.name}" and its contents?\n\nThis action cannot be undone.`
      );

    if (!confirmed) return;

    setActionError("");

    try {
      await deleteFolderMutation.mutateAsync(
        folder.id
      );
    } catch (error) {
      setActionError(
        error.response?.data?.message ||
          "Unable to permanently delete folder."
      );
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <LoaderCircle
            size={30}
            className="animate-spin"
          />

          <p className="text-sm opacity-45">
            Loading trash...
          </p>
        </motion.div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto mt-16 max-w-lg rounded-2xl border border-error/30 bg-error/5 p-6 text-center"
      >
        <h2 className="text-lg font-bold">
          Unable to load trash
        </h2>

        <p className="mt-2 text-sm opacity-60">
          {error?.response?.data?.message ||
            "Something went wrong while loading trash."}
        </p>

        <button
          type="button"
          onClick={() => refetch()}
          className="btn btn-neutral btn-sm mt-5 rounded-xl"
        >
          <RefreshCw size={15} />
          Try again
        </button>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* ==================== HEADER ==================== */}

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between gap-5"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-35">
            Deleted items
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-[-0.035em] sm:text-4xl">
            Trash
          </h1>

          <p className="mt-2 text-sm opacity-55">
            {totalItems} item
            {totalItems === 1 ? "" : "s"} in trash.
          </p>
        </div>

        {isFetching && (
          <LoaderCircle
            size={17}
            className="animate-spin opacity-40"
          />
        )}
      </motion.section>

      {/* ==================== WARNING ==================== */}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="mt-6 flex gap-3 rounded-2xl border border-base-300 bg-base-200/60 p-4"
      >
        <Trash2
          size={18}
          className="mt-0.5 shrink-0 opacity-60"
        />

        <div>
          <p className="text-sm font-semibold">
            Items in trash can still be restored
          </p>

          <p className="mt-1 text-xs leading-5 opacity-45">
            Permanent deletion cannot be undone and may remove the stored object from cloud storage.
          </p>
        </div>
      </motion.div>

      {/* ==================== ACTION ERROR ==================== */}

      {actionError && (
        <motion.div
          initial={{
            opacity: 0,
            x: -12,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          className="alert alert-error mt-5 rounded-xl text-sm"
        >
          {actionError}
        </motion.div>
      )}

      {/* ==================== EMPTY ==================== */}

      {totalItems === 0 ? (
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          className="mt-10 flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-base-300 bg-base-100 p-8 text-center"
        >
          <motion.div
            initial={{
              scale: 0,
              rotate: -20,
            }}
            animate={{
              scale: 1,
              rotate: 0,
            }}
            transition={{
              type: "spring",
              stiffness: 230,
              damping: 16,
            }}
            whileHover={{
              rotate: -5,
              scale: 1.07,
            }}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-base-200"
          >
            <Trash2 size={27} />
          </motion.div>

          <h2 className="mt-5 text-lg font-bold">
            Trash is empty
          </h2>

          <p className="mt-2 max-w-sm text-sm opacity-50">
            Files and folders you move to trash will appear here.
          </p>
        </motion.div>
      ) : (
        <div className="mt-8 space-y-9">
          {/* ==================== FOLDERS ==================== */}

          {folders.length > 0 && (
            <section>
              <div className="flex items-center gap-2">
                <Folder
                  size={17}
                  className="opacity-55"
                />

                <h2 className="text-sm font-bold">
                  Folders
                </h2>

                <span className="text-xs opacity-35">
                  {folders.length}
                </span>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {folders.map(
                  (folder, index) => (
                    <motion.article
                      key={folder.id}
                      initial={{
                        opacity: 0,
                        y: 20,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay:
                          index * 0.04,
                      }}
                      whileHover={{
                        y: -3,
                        scale: 1.01,
                      }}
                      className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-base-200">
                          <Folder
                            size={20}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold">
                            {folder.name}
                          </p>

                          <p className="mt-1 text-xs opacity-40">
                            Folder
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-2">
                        <motion.button
                          type="button"
                          whileHover={{
                            y: -1,
                            scale: 1.01,
                          }}
                          whileTap={{
                            scale: 0.97,
                          }}
                          onClick={() =>
                            handleRestoreFolder(
                              folder
                            )
                          }
                          disabled={
                            restoreFolderMutation.isPending
                          }
                          className="btn btn-outline btn-sm rounded-xl"
                        >
                          {restoreFolderMutation.isPending ? (
                            <LoaderCircle
                              size={15}
                              className="animate-spin"
                            />
                          ) : (
                            <RotateCcw
                              size={15}
                            />
                          )}

                          Restore
                        </motion.button>

                        <motion.button
                          type="button"
                          whileHover={{
                            y: -1,
                            scale: 1.01,
                          }}
                          whileTap={{
                            scale: 0.97,
                          }}
                          onClick={() =>
                            handleDeleteFolder(
                              folder
                            )
                          }
                          disabled={
                            deleteFolderMutation.isPending
                          }
                          className="btn btn-error btn-outline btn-sm rounded-xl"
                        >
                          {deleteFolderMutation.isPending ? (
                            <LoaderCircle
                              size={15}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2
                              size={15}
                            />
                          )}

                          Delete
                        </motion.button>
                      </div>
                    </motion.article>
                  )
                )}
              </div>
            </section>
          )}

          {/* ==================== FILES ==================== */}

          {files.length > 0 && (
            <section>
              <div className="flex items-center gap-2">
                <File
                  size={17}
                  className="opacity-55"
                />

                <h2 className="text-sm font-bold">
                  Files
                </h2>

                <span className="text-xs opacity-35">
                  {files.length}
                </span>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {files.map(
                  (file, index) => {
                    const Icon =
                      getFileIcon(
                        file.mimeType
                      );

                    return (
                      <motion.article
                        key={file.id}
                        initial={{
                          opacity: 0,
                          y: 20,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay:
                            index * 0.04,
                        }}
                        whileHover={{
                          y: -3,
                          scale: 1.01,
                        }}
                        className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-base-200">
                            <Icon
                              size={20}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold">
                              {file.name}
                            </p>

                            <p className="mt-1 text-xs opacity-40">
                              {formatBytes(
                                file.size
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-2">
                          <motion.button
                            type="button"
                            whileHover={{
                              y: -1,
                              scale: 1.01,
                            }}
                            whileTap={{
                              scale: 0.97,
                            }}
                            onClick={() =>
                              handleRestoreFile(
                                file
                              )
                            }
                            disabled={
                              restoreFileMutation.isPending
                            }
                            className="btn btn-outline btn-sm rounded-xl"
                          >
                            {restoreFileMutation.isPending ? (
                              <LoaderCircle
                                size={15}
                                className="animate-spin"
                              />
                            ) : (
                              <RotateCcw
                                size={15}
                              />
                            )}

                            Restore
                          </motion.button>

                          <motion.button
                            type="button"
                            whileHover={{
                              y: -1,
                              scale: 1.01,
                            }}
                            whileTap={{
                              scale: 0.97,
                            }}
                            onClick={() =>
                              handleDeleteFile(
                                file
                              )
                            }
                            disabled={
                              deleteFileMutation.isPending
                            }
                            className="btn btn-error btn-outline btn-sm rounded-xl"
                          >
                            {deleteFileMutation.isPending ? (
                              <LoaderCircle
                                size={15}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2
                                size={15}
                              />
                            )}

                            Delete
                          </motion.button>
                        </div>
                      </motion.article>
                    );
                  }
                )}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
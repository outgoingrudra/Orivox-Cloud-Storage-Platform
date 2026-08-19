"use client";

import { useState } from "react";

import {
  Folder,
  LoaderCircle,
  Plus,
  X,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  useCreateFolder,
} from "@/features/files/useCreateFolder";

export default function CreateFolderModal({
  open,
  onClose,
  parentId,
  parentName,
}) {
  const [folderName, setFolderName] =
    useState("");

  const [error, setError] =
    useState("");

  const createFolderMutation =
    useCreateFolder();

  async function handleSubmit(event) {
    event.preventDefault();

    if (
      createFolderMutation.isPending
    ) {
      return;
    }

    setError("");

    const normalizedName =
      folderName.trim();

    if (!normalizedName) {
      setError(
        "Folder name is required."
      );
      return;
    }

    if (
      normalizedName.length > 100
    ) {
      setError(
        "Folder name cannot exceed 100 characters."
      );
      return;
    }

    try {
      await createFolderMutation.mutateAsync({
        name: normalizedName,
        parentId,
      });

      setFolderName("");
      setError("");

      onClose();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to create folder. Please try again."
      );
    }
  }

  function handleClose() {
    if (
      createFolderMutation.isPending
    ) {
      return;
    }

    setFolderName("");
    setError("");

    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close create folder dialog"
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
                scale: 0.88,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 20,
                scale: 0.94,
              }}
              transition={{
                type: "spring",
                stiffness: 240,
                damping: 22,
              }}
              className="relative w-full max-w-md overflow-hidden rounded-[1.75rem] border border-base-300 bg-base-100 p-6 shadow-2xl sm:p-7"
            >
              <motion.div
                initial={{
                  x: "-130%",
                }}
                animate={{
                  x: "190%",
                }}
                transition={{
                  duration: 1.4,
                  ease: "easeInOut",
                }}
                className="pointer-events-none absolute top-0 h-px w-48 bg-gradient-to-r from-transparent via-base-content/50 to-transparent"
              />

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{
                      scale: 0,
                      rotate: -25,
                    }}
                    animate={{
                      scale: 1,
                      rotate: 0,
                    }}
                    whileHover={{
                      rotate: -5,
                      scale: 1.07,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 280,
                      damping: 16,
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-base-content text-base-100"
                  >
                    <Folder size={20} />
                  </motion.div>

                  <div>
                    <h2 className="text-lg font-bold">
                      New folder
                    </h2>

                    <p className="mt-0.5 text-xs opacity-45">
                      {parentName
                        ? `Create inside ${parentName}`
                        : "Create in My Files"}
                    </p>
                  </div>
                </div>

                <motion.button
                  type="button"
                  whileHover={{
                    rotate: 8,
                    scale: 1.07,
                  }}
                  whileTap={{
                    scale: 0.9,
                  }}
                  disabled={
                    createFolderMutation.isPending
                  }
                  onClick={handleClose}
                  className="btn btn-ghost btn-circle btn-sm"
                  aria-label="Close"
                >
                  <X size={18} />
                </motion.button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="mt-6"
              >
                <label
                  htmlFor="folder-name"
                  className="mb-2 block text-sm font-semibold"
                >
                  Folder name
                </label>

                <motion.div
                  whileFocusWithin={{
                    y: -2,
                    scale: 1.01,
                  }}
                >
                  <input
                    id="folder-name"
                    type="text"
                    autoFocus
                    maxLength={100}
                    value={folderName}
                    onChange={(event) => {
                      setFolderName(
                        event.target.value
                      );

                      if (error) {
                        setError("");
                      }
                    }}
                    disabled={
                      createFolderMutation.isPending
                    }
                    placeholder="e.g. Projects"
                    className="input input-bordered h-12 w-full rounded-xl"
                  />
                </motion.div>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{
                        opacity: 0,
                        x: -10,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      exit={{
                        opacity: 0,
                        x: 10,
                      }}
                      className="mt-2 text-sm text-error"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <p className="mt-2 text-right text-[11px] opacity-35">
                  {folderName.length}/100
                </p>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={
                      createFolderMutation.isPending
                    }
                    className="btn btn-ghost rounded-xl"
                  >
                    Cancel
                  </button>

                  <motion.button
                    type="submit"
                    whileHover={
                      createFolderMutation.isPending
                        ? {}
                        : {
                            y: -2,
                            scale: 1.02,
                          }
                    }
                    whileTap={
                      createFolderMutation.isPending
                        ? {}
                        : {
                            scale: 0.97,
                          }
                    }
                    disabled={
                      createFolderMutation.isPending
                    }
                    className="btn btn-neutral rounded-xl"
                  >
                    {createFolderMutation.isPending ? (
                      <>
                        <LoaderCircle
                          size={16}
                          className="animate-spin"
                        />

                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Create folder
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
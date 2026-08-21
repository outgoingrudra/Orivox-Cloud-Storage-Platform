"use client";

import { useEffect, useState } from "react";
import { FilePenLine, LoaderCircle, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { useRenameFile } from "@/features/files/useRenameFile";
import { useRenameFolder } from "@/features/files/useRenameFolder";

export default function RenameModal({
  open,
  onClose,
  item,
  type,
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const renameFileMutation = useRenameFile();
  const renameFolderMutation = useRenameFolder();

  const mutation =
    type === "folder"
      ? renameFolderMutation
      : renameFileMutation;

  useEffect(() => {
    if (open && item) {
      setName(item.name || "");
      setError("");
    }
  }, [open, item]);

  function handleClose() {
    if (mutation.isPending) return;

    setError("");
    onClose();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!item || mutation.isPending) return;

    const normalizedName = name.trim();

    if (!normalizedName) {
      setError("Name is required.");
      return;
    }

    if (normalizedName === item.name) {
      handleClose();
      return;
    }

    setError("");

    try {
      if (type === "folder") {
        await renameFolderMutation.mutateAsync({
          folderId: item.id,
          name: normalizedName,
        });
      } else {
        await renameFileMutation.mutateAsync({
          fileId: item.id,
          name: normalizedName,
        });
      }

      onClose();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          `Unable to rename ${type}.`
      );
    }
  }

  return (
    <AnimatePresence>
      {open && item && (
        <>
          <motion.button
            type="button"
            aria-label="Close rename dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 240,
                damping: 22,
              }}
              className="w-full max-w-md rounded-[1.75rem] border border-base-300 bg-base-100 p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-base-content text-base-100">
                    <FilePenLine size={19} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold">
                      Rename {type}
                    </h2>

                    <p className="mt-0.5 text-xs opacity-45">
                      Give this {type} a new name
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  disabled={mutation.isPending}
                  className="btn btn-ghost btn-circle btn-sm"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-6">
                <label
                  htmlFor="rename-name"
                  className="mb-2 block text-sm font-semibold"
                >
                  Name
                </label>

                <input
                  id="rename-name"
                  autoFocus
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);

                    if (error) {
                      setError("");
                    }
                  }}
                  disabled={mutation.isPending}
                  className="input input-bordered h-12 w-full rounded-xl"
                />

                {error && (
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mt-2 text-sm text-error"
                  >
                    {error}
                  </motion.p>
                )}

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={mutation.isPending}
                    className="btn btn-ghost rounded-xl"
                  >
                    Cancel
                  </button>

                  <motion.button
                    type="submit"
                    disabled={mutation.isPending}
                    whileHover={
                      mutation.isPending
                        ? {}
                        : { y: -2, scale: 1.02 }
                    }
                    whileTap={
                      mutation.isPending
                        ? {}
                        : { scale: 0.97 }
                    }
                    className="btn btn-neutral rounded-xl"
                  >
                    {mutation.isPending ? (
                      <>
                        <LoaderCircle size={16} className="animate-spin" />
                        Renaming...
                      </>
                    ) : (
                      "Rename"
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
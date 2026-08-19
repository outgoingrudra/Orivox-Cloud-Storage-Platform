"use client";

import { useRef, useState } from "react";

import {
  CheckCircle2,
  File,
  LoaderCircle,
  UploadCloud,
  X,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import { useUploadFile } from "@/features/files/useUploadFile";
import { formatBytes } from "@/features/files/file.utils";

export default function UploadModal({
  open,
  onClose,
  folderId,
  folderName,
}) {
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const uploadMutation = useUploadFile();

  const uploading = uploadMutation.isPending;

  function resetState() {
    setFile(null);
    setDragging(false);
    setProgress(0);
    setError("");
    setSuccess(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleClose() {
    if (uploading) return;

    resetState();
    onClose();
  }

  function chooseFile(selectedFile) {
    if (!selectedFile) return;

    setFile(selectedFile);
    setProgress(0);
    setError("");
    setSuccess(false);
  }

  function handleDrop(event) {
    event.preventDefault();

    setDragging(false);

    if (uploading) return;

    const droppedFile =
      event.dataTransfer.files?.[0];

    chooseFile(droppedFile);
  }

  async function handleUpload() {
    if (!file || uploading) return;

    setError("");
    setProgress(0);

    try {
      await uploadMutation.mutateAsync({
        file,
        folderId,
        onProgress: setProgress,
      });

      setProgress(100);
      setSuccess(true);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to upload this file. Please try again."
      );
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* BACKDROP */}

          <motion.button
            type="button"
            aria-label="Close upload dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-sm"
          />

          {/* MODAL */}

          <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
            <motion.div
              initial={{
                opacity: 0,
                y: 40,
                scale: 0.88,
                rotateX: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                rotateX: 0,
              }}
              exit={{
                opacity: 0,
                y: 25,
                scale: 0.94,
              }}
              transition={{
                type: "spring",
                stiffness: 230,
                damping: 22,
              }}
              className="relative w-full max-w-lg overflow-hidden rounded-[1.9rem] border border-base-300 bg-base-100 p-6 shadow-2xl sm:p-7"
            >
              {/* SHINE */}

              <motion.div
                initial={{ x: "-130%" }}
                animate={{ x: "190%" }}
                transition={{
                  duration: 1.5,
                  ease: "easeInOut",
                }}
                className="pointer-events-none absolute top-0 h-px w-52 bg-gradient-to-r from-transparent via-base-content/50 to-transparent"
              />

              {/* HEADER */}

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
                      scale: 1.08,
                      rotate: -5,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 280,
                      damping: 16,
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-base-content text-base-100"
                  >
                    <UploadCloud size={20} />
                  </motion.div>

                  <div>
                    <h2 className="text-lg font-bold">
                      Upload file
                    </h2>

                    <p className="mt-0.5 text-xs opacity-45">
                      {folderName
                        ? `Upload into ${folderName}`
                        : "Upload into My Files"}
                    </p>
                  </div>
                </div>

                <motion.button
                  type="button"
                  whileHover={{
                    rotate: 8,
                    scale: 1.08,
                  }}
                  whileTap={{
                    scale: 0.9,
                  }}
                  onClick={handleClose}
                  disabled={uploading}
                  className="btn btn-ghost btn-circle btn-sm"
                  aria-label="Close"
                >
                  <X size={18} />
                </motion.button>
              </div>

              {/* SUCCESS */}

              {success ? (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 18,
                    scale: 0.95,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  className="py-10 text-center"
                >
                  <motion.div
                    initial={{
                      scale: 0,
                      rotate: -25,
                    }}
                    animate={{
                      scale: 1,
                      rotate: 0,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 280,
                      damping: 15,
                    }}
                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-base-content text-base-100"
                  >
                    <CheckCircle2 size={28} />
                  </motion.div>

                  <h3 className="mt-5 text-xl font-bold">
                    Upload complete
                  </h3>

                  <p className="mt-2 text-sm opacity-55">
                    {file?.name} is now available in Orivox.
                  </p>

                  <motion.button
                    type="button"
                    whileHover={{
                      y: -2,
                      scale: 1.02,
                    }}
                    whileTap={{
                      scale: 0.97,
                    }}
                    onClick={handleClose}
                    className="btn btn-neutral mt-7 rounded-xl"
                  >
                    Done
                  </motion.button>
                </motion.div>
              ) : (
                <>
                  {/* DROP ZONE */}

                  <motion.div
                    animate={{
                      scale: dragging
                        ? 1.015
                        : 1,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 22,
                    }}
                    onDragEnter={(event) => {
                      event.preventDefault();

                      if (!uploading) {
                        setDragging(true);
                      }
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                    }}
                    onDragLeave={(event) => {
                      event.preventDefault();

                      setDragging(false);
                    }}
                    onDrop={handleDrop}
                    onClick={() => {
                      if (!uploading) {
                        inputRef.current?.click();
                      }
                    }}
                    className={`mt-7 cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${
                      dragging
                        ? "border-base-content bg-base-200"
                        : "border-base-300 hover:bg-base-200/60"
                    }`}
                  >
                    <input
                      ref={inputRef}
                      type="file"
                      hidden
                      disabled={uploading}
                      onChange={(event) =>
                        chooseFile(
                          event.target.files?.[0]
                        )
                      }
                    />

                    <motion.div
                      animate={{
                        y: dragging
                          ? [0, -5, 0]
                          : 0,
                      }}
                      transition={{
                        duration: 0.7,
                        repeat: dragging
                          ? Infinity
                          : 0,
                      }}
                      className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-base-200"
                    >
                      <UploadCloud size={25} />
                    </motion.div>

                    <p className="mt-4 font-semibold">
                      {dragging
                        ? "Drop your file here"
                        : "Drop a file here"}
                    </p>

                    <p className="mt-1 text-sm opacity-45">
                      or click to choose from your device
                    </p>
                  </motion.div>

                  {/* SELECTED FILE */}

                  <AnimatePresence mode="wait">
                    {file && (
                      <motion.div
                        key={file.name}
                        initial={{
                          opacity: 0,
                          y: 12,
                          scale: 0.97,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          y: -8,
                        }}
                        className="mt-5 rounded-2xl border border-base-300 bg-base-200/50 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-base-100">
                            <File size={20} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">
                              {file.name}
                            </p>

                            <p className="mt-1 text-xs opacity-45">
                              {formatBytes(file.size)}
                              {" • "}
                              {file.type || "Unknown type"}
                            </p>
                          </div>

                          {!uploading && (
                            <button
                              type="button"
                              onClick={() => {
                                setFile(null);
                                setProgress(0);

                                if (inputRef.current) {
                                  inputRef.current.value = "";
                                }
                              }}
                              className="btn btn-ghost btn-circle btn-sm"
                              aria-label="Remove selected file"
                            >
                              <X size={17} />
                            </button>
                          )}
                        </div>

                        {/* PROGRESS */}

                        {uploading && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium opacity-55">
                                Uploading...
                              </span>

                              <span className="font-bold">
                                {progress}%
                              </span>
                            </div>

                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-base-300">
                              <motion.div
                                animate={{
                                  width: `${progress}%`,
                                }}
                                transition={{
                                  duration: 0.2,
                                  ease: "easeOut",
                                }}
                                className="h-full rounded-full bg-base-content"
                              />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ERROR */}

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          x: -12,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        exit={{
                          opacity: 0,
                          x: 12,
                        }}
                        className="alert alert-error mt-5 rounded-xl text-sm"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ACTIONS */}

                  <div className="mt-7 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={uploading}
                      className="btn btn-ghost rounded-xl"
                    >
                      Cancel
                    </button>

                    <motion.button
                      type="button"
                      onClick={handleUpload}
                      disabled={!file || uploading}
                      whileHover={
                        !file || uploading
                          ? {}
                          : {
                              y: -2,
                              scale: 1.02,
                            }
                      }
                      whileTap={
                        !file || uploading
                          ? {}
                          : {
                              scale: 0.97,
                            }
                      }
                      className="btn btn-neutral rounded-xl"
                    >
                      {uploading ? (
                        <>
                          <LoaderCircle
                            size={16}
                            className="animate-spin"
                          />

                          Uploading...
                        </>
                      ) : (
                        <>
                          <UploadCloud size={16} />
                          Upload file
                        </>
                      )}
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
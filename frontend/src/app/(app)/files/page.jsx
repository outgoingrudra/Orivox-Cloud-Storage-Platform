"use client";

import { useMemo, useState } from "react";
import {
  Archive,
  ChevronDown,
  File,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
  Folder,
  Grid2X2,
  List,
  LoaderCircle,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Upload,
} from "lucide-react";

import { motion } from "framer-motion";

import { useExplorer } from "@/features/files/useExplorer";

function formatBytes(bytes = 0) {
  if (!bytes) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, index);

  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function getFileIcon(mimeType = "") {
  if (mimeType.startsWith("image/")) return FileImage;
  if (mimeType.startsWith("video/")) return FileVideo;
  if (mimeType.startsWith("audio/")) return FileAudio;

  if (
    mimeType.includes("pdf") ||
    mimeType.includes("word") ||
    mimeType.includes("text") ||
    mimeType.includes("csv") ||
    mimeType.includes("sheet") ||
    mimeType.includes("presentation")
  ) {
    return FileText;
  }

  if (
    mimeType.includes("zip") ||
    mimeType.includes("rar") ||
    mimeType.includes("gzip") ||
    mimeType.includes("7z")
  ) {
    return Archive;
  }

  return File;
}

export default function FilesPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [order, setOrder] = useState("asc");
  const [view, setView] = useState("grid");

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useExplorer({
    search,
    type,
    sortBy,
    order,
  });

  const itemsCount = useMemo(() => {
    if (!data) return 0;

    return (
      data.folders.length +
      data.files.length
    );
  }, [data]);

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
            Loading your files...
          </p>
        </motion.div>
      </div>
    );
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto mt-16 max-w-lg rounded-2xl border border-error/30 bg-error/5 p-6 text-center"
      >
        <h2 className="text-lg font-bold">
          Unable to load files
        </h2>

        <p className="mt-2 text-sm opacity-60">
          {error?.response?.data?.message ||
            "Something went wrong while loading your workspace."}
        </p>

        <button
          onClick={() => refetch()}
          className="btn btn-neutral btn-sm mt-5 rounded-xl"
        >
          <RefreshCw size={15} />
          Try again
        </button>
      </motion.div>
    );
  }

  const { folders, files } = data;

  return (
    <div className="mx-auto max-w-7xl">
      {/* ==================== HEADER ==================== */}

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-35">
            File explorer
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-[-0.035em] sm:text-4xl">
            My Files
          </h1>

          <p className="mt-2 text-sm opacity-55">
            {itemsCount} item{itemsCount === 1 ? "" : "s"} in this folder.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <motion.button
            type="button"
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="btn btn-outline btn-sm rounded-xl"
          >
            <Plus size={16} />
            New folder
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="btn btn-neutral btn-sm rounded-xl"
          >
            <Upload size={16} />
            Upload
          </motion.button>
        </div>
      </motion.section>

      {/* ==================== TOOLBAR ==================== */}

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="mt-7 flex flex-col gap-3 rounded-2xl border border-base-300 bg-base-100 p-3 lg:flex-row lg:items-center"
      >
        {/* Search */}

        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40"
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search this folder..."
            className="input input-bordered h-10 w-full rounded-xl bg-base-200/60 pl-11"
          />
        </div>

        {/* Type */}

        <select
          value={type}
          onChange={(event) =>
            setType(event.target.value)
          }
          className="select select-bordered h-10 min-h-0 rounded-xl"
        >
          <option value="">
            All types
          </option>
          <option value="image">
            Images
          </option>
          <option value="video">
            Videos
          </option>
          <option value="audio">
            Audio
          </option>
          <option value="document">
            Documents
          </option>
          <option value="archive">
            Archives
          </option>
          <option value="other">
            Other
          </option>
        </select>

        {/* Sort */}

        <select
          value={sortBy}
          onChange={(event) =>
            setSortBy(event.target.value)
          }
          className="select select-bordered h-10 min-h-0 rounded-xl"
        >
          <option value="name">
            Name
          </option>
          <option value="createdAt">
            Created
          </option>
          <option value="updatedAt">
            Updated
          </option>
        </select>

        <button
          type="button"
          onClick={() =>
            setOrder((value) =>
              value === "asc"
                ? "desc"
                : "asc"
            )
          }
          className="btn btn-outline h-10 min-h-0 rounded-xl"
        >
          {order === "asc"
            ? "Ascending"
            : "Descending"}

          <ChevronDown
            size={15}
            className={
              order === "desc"
                ? "rotate-180 transition-transform"
                : "transition-transform"
            }
          />
        </button>

        {/* View toggle */}

        <div className="flex rounded-xl border border-base-300 p-1">
          <button
            type="button"
            onClick={() =>
              setView("grid")
            }
            className={`btn btn-sm btn-square rounded-lg ${
              view === "grid"
                ? "btn-neutral"
                : "btn-ghost"
            }`}
          >
            <Grid2X2 size={16} />
          </button>

          <button
            type="button"
            onClick={() =>
              setView("list")
            }
            className={`btn btn-sm btn-square rounded-lg ${
              view === "list"
                ? "btn-neutral"
                : "btn-ghost"
            }`}
          >
            <List size={17} />
          </button>
        </div>
      </motion.section>

      {/* Fetching indicator */}

      {isFetching && (
        <div className="mt-3 flex items-center gap-2 text-xs opacity-40">
          <LoaderCircle
            size={13}
            className="animate-spin"
          />
          Updating results...
        </div>
      )}

      {/* ==================== EMPTY ==================== */}

      {itemsCount === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-10 flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-base-300 bg-base-100 p-8 text-center"
        >
          <motion.div
            initial={{ rotate: -10, scale: 0.85 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 220,
              damping: 16,
            }}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-base-200"
          >
            <Folder size={27} />
          </motion.div>

          <h2 className="mt-5 text-lg font-bold">
            Nothing here yet
          </h2>

          <p className="mt-2 max-w-sm text-sm opacity-50">
            Create a folder or upload your first file to start organizing your workspace.
          </p>

          <div className="mt-6 flex gap-2">
            <button className="btn btn-outline btn-sm rounded-xl">
              <Plus size={15} />
              New folder
            </button>

            <button className="btn btn-neutral btn-sm rounded-xl">
              <Upload size={15} />
              Upload
            </button>
          </div>
        </motion.div>
      ) : view === "grid" ? (
        /* ==================== GRID VIEW ==================== */

        <section className="mt-6">
          {folders.length > 0 && (
            <>
              <h2 className="text-sm font-bold opacity-55">
                Folders
              </h2>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {folders.map(
                  (folder, index) => (
                    <motion.article
                      key={folder.id}
                      initial={{
                        opacity: 0,
                        y: 18,
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
                        y: -4,
                        scale: 1.01,
                      }}
                      className="group cursor-pointer rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-base-200">
                          <Folder
                            size={21}
                          />
                        </div>

                        <button className="btn btn-ghost btn-circle btn-sm opacity-50 group-hover:opacity-100">
                          <MoreVertical
                            size={17}
                          />
                        </button>
                      </div>

                      <p className="mt-5 truncate font-semibold">
                        {folder.name}
                      </p>

                      <p className="mt-1 text-xs opacity-40">
                        {folder._count?.folders ??
                          folder.folderCount ??
                          0}{" "}
                        folders •{" "}
                        {folder._count?.files ??
                          folder.fileCount ??
                          0}{" "}
                        files
                      </p>
                    </motion.article>
                  )
                )}
              </div>
            </>
          )}

          {files.length > 0 && (
            <>
              <h2 className={`${folders.length ? "mt-8" : ""} text-sm font-bold opacity-55`}>
                Files
              </h2>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
                          y: 18,
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
                          y: -4,
                          scale: 1.01,
                        }}
                        className="group rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-base-200">
                            <Icon size={21} />
                          </div>

                          <button className="btn btn-ghost btn-circle btn-sm opacity-50 group-hover:opacity-100">
                            <MoreVertical
                              size={17}
                            />
                          </button>
                        </div>

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
                      </motion.article>
                    );
                  }
                )}
              </div>
            </>
          )}
        </section>
      ) : (
        /* ==================== LIST VIEW ==================== */

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 overflow-hidden rounded-2xl border border-base-300 bg-base-100"
        >
          <div className="grid grid-cols-[1fr_auto] border-b border-base-300 px-5 py-3 text-xs font-bold uppercase tracking-wide opacity-40 sm:grid-cols-[1fr_120px_130px_40px]">
            <span>Name</span>
            <span className="hidden sm:block">
              Size
            </span>
            <span className="hidden sm:block">
              Modified
            </span>
            <span />
          </div>

          {[...folders, ...files].map(
            (item, index) => {
              const isFolder =
                !item.mimeType;

              const Icon = isFolder
                ? Folder
                : getFileIcon(
                    item.mimeType
                  );

              return (
                <motion.div
                  key={item.id}
                  initial={{
                    opacity: 0,
                    x: -12,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay:
                      index * 0.035,
                  }}
                  whileHover={{
                    x: 3,
                    backgroundColor:
                      "var(--color-base-200)",
                  }}
                  className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-base-300 px-5 py-3.5 last:border-b-0 sm:grid-cols-[1fr_120px_130px_40px]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-base-200">
                      <Icon size={17} />
                    </div>

                    <p className="truncate text-sm font-semibold">
                      {item.name}
                    </p>
                  </div>

                  <span className="hidden text-xs opacity-45 sm:block">
                    {isFolder
                      ? "—"
                      : formatBytes(
                          item.size
                        )}
                  </span>

                  <span className="hidden text-xs opacity-45 sm:block">
                    {new Date(
                      item.updatedAt
                    ).toLocaleDateString()}
                  </span>

                  <button className="btn btn-ghost btn-circle btn-sm">
                    <MoreVertical
                      size={17}
                    />
                  </button>
                </motion.div>
              );
            }
          )}
        </motion.section>
      )}
    </div>
  );
}
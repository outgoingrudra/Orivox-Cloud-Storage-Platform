"use client";

import {
  Archive,
  File,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
  Folder,
  HardDrive,
  LoaderCircle,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";

import { motion } from "framer-motion";

import { useDashboard } from "@/components/features/dashboard/useDashboard";

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
    mimeType.includes("sheet") ||
    mimeType.includes("presentation") ||
    mimeType.includes("csv")
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

export default function DashboardPage() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <LoaderCircle size={30} className="animate-spin" />
          <p className="text-sm opacity-45">Loading your workspace...</p>
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
        <h2 className="text-lg font-bold">Unable to load dashboard</h2>

        <p className="mt-2 text-sm opacity-60">
          {error?.response?.data?.message || "Something went wrong while loading your workspace."}
        </p>

        <button onClick={() => refetch()} className="btn btn-neutral btn-sm mt-5 rounded-xl">
          <RefreshCw size={15} />
          Try again
        </button>
      </motion.div>
    );
  }

  const { user, storage, counts, breakdown, recentFiles } = data;

  const stats = [
    {
      title: "Files",
      value: counts.files,
      icon: File,
      description: "Active files",
    },
    {
      title: "Folders",
      value: counts.folders,
      icon: Folder,
      description: "Active folders",
    },
    {
      title: "Trash",
      value: counts.trashed,
      icon: Trash2,
      description: "Items in trash",
    },
  ];

  const storageCategories = [
    { label: "Images", value: breakdown.images, icon: FileImage },
    { label: "Videos", value: breakdown.videos, icon: FileVideo },
    { label: "Audio", value: breakdown.audio, icon: FileAudio },
    { label: "Documents", value: breakdown.documents, icon: FileText },
    { label: "Archives", value: breakdown.archives, icon: Archive },
    { label: "Other", value: breakdown.other, icon: File },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      {/* ==================== HEADER ==================== */}

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-35">
            Workspace overview
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-[-0.035em] sm:text-4xl">
            Welcome back, {user.name?.split(" ")[0]}
          </h1>

          <p className="mt-2 text-sm opacity-55">
            Here’s what’s happening with your Orivox storage.
          </p>
        </div>

      </motion.section>

      {/* ==================== OVERVIEW ==================== */}

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <motion.article
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          whileHover={{ y: -4 }}
          className="relative overflow-hidden rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold opacity-50">Storage used</p>

              <p className="mt-2 text-2xl font-black tracking-tight">
                {formatBytes(storage.used)}
              </p>

              <p className="mt-1 text-xs opacity-40">
                of {formatBytes(storage.limit)}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-base-content text-base-100">
              <HardDrive size={20} />
            </div>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-base-300">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(storage.percentage, 100)}%` }}
              transition={{ delay: 0.25, duration: 0.9, ease: "easeOut" }}
              className="h-full rounded-full bg-base-content"
            />
          </div>

          <div className="mt-2 flex justify-between text-[11px] opacity-45">
            <span>{storage.percentage}% used</span>
            <span>{formatBytes(storage.available)} free</span>
          </div>
        </motion.article>

        {stats.map(({ title, value, icon: Icon, description }, index) => (
          <motion.article
            key={title}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.06 }}
            whileHover={{ y: -4, scale: 1.01 }}
            className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold opacity-50">{title}</p>
                <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
                <p className="mt-1 text-xs opacity-40">{description}</p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-base-200">
                <Icon size={19} />
              </div>
            </div>
          </motion.article>
        ))}
      </section>

      {/* ==================== MAIN CONTENT ==================== */}

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        {/* RECENT FILES */}

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="overflow-hidden rounded-2xl border border-base-300 bg-base-100"
        >
          <div className="flex items-center justify-between border-b border-base-300 px-5 py-4">
            <div>
              <h2 className="font-bold">Recent files</h2>
              <p className="mt-0.5 text-xs opacity-45">Your latest uploads and files</p>
            </div>

            {isFetching && <LoaderCircle size={16} className="animate-spin opacity-40" />}
          </div>

          {recentFiles.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-base-200"
              >
                <File size={23} />
              </motion.div>

              <p className="mt-4 font-semibold">No files yet</p>
              <p className="mt-1 max-w-xs text-sm opacity-45">
                Upload your first file and it will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-base-300">
              {recentFiles.map((file, index) => {
                const Icon = getFileIcon(file.mimeType);

                return (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.045 }}
                    whileHover={{ x: 4, backgroundColor: "var(--color-base-200)" }}
                    className="flex items-center gap-4 px-5 py-3.5 transition"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-base-200">
                      <Icon size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{file.name}</p>

                      <div className="mt-1 flex items-center gap-2 text-[11px] opacity-40">
                        <span>{formatBytes(file.size)}</span>
                        <span>•</span>
                        <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <File size={16} className="shrink-0 opacity-25" />
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* STORAGE BREAKDOWN */}

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="rounded-2xl border border-base-300 bg-base-100 p-5"
        >
          <div>
            <h2 className="font-bold">Storage breakdown</h2>
            <p className="mt-1 text-xs opacity-45">What’s taking up your space</p>
          </div>

          <div className="mt-6 space-y-3">
            {storageCategories.map(({ label, value, icon: Icon }, index) => {
              const percentage =
                storage.used === 0 ? 0 : Math.min((value / storage.used) * 100, 100);

              return (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.38 + index * 0.05 }}
                  whileHover={{ x: 3 }}
                  className="rounded-xl p-2 transition hover:bg-base-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-base-200">
                      <Icon size={16} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium">{label}</span>
                        <span className="text-xs opacity-45">{formatBytes(value)}</span>
                      </div>

                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-base-300">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: 0.5 + index * 0.05, duration: 0.65 }}
                          className="h-full rounded-full bg-base-content"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
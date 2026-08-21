"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Download,
  FileSearch,
  Folder,
  LoaderCircle,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";

import { useGlobalSearch } from "@/features/search/useGlobalSearch";
import { useDownloadFile } from "@/features/files/useDownloadFile";
import { formatBytes, getFileIcon } from "@/features/files/file.utils";

export default function SearchPage() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const initialQuery = searchParams.get("q") || "";

  const [search, setSearch] = useState(initialQuery);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [downloadError, setDownloadError] = useState("");

  // ==================== DEBOUNCE ====================

  useEffect(() => {
    const normalized = search.trim();

    if (!normalized) {
      setDebouncedSearch("");
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedSearch(normalized);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // ==================== SEARCH QUERY ====================

  const { data, isLoading, isFetching, isError, error } =
    useGlobalSearch(debouncedSearch);

  const downloadMutation = useDownloadFile();

  const files = data?.files || [];
  const folders = data?.folders || [];

  const total = files.length + folders.length;

  const hasInput = Boolean(search.trim());
  const hasQuery = Boolean(debouncedSearch);

  // True while user is typing but debounce hasn't completed yet.
  const isDebouncing = hasInput && search.trim() !== debouncedSearch;

  // ==================== NAVIGATION ====================

  function openFolder(folderId) {
    router.push(`/files?folder=${encodeURIComponent(folderId)}`);
  }

  // ==================== DOWNLOAD ====================

  async function handleDownload(fileId) {
    if (downloadMutation.isPending) return;

    setDownloadError("");

    try {
      const data = await downloadMutation.mutateAsync(fileId);

      const downloadUrl = data.downloadUrl || data.url;

      if (!downloadUrl) {
        throw new Error("Download URL missing");
      }

      window.location.href = downloadUrl;
    } catch (error) {
      setDownloadError(
        error.response?.data?.message || "Unable to download file.",
      );
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* ==================== HEADER ==================== */}

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-base-content text-base-100">
            <Search size={20} />
          </div>

          <div>
            <h1 className="text-2xl font-bold">Search</h1>

            <p className="mt-1 text-sm opacity-45">
              Find files and folders across your Orivox storage.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ==================== SEARCH BAR ==================== */}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative mt-6"
      >
        <Search
          size={19}
          className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40"
        />

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          autoFocus
          placeholder="Search files and folders..."
          className="input input-bordered h-12 w-full rounded-2xl bg-base-100 pl-12 pr-12 shadow-sm"
        />

        {(isDebouncing || (isFetching && hasQuery)) && (
          <LoaderCircle
            size={17}
            className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin opacity-40"
          />
        )}
      </motion.div>

      {/* ==================== INITIAL STATE ==================== */}

      {!hasInput && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 flex min-h-[360px] items-center justify-center rounded-3xl border border-dashed border-base-300 bg-base-100"
        >
          <div className="max-w-sm px-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-base-200">
              <FileSearch size={24} className="opacity-50" />
            </div>

            <h2 className="mt-4 font-bold">Search your storage</h2>

            <p className="mt-2 text-sm leading-6 opacity-45">
              Search by file or folder name.
            </p>
          </div>
        </motion.div>
      )}

      {/* ==================== DEBOUNCING ==================== */}

      {hasInput && isDebouncing && !hasQuery && (
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="text-center">
            <LoaderCircle
              size={28}
              className="mx-auto animate-spin opacity-45"
            />

            <p className="mt-3 text-sm opacity-45">Searching...</p>
          </div>
        </div>
      )}

      {/* ==================== INITIAL QUERY LOADING ==================== */}

      {hasQuery && isLoading && (
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="text-center">
            <LoaderCircle
              size={28}
              className="mx-auto animate-spin opacity-45"
            />

            <p className="mt-3 text-sm opacity-45">Searching...</p>
          </div>
        </div>
      )}

      {/* ==================== ERROR ==================== */}

      {hasQuery && isError && (
        <div className="alert alert-error mt-6 rounded-2xl">
          {error?.response?.data?.message || "Unable to search your storage."}
        </div>
      )}

      {downloadError && (
        <div className="alert alert-error mt-4 rounded-2xl">
          {downloadError}
        </div>
      )}

      {/* ==================== RESULTS ==================== */}

      {hasQuery && !isLoading && !isError && (
        <>
          <p className="mt-5 text-xs font-medium opacity-40">
            {total} {total === 1 ? "result" : "results"} for{" "}
            <span className="font-semibold">&quot;{debouncedSearch}&quot;</span>
          </p>

          {/* ==================== FOLDERS ==================== */}

          {folders.length > 0 && (
            <section className="mt-6">
              <div className="mb-3 flex items-center gap-2">
                <Folder size={17} />

                <h2 className="text-sm font-bold">Folders</h2>

                <span className="badge badge-ghost badge-sm">
                  {folders.length}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {folders.map((folder, index) => (
                  <motion.button
                    key={folder.id}
                    type="button"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: index * 0.025,
                    }}
                    whileHover={{
                      y: -3,
                      scale: 1.01,
                    }}
                    onClick={() => openFolder(folder.id)}
                    className="rounded-2xl border border-base-300 bg-base-100 p-4 text-left shadow-sm"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-base-200">
                      <Folder size={20} />
                    </div>

                    <p className="mt-4 truncate font-semibold">{folder.name}</p>

                    <p className="mt-1 text-xs opacity-40">
                      Updated {new Date(folder.updatedAt).toLocaleDateString()}
                    </p>
                  </motion.button>
                ))}
              </div>
            </section>
          )}

          {/* ==================== FILES ==================== */}

          {files.length > 0 && (
            <section className={folders.length > 0 ? "mt-9" : "mt-6"}>
              <div className="mb-3 flex items-center gap-2">
                <FileSearch size={17} />

                <h2 className="text-sm font-bold">Files</h2>

                <span className="badge badge-ghost badge-sm">
                  {files.length}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {files.map((file, index) => {
                  const Icon = getFileIcon(file.mimeType);

                  const downloading =
                    downloadMutation.isPending &&
                    downloadMutation.variables === file.id;

                  return (
                    <motion.article
                      key={file.id}
                      initial={{
                        opacity: 0,
                        y: 12,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: index * 0.025,
                      }}
                      whileHover={{
                        y: -3,
                        scale: 1.01,
                      }}
                      className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-base-200">
                        <Icon size={20} />
                      </div>

                      <p className="mt-4 truncate font-semibold">{file.name}</p>

                      <div className="mt-1 flex gap-2 text-xs opacity-40">
                        <span>{formatBytes(file.size)}</span>

                        <span>•</span>

                        <span>
                          {new Date(file.updatedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={downloading}
                        onClick={() => handleDownload(file.id)}
                        className="btn btn-neutral btn-sm mt-4 w-full rounded-xl"
                      >
                        {downloading ? (
                          <>
                            <LoaderCircle size={15} className="animate-spin" />
                            Preparing...
                          </>
                        ) : (
                          <>
                            <Download size={15} />
                            Download
                          </>
                        )}
                      </button>
                    </motion.article>
                  );
                })}
              </div>
            </section>
          )}

          {/* ==================== EMPTY ==================== */}

          {total === 0 && (
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="mt-6 flex min-h-[320px] items-center justify-center rounded-3xl border border-dashed border-base-300 bg-base-100"
            >
              <div className="max-w-sm px-6 text-center">
                <FileSearch size={30} className="mx-auto opacity-25" />

                <h2 className="mt-4 font-bold">No results</h2>

                <p className="mt-2 text-sm opacity-45">
                  Nothing matched &quot;{debouncedSearch}&quot;.
                </p>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}

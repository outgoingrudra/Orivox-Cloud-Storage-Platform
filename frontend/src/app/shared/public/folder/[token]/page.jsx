"use client";

import { use, useState } from "react";

import {
  ChevronLeft,
  Cloud,
  Download,
  FileText,
  Folder,
  FolderOpen,
  Link2,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

import { motion } from "framer-motion";

import { usePublicFolder } from "@/components/features/share/usePublicFolder";
import { usePublicFolderContents } from "@/components/features/share/usePublicFolderContents";
import { usePublicFolderFileDownload } from "@/components/features/share/usePublicFolderFileDownload";

import {
  formatBytes,
  getFileIcon,
} from "@/components/features/files/file.utils";

export default function PublicFolderPage({
  params,
}) {
  const { token } = use(params);

  const [currentFolderId, setCurrentFolderId] =
    useState(null);

  const [path, setPath] =
    useState([]);

  const [downloadError, setDownloadError] =
    useState("");

  // ==================== ROOT SHARE ====================

  const {
    data: folderData,
    isLoading: folderLoading,
    isError: folderError,
    error: folderRequestError,
  } = usePublicFolder(token);

  // ==================== CONTENTS ====================

  const {
    data: contentsData,
    isLoading: contentsLoading,
    isError: contentsError,
    error: contentsRequestError,
  } = usePublicFolderContents({
    token,
    folderId: currentFolderId,
  });

  const downloadMutation =
    usePublicFolderFileDownload();

  // ==================== RESPONSE NORMALIZATION ====================

  const folderPayload =
    folderData?.data ??
    folderData ??
    {};

  const rootFolder =
    folderPayload.folder ??
    folderPayload;

  const contentsPayload =
    contentsData?.data ??
    contentsData ??
    {};

  const folders =
    contentsPayload.folders ??
    [];

  const files =
    contentsPayload.files ??
    [];

  // ==================== NAVIGATION ====================

  function openFolder(folder) {
    setPath((current) => [
      ...current,
      folder,
    ]);

    setCurrentFolderId(
      folder.id
    );
  }

  function goRoot() {
    setPath([]);
    setCurrentFolderId(null);
  }

  function goBack() {
    if (path.length === 0) return;

    const next =
      path.slice(0, -1);

    setPath(next);

    setCurrentFolderId(
      next.length
        ? next[next.length - 1].id
        : null
    );
  }

  function goToPath(index) {
    const next =
      path.slice(0, index + 1);

    setPath(next);

    setCurrentFolderId(
      next[index]?.id ??
        null
    );
  }

  // ==================== DOWNLOAD ====================

  async function handleDownload(file) {
    if (
      downloadMutation.isPending
    ) {
      return;
    }

    setDownloadError("");

    try {
      const result =
        await downloadMutation.mutateAsync({
          token,
          fileId: file.id,
        });

      const downloadUrl =
        result?.data?.downloadUrl ||
        result?.data?.url ||
        result?.downloadUrl ||
        result?.url;

      if (!downloadUrl) {
        throw new Error(
          "Download URL missing"
        );
      }

      window.location.href =
        downloadUrl;
    } catch (error) {
      setDownloadError(
        error.response?.data?.message ||
          "Unable to download file."
      );
    }
  }

  // ==================== INITIAL LOADING ====================

  if (folderLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-base-200/30">
        <div className="text-center">
          <LoaderCircle
            size={30}
            className="mx-auto animate-spin opacity-45"
          />

          <p className="mt-3 text-sm opacity-45">
            Opening shared folder...
          </p>
        </div>
      </main>
    );
  }

  // ==================== INVALID LINK ====================

  if (
    folderError ||
    !rootFolder?.id
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-base-200/30 px-4">
        <motion.div
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="w-full max-w-md rounded-3xl border border-base-300 bg-base-100 p-7 text-center shadow-xl"
        >
          <Link2
            size={30}
            className="mx-auto opacity-35"
          />

          <h1 className="mt-4 text-xl font-bold">
            Link unavailable
          </h1>

          <p className="mt-2 text-sm leading-6 opacity-50">
            {folderRequestError
              ?.response?.data
              ?.message ||
              "This folder link may have expired or been revoked."}
          </p>
        </motion.div>
      </main>
    );
  }

  const currentName =
    path.length
      ? path[
          path.length - 1
        ].name
      : rootFolder.name;

  return (
    <main className="min-h-screen bg-base-200/30 px-4 py-8">
      <div className="mx-auto max-w-6xl">

        {/* ==================== BRAND ==================== */}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud size={20} />

            <span className="font-black tracking-[0.18em]">
              ORIVOX
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs opacity-45">
            <ShieldCheck
              size={14}
            />

            Public read-only
          </div>
        </div>

        {/* ==================== HEADER ==================== */}

        <motion.section
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mt-8 rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-base-200">
              <FolderOpen
                size={25}
              />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-35">
                Shared folder
              </p>

              <h1 className="mt-1 truncate text-2xl font-black">
                {currentName}
              </h1>

              <p className="mt-1 text-sm opacity-45">
                Browse and download files shared through Orivox.
              </p>
            </div>
          </div>

          {/* ==================== BREADCRUMB ==================== */}

          <div className="mt-6 flex flex-wrap items-center gap-1 text-sm">
            {path.length > 0 && (
              <button
                type="button"
                onClick={goBack}
                className="btn btn-ghost btn-sm mr-1 rounded-xl"
              >
                <ChevronLeft
                  size={15}
                />
                Back
              </button>
            )}

            <button
              type="button"
              onClick={goRoot}
              className={`rounded-lg px-2 py-1.5 transition ${
                path.length === 0
                  ? "bg-base-200 font-semibold"
                  : "opacity-55 hover:bg-base-200 hover:opacity-100"
              }`}
            >
              {rootFolder.name}
            </button>

            {path.map(
              (folder, index) => (
                <div
                  key={
                    folder.id
                  }
                  className="flex items-center gap-1"
                >
                  <span className="opacity-25">
                    /
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      goToPath(
                        index
                      )
                    }
                    className={`rounded-lg px-2 py-1.5 transition ${
                      index ===
                      path.length - 1
                        ? "bg-base-200 font-semibold"
                        : "opacity-55 hover:bg-base-200 hover:opacity-100"
                    }`}
                  >
                    {
                      folder.name
                    }
                  </button>
                </div>
              )
            )}
          </div>
        </motion.section>

        {/* ==================== CONTENT ERROR ==================== */}

        {contentsError && (
          <div className="alert alert-error mt-5 rounded-2xl">
            {contentsRequestError
              ?.response?.data
              ?.message ||
              "Unable to load folder contents."}
          </div>
        )}

        {downloadError && (
          <div className="alert alert-error mt-5 rounded-2xl">
            {downloadError}
          </div>
        )}

        {/* ==================== CONTENTS ==================== */}

        <section className="mt-6">
          {contentsLoading ? (
            <div className="flex min-h-72 items-center justify-center rounded-3xl border border-base-300 bg-base-100">
              <LoaderCircle
                size={27}
                className="animate-spin opacity-45"
              />
            </div>
          ) : (
            <>
              {/* ==================== FOLDERS ==================== */}

              {folders.length >
                0 && (
                <>
                  <h2 className="text-sm font-bold opacity-55">
                    Folders
                  </h2>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {folders.map(
                      (
                        folder,
                        index
                      ) => (
                        <motion.button
                          key={
                            folder.id
                          }
                          type="button"
                          initial={{
                            opacity: 0,
                            y: 12,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          transition={{
                            delay:
                              index *
                              0.03,
                          }}
                          whileHover={{
                            y: -3,
                            scale:
                              1.01,
                          }}
                          onClick={() =>
                            openFolder(
                              folder
                            )
                          }
                          className="rounded-2xl border border-base-300 bg-base-100 p-4 text-left shadow-sm"
                        >
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-base-200">
                            <Folder
                              size={
                                20
                              }
                            />
                          </div>

                          <p className="mt-4 truncate font-semibold">
                            {
                              folder.name
                            }
                          </p>

                          <p className="mt-1 text-xs opacity-40">
                            Open folder
                          </p>
                        </motion.button>
                      )
                    )}
                  </div>
                </>
              )}

              {/* ==================== FILES ==================== */}

              {files.length > 0 && (
                <>
                  <h2
                    className={`text-sm font-bold opacity-55 ${
                      folders.length
                        ? "mt-8"
                        : ""
                    }`}
                  >
                    Files
                  </h2>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {files.map(
                      (
                        file,
                        index
                      ) => {
                        const Icon =
                          getFileIcon(
                            file.mimeType
                          ) ||
                          FileText;

                        const downloading =
                          downloadMutation.isPending &&
                          downloadMutation
                            .variables
                            ?.fileId ===
                            file.id;

                        return (
                          <motion.article
                            key={
                              file.id
                            }
                            initial={{
                              opacity:
                                0,
                              y: 12,
                            }}
                            animate={{
                              opacity:
                                1,
                              y: 0,
                            }}
                            transition={{
                              delay:
                                index *
                                0.03,
                            }}
                            whileHover={{
                              y: -3,
                              scale:
                                1.01,
                            }}
                            className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm"
                          >
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-base-200">
                              <Icon
                                size={
                                  20
                                }
                              />
                            </div>

                            <p className="mt-4 truncate font-semibold">
                              {
                                file.name
                              }
                            </p>

                            <p className="mt-1 text-xs opacity-40">
                              {file.size !=
                              null
                                ? formatBytes(
                                    file.size
                                  )
                                : file.mimeType}
                            </p>

                            <button
                              type="button"
                              disabled={
                                downloading
                              }
                              onClick={() =>
                                handleDownload(
                                  file
                                )
                              }
                              className="btn btn-neutral btn-sm mt-4 w-full rounded-xl"
                            >
                              {downloading ? (
                                <>
                                  <LoaderCircle
                                    size={
                                      15
                                    }
                                    className="animate-spin"
                                  />
                                  Preparing...
                                </>
                              ) : (
                                <>
                                  <Download
                                    size={
                                      15
                                    }
                                  />
                                  Download
                                </>
                              )}
                            </button>
                          </motion.article>
                        );
                      }
                    )}
                  </div>
                </>
              )}

              {/* ==================== EMPTY ==================== */}

              {folders.length ===
                0 &&
                files.length ===
                  0 &&
                !contentsError && (
                  <div className="flex min-h-72 items-center justify-center rounded-3xl border border-dashed border-base-300 bg-base-100">
                    <div className="text-center">
                      <FolderOpen
                        size={30}
                        className="mx-auto opacity-25"
                      />

                      <h2 className="mt-4 font-bold">
                        Empty folder
                      </h2>

                      <p className="mt-1 text-sm opacity-40">
                        There are no
                        files or folders
                        here.
                      </p>
                    </div>
                  </div>
                )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
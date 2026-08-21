"use client";

import { use } from "react";

import {
  Cloud,
  Download,
  FileText,
  Link2,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

import { motion } from "framer-motion";

import { usePublicFile } from "@/components/features/share/usePublicFile";
import { usePublicFileDownload } from "@/components/features/share/usePublicFileDownload";

import {
  formatBytes,
  getFileIcon,
} from "@/components/features/files/file.utils";

export default function PublicFilePage({
  params,
}) {
  const { token } = use(params);

  const {
    data,
    isLoading,
    isError,
    error,
  } = usePublicFile(token);

  const downloadMutation =
    usePublicFileDownload();

  const payload =
    data?.data ?? data;

  const file =
    payload?.file ?? payload;

  const Icon =
    getFileIcon(file?.mimeType) ||
    FileText;

  async function handleDownload() {
    if (
      downloadMutation.isPending
    ) {
      return;
    }

    try {
      const result =
        await downloadMutation.mutateAsync(
          token
        );

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
      console.error(
        "Public download failed:",
        error
      );
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-base-200/30 px-4">
        <div className="text-center">
          <LoaderCircle
            size={30}
            className="mx-auto animate-spin opacity-45"
          />

          <p className="mt-3 text-sm opacity-45">
            Opening shared file...
          </p>
        </div>
      </main>
    );
  }

  if (isError || !file?.id) {
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
            {error?.response?.data?.message ||
              "This share link may have expired or been revoked."}
          </p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-base-200/30 px-4 py-10">
      {/* BACKGROUND */}

      <motion.div
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 20, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-base-300 blur-[110px]"
      />

      <motion.div
        initial={{
          opacity: 0,
          y: 30,
          scale: 0.96,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          type: "spring",
          stiffness: 220,
          damping: 22,
        }}
        className="relative z-10 w-full max-w-xl rounded-[2rem] border border-base-300 bg-base-100 p-7 shadow-2xl sm:p-9"
      >
        {/* BRAND */}

        <div className="flex items-center justify-center gap-2">
          <Cloud size={20} />

          <span className="font-black tracking-[0.18em]">
            ORIVOX
          </span>
        </div>

        <div className="mt-8 text-center">
          <motion.div
            whileHover={{
              rotate: -4,
              scale: 1.06,
            }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-base-200"
          >
            <Icon size={34} />
          </motion.div>

          <h1 className="mt-6 break-all text-2xl font-black">
            {file.name}
          </h1>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs opacity-40">
            {file.size != null && (
              <span>
                {formatBytes(
                  file.size
                )}
              </span>
            )}

            {file.mimeType && (
              <>
                <span>•</span>

                <span>
                  {file.mimeType}
                </span>
              </>
            )}
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs opacity-50">
            <ShieldCheck size={14} />

            Shared securely through Orivox
          </div>
        </div>

        <motion.button
          type="button"
          whileHover={{
            y: -2,
            scale: 1.02,
          }}
          whileTap={{
            scale: 0.97,
          }}
          disabled={
            downloadMutation.isPending
          }
          onClick={
            handleDownload
          }
          className="btn btn-neutral mt-8 w-full rounded-xl"
        >
          {downloadMutation.isPending ? (
            <>
              <LoaderCircle
                size={17}
                className="animate-spin"
              />

              Preparing download...
            </>
          ) : (
            <>
              <Download size={17} />
              Download file
            </>
          )}
        </motion.button>

        {downloadMutation.isError && (
          <p className="mt-3 text-center text-xs text-error">
            {downloadMutation.error
              ?.response?.data
              ?.message ||
              "Unable to download this file."}
          </p>
        )}
      </motion.div>
    </main>
  );
}
"use client";

import { useRouter } from "next/navigation";
import { Files, FolderOpen, LoaderCircle, Share2 } from "lucide-react";
import { motion } from "framer-motion";

import { useSharedWithMe } from "@/features/share/useSharedWithMe";
import SharedFileCard from "@/features/share/components/SharedFileCard";
import SharedFolderCard from "@/features/share/components/SharedFolderCard";

export default function SharedPage() {
  const router = useRouter();

  const { data, isLoading, isError, error, refetch } = useSharedWithMe();

  /*
    We temporarily support a couple of common response shapes.

    Once we see the exact response from:
    GET /api/v1/shares/with-me

    we'll make this strict.
  */
  const payload = data?.data ?? data ?? {};

  const fileShares = payload.fileShares ?? payload.files ?? [];

  const folderShares = payload.folderShares ?? payload.folders ?? [];

  const total = fileShares.length + folderShares.length;

  function handleOpenFolder(shareFolder) {
    if (!shareFolder?.id) return;

    /*
      We'll connect shared-folder navigation properly
      once we verify the existing authenticated folder
      route + permission behavior.

      Do NOT invent another backend route here.
    */

    router.push(`/folders/${shareFolder.id}`);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="text-center">
          <LoaderCircle size={30} className="mx-auto animate-spin opacity-50" />

          <p className="mt-3 text-sm opacity-45">Loading shared items...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-error/20 bg-error/5 p-6 text-center">
          <Share2 size={28} className="mx-auto opacity-50" />

          <h2 className="mt-3 font-bold">Unable to load shared items</h2>

          <p className="mt-2 text-sm opacity-50">
            {error?.response?.data?.message ||
              "Something went wrong while loading items shared with you."}
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="btn btn-neutral btn-sm mt-5 rounded-xl"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* ==================== HEADER ==================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: -10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-base-content text-base-100">
            <Share2 size={20} />
          </div>

          <div>
            <h1 className="text-2xl font-bold">Shared with me</h1>

            <p className="mt-1 text-sm opacity-45">
              Files and folders other people have shared with you.
            </p>
          </div>
        </div>

        {total > 0 && (
          <p className="mt-5 text-xs font-medium opacity-40">
            {total} shared {total === 1 ? "item" : "items"}
          </p>
        )}
      </motion.div>

      {/* ==================== EMPTY ==================== */}

      {total === 0 && (
        <motion.div
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="flex min-h-[380px] items-center justify-center rounded-3xl border border-dashed border-base-300 bg-base-100"
        >
          <div className="max-w-sm px-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-base-200">
              <Share2 size={23} className="opacity-50" />
            </div>

            <h2 className="mt-4 font-bold">Nothing shared yet</h2>

            <p className="mt-2 text-sm leading-6 opacity-45">
              Files and folders shared with your Orivox account will appear
              here.
            </p>
          </div>
        </motion.div>
      )}

      {/* ==================== FOLDERS ==================== */}

      {folderShares.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <FolderOpen size={18} />

            <h2 className="font-bold">Folders</h2>

            <span className="badge badge-ghost badge-sm">
              {folderShares.length}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {folderShares.map((share, index) => (
              <SharedFolderCard
                key={
                  share.id ??
                  share.shareId ??
                  share.folder?.id ??
                  `folder-${index}`
                }
                share={share}
                index={index}
                onOpen={handleOpenFolder}
              />
            ))}
          </div>
        </section>
      )}

      {/* ==================== FILES ==================== */}

      {fileShares.length > 0 && (
        <section className={folderShares.length > 0 ? "mt-10" : ""}>
          <div className="mb-4 flex items-center gap-2">
            <Files size={18} />

            <h2 className="font-bold">Files</h2>

            <span className="badge badge-ghost badge-sm">
              {fileShares.length}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {fileShares.map((share, index) => (
              <SharedFileCard key={share.id} share={share} index={index} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

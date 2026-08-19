"use client";

import {
  Folder,
  MoreVertical,
} from "lucide-react";

import { motion } from "framer-motion";

import FolderCard from "./FolderCard";
import FileCard from "./FileCard";

import {
  formatBytes,
  getFileIcon,
} from "../file.utils";

export default function ExplorerList({
  folders,
  files,
  view,
  onOpenFolder,
}) {
  if (view === "grid") {
    return (
      <section className="mt-6">
        {folders.length > 0 && (
          <>
            <h2 className="text-sm font-bold opacity-55">
              Folders
            </h2>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {folders.map(
                (folder, index) => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    index={index}
                    onOpen={
                      onOpenFolder
                    }
                  />
                )
              )}
            </div>
          </>
        )}

        {files.length > 0 && (
          <>
            <h2
              className={`${
                folders.length
                  ? "mt-8"
                  : ""
              } text-sm font-bold opacity-55`}
            >
              Files
            </h2>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {files.map(
                (file, index) => (
                  <FileCard
                    key={file.id}
                    file={file}
                    index={index}
                  />
                )
              )}
            </div>
          </>
        )}
      </section>
    );
  }

  return (
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
              onDoubleClick={() => {
                if (isFolder) {
                  onOpenFolder(
                    item.id
                  );
                }
              }}
              className={`grid grid-cols-[1fr_auto] items-center gap-4 border-b border-base-300 px-5 py-3.5 last:border-b-0 sm:grid-cols-[1fr_120px_130px_40px] ${
                isFolder
                  ? "cursor-pointer"
                  : ""
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-base-200">
                  <Icon size={17} />
                </div>

                {isFolder ? (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenFolder(
                        item.id
                      )
                    }
                    className="truncate text-left text-sm font-semibold hover:underline"
                  >
                    {item.name}
                  </button>
                ) : (
                  <p className="truncate text-sm font-semibold">
                    {item.name}
                  </p>
                )}
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

              <button
                type="button"
                onClick={(event) =>
                  event.stopPropagation()
                }
                className="btn btn-ghost btn-circle btn-sm"
                aria-label={`Actions for ${item.name}`}
              >
                <MoreVertical
                  size={17}
                />
              </button>
            </motion.div>
          );
        }
      )}
    </motion.section>
  );
}
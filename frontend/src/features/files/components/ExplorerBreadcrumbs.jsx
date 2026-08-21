"use client";

import {
  ChevronRight,
  Home,
} from "lucide-react";

import { motion } from "framer-motion";

export default function ExplorerBreadcrumbs({
  folderId,
  path,
  loading,
  onOpenFolder,
  onRoot,
}) {
  return (
    <motion.nav
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 }}
      aria-label="Folder breadcrumb"
      className="mt-6 flex items-center gap-1 overflow-x-auto pb-1 text-sm"
    >
      <motion.button
        type="button"
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.96 }}
        onClick={onRoot}
        className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 font-medium transition ${
          !folderId
            ? "bg-base-200 opacity-100"
            : "opacity-55 hover:bg-base-200 hover:opacity-100"
        }`}
      >
        <Home size={15} />
        My Files
      </motion.button>

      {folderId && loading && (
        <>
          <ChevronRight
            size={14}
            className="shrink-0 opacity-30"
          />

          <span className="loading loading-dots loading-xs" />
        </>
      )}

      {!loading &&
        path.map((folder) => {
          const current =
            folder.id === folderId;

          return (
            <div
              key={folder.id}
              className="flex shrink-0 items-center gap-1"
            >
              <ChevronRight
                size={14}
                className="opacity-30"
              />

              <motion.button
                type="button"
                whileHover={{
                  y: current ? 0 : -1,
                }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  if (!current) {
                    onOpenFolder(folder.id);
                  }
                }}
                className={`rounded-lg px-2 py-1.5 transition ${
                  current
                    ? "cursor-default bg-base-200 font-semibold"
                    : "font-medium opacity-55 hover:bg-base-200 hover:opacity-100"
                }`}
              >
                {folder.name}
              </motion.button>
            </div>
          );
        })}
    </motion.nav>
  );
}
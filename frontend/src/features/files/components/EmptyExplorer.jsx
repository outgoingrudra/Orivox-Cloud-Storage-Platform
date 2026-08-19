"use client";

import {
  Folder,
  Plus,
  Upload,
} from "lucide-react";

import { motion } from "framer-motion";

export default function EmptyExplorer({
  searching = false,
  onCreateFolder,
  onUpload,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.96,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      className="mt-10 flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-base-300 bg-base-100 p-8 text-center"
    >
      <motion.div
        initial={{
          rotate: -10,
          scale: 0.85,
        }}
        animate={{
          rotate: 0,
          scale: 1,
        }}
        whileHover={{
          rotate: -5,
          scale: 1.06,
        }}
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
        {searching
          ? "No matching items"
          : "Nothing here yet"}
      </h2>

      <p className="mt-2 max-w-sm text-sm opacity-50">
        {searching
          ? "Try changing your search or filters."
          : "Create a folder or upload your first file to start organizing your workspace."}
      </p>

      {!searching && (
        <div className="mt-6 flex gap-2">
          <motion.button
            type="button"
            whileHover={{
              y: -2,
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.97,
            }}
            onClick={onCreateFolder}
            className="btn btn-outline btn-sm rounded-xl"
          >
            <Plus size={15} />
            New folder
          </motion.button>

          <motion.button
            type="button"
            whileHover={{
              y: -2,
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.97,
            }}
            onClick={onUpload}
            className="btn btn-neutral btn-sm rounded-xl"
          >
            <Upload size={15} />
            Upload
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
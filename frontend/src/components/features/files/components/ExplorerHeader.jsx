"use client";

import { Plus, Upload } from "lucide-react";
import { motion } from "framer-motion";

export default function ExplorerHeader({
  title,
  itemsCount,
  onCreateFolder,
  onUpload,
}) {
  return (
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
          {title}
        </h1>

        <p className="mt-2 text-sm opacity-55">
          {itemsCount} item{itemsCount === 1 ? "" : "s"} in this folder.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <motion.button
          type="button"
          onClick={onCreateFolder}
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="btn btn-outline btn-sm rounded-xl"
        >
          <Plus size={16} />
          New folder
        </motion.button>

        <motion.button
          type="button"
          onClick={onUpload}
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="btn btn-neutral btn-sm rounded-xl"
        >
          <Upload size={16} />
          Upload
        </motion.button>
      </div>
    </motion.section>
  );
}
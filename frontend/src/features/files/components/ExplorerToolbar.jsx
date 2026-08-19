"use client";

import {
  ChevronDown,
  Grid2X2,
  List,
  Search,
} from "lucide-react";

import { motion } from "framer-motion";

export default function ExplorerToolbar({
  search,
  setSearch,
  type,
  setType,
  sortBy,
  setSortBy,
  order,
  setOrder,
  view,
  setView,
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className="mt-5 flex flex-col gap-3 rounded-2xl border border-base-300 bg-base-100 p-3 lg:flex-row lg:items-center"
    >
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

      <select
        value={type}
        onChange={(event) =>
          setType(event.target.value)
        }
        className="select select-bordered h-10 min-h-0 rounded-xl"
      >
        <option value="">All types</option>
        <option value="image">Images</option>
        <option value="video">Videos</option>
        <option value="audio">Audio</option>
        <option value="document">Documents</option>
        <option value="archive">Archives</option>
        <option value="other">Other</option>
      </select>

      <select
        value={sortBy}
        onChange={(event) =>
          setSortBy(event.target.value)
        }
        className="select select-bordered h-10 min-h-0 rounded-xl"
      >
        <option value="name">Name</option>
        <option value="createdAt">Created</option>
        <option value="updatedAt">Updated</option>
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
          className={`transition-transform ${
            order === "desc"
              ? "rotate-180"
              : ""
          }`}
        />
      </button>

      <div className="flex rounded-xl border border-base-300 p-1">
        <button
          type="button"
          onClick={() =>
            setView("grid")
          }
          aria-label="Grid view"
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
          aria-label="List view"
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
  );
}
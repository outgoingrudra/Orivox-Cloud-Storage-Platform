"use client";

import {
  ChevronDown,
  File,
  Folder,
  Grid2X2,
  Layers3,
  List,
  Search,
} from "lucide-react";

import { motion } from "framer-motion";

export default function ExplorerToolbar({
  search,
  setSearch,

  type,
  setType,

  contentFilter,
  setContentFilter,

  sortBy,
  setSortBy,

  order,
  setOrder,

  view,
  setView,
}) {
  function handleContentFilter(
    value
  ) {
    setContentFilter(value);

    // File MIME filter doesn't make
    // sense while viewing folders.
    if (value === "folders") {
      setType("");
    }
  }

  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: 0.08,
      }}
      className="mt-5 space-y-3 rounded-2xl border border-base-300 bg-base-100 p-3"
    >
      {/* ==================== TOP ROW ==================== */}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* SEARCH */}

        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40"
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search this folder..."
            className="input input-bordered h-10 w-full rounded-xl bg-base-200/60 pl-11"
          />
        </div>

        {/* FILE TYPE */}

        <select
          value={type}
          onChange={(event) =>
            setType(
              event.target.value
            )
          }
          disabled={
            contentFilter ===
            "folders"
          }
          className="select select-bordered h-10 min-h-0 rounded-xl disabled:opacity-35"
        >
          <option value="">
            All types
          </option>

          <option value="image">
            Images
          </option>

          <option value="video">
            Videos
          </option>

          <option value="audio">
            Audio
          </option>

          <option value="document">
            Documents
          </option>

          <option value="archive">
            Archives
          </option>

          <option value="other">
            Other
          </option>
        </select>

        {/* SORT */}

        <select
          value={sortBy}
          onChange={(event) =>
            setSortBy(
              event.target.value
            )
          }
          className="select select-bordered h-10 min-h-0 rounded-xl"
        >
          <option value="name">
            Name
          </option>

          <option value="createdAt">
            Created
          </option>

          <option value="updatedAt">
            Updated
          </option>
        </select>

        {/* ORDER */}

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

        {/* VIEW */}

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
            <Grid2X2
              size={16}
            />
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
      </div>

      {/* ==================== CONTENT FILTER ==================== */}

      <div className="flex items-center gap-2 border-t border-base-300 pt-3">
        <span className="mr-1 text-xs font-semibold opacity-40">
          Show
        </span>

        <button
          type="button"
          onClick={() =>
            handleContentFilter(
              "all"
            )
          }
          className={`btn btn-sm rounded-xl ${
            contentFilter ===
            "all"
              ? "btn-neutral"
              : "btn-ghost"
          }`}
        >
          <Layers3 size={14} />
          All
        </button>

        <button
          type="button"
          onClick={() =>
            handleContentFilter(
              "files"
            )
          }
          className={`btn btn-sm rounded-xl ${
            contentFilter ===
            "files"
              ? "btn-neutral"
              : "btn-ghost"
          }`}
        >
          <File size={14} />
          Files
        </button>

        <button
          type="button"
          onClick={() =>
            handleContentFilter(
              "folders"
            )
          }
          className={`btn btn-sm rounded-xl ${
            contentFilter ===
            "folders"
              ? "btn-neutral"
              : "btn-ghost"
          }`}
        >
          <Folder size={14} />
          Folders
        </button>
      </div>
    </motion.section>
  );
}
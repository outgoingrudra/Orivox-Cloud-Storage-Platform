"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

import { useExplorer } from "@/features/files/useExplorer";
import { useFolderDetails } from "@/features/files/useFolderDetails";

import ExplorerHeader from "@/features/files/components/ExplorerHeader";
import ExplorerBreadcrumbs from "@/features/files/components/ExplorerBreadcrumbs";
import ExplorerToolbar from "@/features/files/components/ExplorerToolbar";
import ExplorerList from "@/features/files/components/ExplorerList";
import EmptyExplorer from "@/features/files/components/EmptyExplorer";
import CreateFolderModal from "@/features/files/components/CreateFolderModal";
import UploadModal from "@/features/files/components/UploadModal";

export default function FilesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const folderId = searchParams.get("folder");

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [order, setOrder] = useState("asc");
  const [view, setView] = useState("grid");

  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const {
    data: folderDetails,
    isLoading: folderDetailsLoading,
  } = useFolderDetails(folderId);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useExplorer({
    folderId,
    search,
    type,
    sortBy,
    order,
  });

  const folders = data?.folders || [];
  const files = data?.files || [];

  const itemsCount = useMemo(
    () => folders.length + files.length,
    [folders, files]
  );

  function openFolder(id) {
    setSearch("");
    setType("");

    router.push(
      `/files?folder=${encodeURIComponent(id)}`
    );
  }

  function goToRoot() {
    setSearch("");
    setType("");

    router.push("/files");
  }

  function handleUpload() {
    setUploadOpen(true);
  }

  // =====================================================
  // INITIAL LOADING
  // =====================================================

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <LoaderCircle
            size={30}
            className="animate-spin"
          />

          <p className="text-sm opacity-45">
            Loading your files...
          </p>
        </motion.div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto mt-16 max-w-lg rounded-2xl border border-error/30 bg-error/5 p-6 text-center"
      >
        <h2 className="text-lg font-bold">
          Unable to load files
        </h2>

        <p className="mt-2 text-sm opacity-60">
          {error?.response?.data?.message ||
            "Something went wrong while loading your workspace."}
        </p>

        <button
          type="button"
          onClick={() => refetch()}
          className="btn btn-neutral btn-sm mt-5 rounded-xl"
        >
          <RefreshCw size={15} />
          Try again
        </button>
      </motion.div>
    );
  }

  const searching =
    Boolean(search.trim()) ||
    Boolean(type);

  return (
    <div className="mx-auto max-w-7xl">
      {/* ==================== HEADER ==================== */}

      <ExplorerHeader
        title={
          folderDetails?.folder?.name ||
          "My Files"
        }
        itemsCount={itemsCount}
        onCreateFolder={() =>
          setCreateFolderOpen(true)
        }
        onUpload={handleUpload}
      />

      {/* ==================== BREADCRUMB ==================== */}

      <ExplorerBreadcrumbs
        folderId={folderId}
        path={
          folderDetails?.path || []
        }
        loading={
          folderDetailsLoading
        }
        onOpenFolder={openFolder}
        onRoot={goToRoot}
      />

      {/* ==================== TOOLBAR ==================== */}

      <ExplorerToolbar
        search={search}
        setSearch={setSearch}
        type={type}
        setType={setType}
        sortBy={sortBy}
        setSortBy={setSortBy}
        order={order}
        setOrder={setOrder}
        view={view}
        setView={setView}
      />

      {/* ==================== REFETCH INDICATOR ==================== */}

      {isFetching && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 0.45, y: 0 }}
          className="mt-3 flex items-center gap-2 text-xs"
        >
          <LoaderCircle
            size={13}
            className="animate-spin"
          />

          Updating results...
        </motion.div>
      )}

      {/* ==================== CONTENT ==================== */}

      {itemsCount === 0 ? (
        <EmptyExplorer
          searching={searching}
          onCreateFolder={() =>
            setCreateFolderOpen(true)
          }
          onUpload={handleUpload}
        />
      ) : (
        <ExplorerList
          folders={folders}
          files={files}
          view={view}
          onOpenFolder={openFolder}
        />
      )}

      {/* ==================== CREATE FOLDER ==================== */}

      <CreateFolderModal
        open={createFolderOpen}
        onClose={() =>
          setCreateFolderOpen(false)
        }
        parentId={folderId}
        parentName={
          folderDetails?.folder?.name
        }
      />

      {/* ==================== UPLOAD ==================== */}

      <UploadModal
        open={uploadOpen}
        onClose={() =>
          setUploadOpen(false)
        }
        folderId={folderId}
        folderName={
          folderDetails?.folder?.name
        }
      />
    </div>
  );
}
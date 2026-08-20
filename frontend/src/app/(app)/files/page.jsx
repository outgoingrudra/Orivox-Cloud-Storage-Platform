"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

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
  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const folderId =
    searchParams.get("folder");

  // ==================== FILTER / VIEW STATE ====================

  const [search, setSearch] =
    useState("");

  /*
    File-specific type filter:
    image / video / audio / document / etc.
  */
  const [type, setType] =
    useState("");

  /*
    Explorer-level content filter:
    all / files / folders
  */
  const [
    contentFilter,
    setContentFilter,
  ] = useState("all");

  const [sortBy, setSortBy] =
    useState("name");

  const [order, setOrder] =
    useState("asc");

  const [view, setView] =
    useState("grid");

  // ==================== MODALS ====================

  const [
    createFolderOpen,
    setCreateFolderOpen,
  ] = useState(false);

  const [
    uploadOpen,
    setUploadOpen,
  ] = useState(false);

  // ==================== INFINITE SCROLL ====================

  const loadMoreRef =
    useRef(null);

  // ==================== FOLDER DETAILS ====================

  const {
    data: folderDetails,
    isLoading:
      folderDetailsLoading,
  } = useFolderDetails(
    folderId
  );

  // ==================== EXPLORER ====================

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
  } = useExplorer({
    folderId,
    search,
    type,
    contentFilter,
    sortBy,
    order,
  });

  // =====================================================
  // FLATTEN INFINITE QUERY PAGES
  // =====================================================

  const folders = useMemo(
    () =>
      data?.pages.flatMap(
        (page) =>
          page.folders || []
      ) || [],
    [data]
  );

  const files = useMemo(
    () =>
      data?.pages.flatMap(
        (page) =>
          page.files || []
      ) || [],
    [data]
  );

  const itemsCount =
    folders.length +
    files.length;

  // =====================================================
  // INFINITE SCROLL
  // =====================================================

  useEffect(() => {
    const target =
      loadMoreRef.current;

    if (!target) return;

    const observer =
      new IntersectionObserver(
        (entries) => {
          const entry =
            entries[0];

          if (
            entry.isIntersecting &&
            hasNextPage &&
            !isFetchingNextPage
          ) {
            fetchNextPage();
          }
        },
        {
          root: null,
          rootMargin:
            "250px",
          threshold: 0,
        }
      );

    observer.observe(
      target
    );

    return () => {
      observer.disconnect();
    };
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  ]);

  // =====================================================
  // NAVIGATION
  // =====================================================

  function openFolder(id) {
    setSearch("");
    setType("");

    /*
      Keep contentFilter unchanged.

      Example:
      If the user selects "Folders",
      entering another folder should
      still show only folders.
    */

    router.push(
      `/files?folder=${encodeURIComponent(
        id
      )}`
    );
  }

  function goToRoot() {
    setSearch("");
    setType("");

    router.push(
      "/files"
    );
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
          initial={{
            opacity: 0,
            scale: 0.92,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
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
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="mx-auto mt-16 max-w-lg rounded-2xl border border-error/30 bg-error/5 p-6 text-center"
      >
        <h2 className="text-lg font-bold">
          Unable to load files
        </h2>

        <p className="mt-2 text-sm opacity-60">
          {error?.response
            ?.data
            ?.message ||
            "Something went wrong while loading your workspace."}
        </p>

        <button
          type="button"
          onClick={() =>
            refetch()
          }
          className="btn btn-neutral btn-sm mt-5 rounded-xl"
        >
          <RefreshCw
            size={15}
          />

          Try again
        </button>
      </motion.div>
    );
  }

  // =====================================================
  // EMPTY STATE CONTEXT
  // =====================================================

  const searching =
    Boolean(
      search.trim()
    ) ||
    Boolean(type) ||
    contentFilter !==
      "all";

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="mx-auto max-w-7xl">
      {/* ==================== HEADER ==================== */}

      <ExplorerHeader
        title={
          folderDetails?.folder
            ?.name ||
          "My Files"
        }
        itemsCount={
          itemsCount
        }
        onCreateFolder={() =>
          setCreateFolderOpen(
            true
          )
        }
        onUpload={
          handleUpload
        }
      />

      {/* ==================== BREADCRUMB ==================== */}

      <ExplorerBreadcrumbs
        folderId={
          folderId
        }
        path={
          folderDetails?.path ||
          []
        }
        loading={
          folderDetailsLoading
        }
        onOpenFolder={
          openFolder
        }
        onRoot={
          goToRoot
        }
      />

      {/* ==================== TOOLBAR ==================== */}

      <ExplorerToolbar
        search={search}
        setSearch={
          setSearch
        }

        type={type}
        setType={
          setType
        }

        contentFilter={
          contentFilter
        }
        setContentFilter={
          setContentFilter
        }

        sortBy={
          sortBy
        }
        setSortBy={
          setSortBy
        }

        order={order}
        setOrder={
          setOrder
        }

        view={view}
        setView={
          setView
        }
      />

      {/* ==================== BACKGROUND REFETCH ==================== */}

      {isFetching &&
        !isFetchingNextPage && (
          <motion.div
            initial={{
              opacity: 0,
              y: -4,
            }}
            animate={{
              opacity: 0.45,
              y: 0,
            }}
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
          searching={
            searching
          }
          onCreateFolder={() =>
            setCreateFolderOpen(
              true
            )
          }
          onUpload={
            handleUpload
          }
        />
      ) : (
        <ExplorerList
          folders={
            folders
          }
          files={
            files
          }
          view={view}
          onOpenFolder={
            openFolder
          }
        />
      )}

      {/* ==================== INFINITE SCROLL SENTINEL ==================== */}

      {itemsCount > 0 && (
        <div
          ref={
            loadMoreRef
          }
          className="flex min-h-24 items-center justify-center py-6"
        >
          {isFetchingNextPage ? (
            <motion.div
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 0.5,
                y: 0,
              }}
              className="flex items-center gap-2 text-sm"
            >
              <LoaderCircle
                size={17}
                className="animate-spin"
              />

              Loading more...
            </motion.div>
          ) : hasNextPage ? (
            <span className="text-xs opacity-30">
              Scroll for more
            </span>
          ) : (
            <motion.span
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 0.3,
              }}
              className="text-xs"
            >
              You&apos;ve
              reached the end
            </motion.span>
          )}
        </div>
      )}

      {/* ==================== CREATE FOLDER ==================== */}

      <CreateFolderModal
        open={
          createFolderOpen
        }
        onClose={() =>
          setCreateFolderOpen(
            false
          )
        }
        parentId={
          folderId
        }
        parentName={
          folderDetails?.folder
            ?.name
        }
      />

      {/* ==================== UPLOAD ==================== */}

      <UploadModal
        open={
          uploadOpen
        }
        onClose={() =>
          setUploadOpen(
            false
          )
        }
        folderId={
          folderId
        }
        folderName={
          folderDetails?.folder
            ?.name
        }
      />
    </div>
  );
}
import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

async function fetchExplorerPage({
  pageParam = 1,
  folderId,
  search,
  type,
  contentFilter,
  sortBy,
  order,
  limit,
}) {
  const commonParams = {
    search: search || undefined,
    sortBy,
    order,
    page: pageParam,
    limit,
  };

  // ==================== FILES ONLY ====================

  if (contentFilter === "files") {
    const filesResponse =
      await api.get("/files", {
        params: {
          ...commonParams,
          folderId:
            folderId || undefined,
          type: type || undefined,
        },
      });

    return {
      folders: [],
      files:
        filesResponse.data.data.files,
      folderPagination: null,
      filePagination:
        filesResponse.data.data
          .pagination,
      page: pageParam,
    };
  }

  // ==================== FOLDERS ONLY ====================

  if (contentFilter === "folders") {
    const foldersResponse =
      await api.get("/folders", {
        params: {
          ...commonParams,
          parentId:
            folderId || undefined,
        },
      });

    return {
      folders:
        foldersResponse.data.data
          .folders,
      files: [],
      folderPagination:
        foldersResponse.data.data
          .pagination,
      filePagination: null,
      page: pageParam,
    };
  }

  // ==================== ALL ====================

  const [
    foldersResponse,
    filesResponse,
  ] = await Promise.all([
    api.get("/folders", {
      params: {
        ...commonParams,
        parentId:
          folderId || undefined,
      },
    }),

    api.get("/files", {
      params: {
        ...commonParams,
        folderId:
          folderId || undefined,
        type: type || undefined,
      },
    }),
  ]);

  return {
    folders:
      foldersResponse.data.data
        .folders,

    files:
      filesResponse.data.data.files,

    folderPagination:
      foldersResponse.data.data
        .pagination,

    filePagination:
      filesResponse.data.data
        .pagination,

    page: pageParam,
  };
}

export function useExplorer({
  folderId = null,
  search = "",
  type = "",
  contentFilter = "all",
  sortBy = "name",
  order = "asc",
  limit = 20,
} = {}) {
  return useInfiniteQuery({
    queryKey: [
      "explorer",
      {
        folderId,
        search,
        type,
        contentFilter,
        sortBy,
        order,
        limit,
      },
    ],

    initialPageParam: 1,

    queryFn: ({ pageParam }) =>
      fetchExplorerPage({
        pageParam,
        folderId,
        search,
        type,
        contentFilter,
        sortBy,
        order,
        limit,
      }),

    getNextPageParam: (
      lastPage
    ) => {
      const folderHasNext =
        lastPage.folderPagination
          ?.hasNextPage ?? false;

      const fileHasNext =
        lastPage.filePagination
          ?.hasNextPage ?? false;

      if (
        !folderHasNext &&
        !fileHasNext
      ) {
        return undefined;
      }

      return lastPage.page + 1;
    },

    staleTime: 20 * 1000,
  });
}
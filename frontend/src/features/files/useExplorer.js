import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

async function fetchExplorer({
  folderId,
  search,
  type,
  sortBy,
  order,
  page,
  limit,
}) {
  const commonParams = {
    search: search || undefined,
    sortBy,
    order,
    page,
    limit,
  };

  const [foldersResponse, filesResponse] =
    await Promise.all([
      api.get("/folders", {
        params: {
          ...commonParams,
          parentId: folderId || undefined,
        },
      }),

      api.get("/files", {
        params: {
          ...commonParams,
          folderId: folderId || undefined,
          type: type || undefined,
        },
      }),
    ]);

  return {
    folders:
      foldersResponse.data.data.folders,

    files:
      filesResponse.data.data.files,

    folderPagination:
      foldersResponse.data.data.pagination,

    filePagination:
      filesResponse.data.data.pagination,
  };
}

export function useExplorer({
  folderId = null,
  search = "",
  type = "",
  sortBy = "name",
  order = "asc",
  page = 1,
  limit = 20,
} = {}) {
  return useQuery({
    queryKey: [
      "explorer",
      {
        folderId,
        search,
        type,
        sortBy,
        order,
        page,
        limit,
      },
    ],

    queryFn: () =>
      fetchExplorer({
        folderId,
        search,
        type,
        sortBy,
        order,
        page,
        limit,
      }),

    staleTime: 20 * 1000,

    /*
      Keeps previous content visible while
      moving between pages/filter states.
    */
    placeholderData:
      (previousData) =>
        previousData,
  });
}
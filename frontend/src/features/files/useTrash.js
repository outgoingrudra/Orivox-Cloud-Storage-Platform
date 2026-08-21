import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

async function fetchTrashPage({ pageParam = 1 }) {
  const [folderResponse, fileResponse] = await Promise.all([
    api.get("/folders/trash", {
      params: {
        page: pageParam,
        limit: 20,
      },
    }),

    api.get("/files/trash", {
      params: {
        page: pageParam,
        limit: 20,
      },
    }),
  ]);

  return {
    folders: folderResponse.data.data.folders,
    files: fileResponse.data.data.files,

    folderPagination:
      folderResponse.data.data.pagination,

    filePagination:
      fileResponse.data.data.pagination,

    page: pageParam,
  };
}

export function useTrash() {
  return useInfiniteQuery({
    queryKey: ["trash"],

    initialPageParam: 1,

    queryFn: ({ pageParam }) =>
      fetchTrashPage({
        pageParam,
      }),

    getNextPageParam: (lastPage) => {
      const folderHasNext =
        lastPage.folderPagination?.hasNextPage;

      const fileHasNext =
        lastPage.filePagination?.hasNextPage;

      if (!folderHasNext && !fileHasNext) {
        return undefined;
      }

      return lastPage.page + 1;
    },

    staleTime: 20 * 1000,
  });
}
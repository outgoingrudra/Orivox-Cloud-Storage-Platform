import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

async function fetchTrash() {
  const [
    folderResponse,
    fileResponse,
  ] = await Promise.all([
    api.get("/folders/trash"),
    api.get("/files/trash"),
  ]);

  return {
    folders:
      folderResponse.data.data.folders,

    files:
      fileResponse.data.data.files,

    folderPagination:
      folderResponse.data.data.pagination,

    filePagination:
      fileResponse.data.data.pagination,
  };
}

export function useTrash() {
  return useQuery({
    queryKey: ["trash"],
    queryFn: fetchTrash,
    staleTime: 20 * 1000,
  });
}
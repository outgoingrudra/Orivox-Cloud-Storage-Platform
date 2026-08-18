import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

async function fetchFolderDetails(folderId) {
  const response = await api.get(`/folders/${folderId}`);
  return response.data.data;
}

export function useFolderDetails(folderId) {
  return useQuery({
    queryKey: ["folder-details", folderId],
    queryFn: () => fetchFolderDetails(folderId),
    enabled: Boolean(folderId),
    staleTime: 30 * 1000,
  });
}
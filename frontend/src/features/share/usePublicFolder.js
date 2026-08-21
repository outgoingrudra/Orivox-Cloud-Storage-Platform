import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

async function fetchPublicFolder(token) {
  const response = await api.get(`/shares/public/folder/${token}`);
  return response.data;
}

export function usePublicFolder(token) {
  return useQuery({
    queryKey: ["public-folder", token],
    queryFn: () => fetchPublicFolder(token),
    enabled: Boolean(token),
    retry: false,
    staleTime: 30 * 1000,
  });
}
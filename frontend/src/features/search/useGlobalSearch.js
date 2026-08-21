import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

async function globalSearch(query) {
  const response = await api.get("/search", {
    params: {
      q: query,
      limit: 20,
    },
  });

  return response.data.data;
}

export function useGlobalSearch(query) {
  const normalizedQuery = query.trim().toLowerCase();

  return useQuery({
    queryKey: ["global-search", normalizedQuery],

    queryFn: () => globalSearch(normalizedQuery),

    enabled: normalizedQuery.length > 0,

    // Cached search stays fresh for 10 minutes.
    // Returning to the same query won't trigger another request.
    staleTime: 10 * 60 * 1000,

    // Keep unused search results in cache for 30 minutes.
    gcTime: 30 * 60 * 1000,

    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}
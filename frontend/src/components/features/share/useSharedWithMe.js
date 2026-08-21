import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

async function fetchSharedWithMe() {
  const response = await api.get(
    "/shares/with-me"
  );

  return response.data;
}

export function useSharedWithMe() {
  return useQuery({
    queryKey: ["shared-with-me"],

    queryFn: fetchSharedWithMe,

    staleTime: 20 * 1000,
  });
}
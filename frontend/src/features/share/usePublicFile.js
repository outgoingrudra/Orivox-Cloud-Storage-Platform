import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

async function fetchPublicFile(token) {
  const response = await api.get(
    `/shares/public/file/${token}`
  );

  return response.data;
}

export function usePublicFile(token) {
  return useQuery({
    queryKey: [
      "public-share-file",
      token,
    ],

    queryFn: () =>
      fetchPublicFile(token),

    enabled: Boolean(token),

    retry: false,
  });
}
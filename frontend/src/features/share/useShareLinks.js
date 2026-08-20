import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

async function fetchShareLinks({
  type,
  itemId,
}) {
  const endpoint =
    type === "file"
      ? `/shares/files/${itemId}/links`
      : `/shares/folders/${itemId}/links`;

  const response = await api.get(endpoint);

  return response.data;
}

export function useShareLinks({
  type,
  itemId,
  enabled = true,
}) {
  return useQuery({
    queryKey: [
      "share-links",
      type,
      itemId,
    ],

    queryFn: () =>
      fetchShareLinks({
        type,
        itemId,
      }),

    enabled:
      enabled &&
      Boolean(type) &&
      Boolean(itemId),
  });
}
import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

async function getItemAccess({
  type,
  itemId,
}) {
  const endpoint =
    type === "file"
      ? `/shares/files/${itemId}`
      : `/shares/folders/${itemId}`;

  const response =
    await api.get(endpoint);

  return response.data;
}
export function useItemAccess({
  type,
  itemId,
  enabled = true,
}) {
  return useQuery({
    queryKey: [
      "share-access",
      type,
      itemId,
    ],

    queryFn: () =>
      getItemAccess({
        type,
        itemId,
      }),

    enabled:
      enabled &&
      Boolean(type) &&
      Boolean(itemId),
  });
}
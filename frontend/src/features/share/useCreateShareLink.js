import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { api } from "@/lib/api";

async function createShareLink({
  type,
  itemId,
  expiresAt,
}) {
  const endpoint =
    type === "file"
      ? `/shares/files/${itemId}/links`
      : `/shares/folders/${itemId}/links`;

  const body = {};

  if (expiresAt) {
    body.expiresAt = expiresAt;
  }

  const response = await api.post(
    endpoint,
    body
  );

  return response.data;
}

export function useCreateShareLink() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: createShareLink,

    onSuccess: async (
      _data,
      variables
    ) => {
      await queryClient.invalidateQueries({
        queryKey: [
          "share-links",
          variables.type,
          variables.itemId,
        ],
      });
    },
  });
}
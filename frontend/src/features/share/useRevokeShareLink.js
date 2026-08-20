import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { api } from "@/lib/api";

async function revokeShareLink({
  type,
  itemId,
  linkId,
}) {
  const endpoint =
    type === "file"
      ? `/shares/files/links/${linkId}`
      : `/shares/folders/links/${linkId}`;

  const response = await api.delete(
    endpoint
  );

  return response.data;
}

export function useRevokeShareLink() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: revokeShareLink,

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
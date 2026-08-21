import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { api } from "@/lib/api";

async function revokeShare({
  type,
  shareId,
}) {
  const endpoint =
    type === "file"
      ? `/shares/files/shares/${shareId}`
      : `/shares/folders/shares/${shareId}`;

  const response =
    await api.delete(endpoint);

  return response.data;
}

export function useRevokeShare() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: revokeShare,

    onSuccess: async (
      _data,
      variables
    ) => {
      await queryClient.invalidateQueries({
        queryKey: [
          "share-access",
          variables.type,
          variables.itemId,
        ],
      });

      await queryClient.invalidateQueries({
        queryKey: ["shared-with-me"],
      });
    },
  });
}
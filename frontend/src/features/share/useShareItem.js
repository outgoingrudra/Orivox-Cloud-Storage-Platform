import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { api } from "@/lib/api";

async function shareItem({
  type,
  itemId,
  email,
  permission,
}) {
  const endpoint =
    type === "file"
      ? `/shares/files/${itemId}`
      : `/shares/folders/${itemId}`;

  const response =
    await api.post(endpoint, {
      email,
      permission,
    });

  return response.data;
}

export function useShareItem() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: shareItem,

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
    },
  });
}
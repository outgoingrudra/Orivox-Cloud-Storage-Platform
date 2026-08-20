import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { api } from "@/lib/api";

async function updateSharePermission({
  type,
  shareId,
  permission,
}) {
  const endpoint =
    type === "file"
      ? `/shares/files/shares/${shareId}`
      : `/shares/folders/shares/${shareId}`;

  const response = await api.patch(
    endpoint,
    {
      permission,
    }
  );

  return response.data;
}

export function useUpdateSharePermission() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: updateSharePermission,

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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

async function trashFolder(folderId) {
  const response = await api.patch(`/folders/${folderId}/trash`);
  return response.data.data;
}

export function useTrashFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: trashFolder,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["explorer"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["trash"],
        }),
      ]);
    },
  });
}
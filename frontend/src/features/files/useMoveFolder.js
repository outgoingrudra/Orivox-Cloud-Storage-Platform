import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

async function moveFolder({ folderId, parentId }) {
  const response = await api.patch(`/folders/${folderId}/move`, {
    parentId,
  });

  return response.data.data;
}

export function useMoveFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moveFolder,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["explorer"] }),
        queryClient.invalidateQueries({ queryKey: ["folder-details"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    },
  });
}
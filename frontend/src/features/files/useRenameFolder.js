import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

async function renameFolder({ folderId, name }) {
  const response = await api.patch(`/folders/${folderId}/rename`, { name });
  return response.data.data;
}

export function useRenameFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: renameFolder,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["explorer"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["folder-details"] }),
      ]);
    },
  });
}
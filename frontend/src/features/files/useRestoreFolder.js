import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

async function restoreFolder(folderId) {
  const response = await api.patch(`/folders/${folderId}/restore`);
  return response.data.data;
}

export function useRestoreFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restoreFolder,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["trash"] }),
        queryClient.invalidateQueries({ queryKey: ["explorer"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    },
  });
}
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

async function restoreFile(fileId) {
  const response = await api.patch(`/files/${fileId}/restore`);
  return response.data.data;
}

export function useRestoreFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restoreFile,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["trash"] }),
        queryClient.invalidateQueries({ queryKey: ["explorer"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    },
  });
}
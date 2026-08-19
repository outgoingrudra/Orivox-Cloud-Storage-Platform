import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

async function renameFile({ fileId, name }) {
  const response = await api.patch(`/files/${fileId}/rename`, { name });
  return response.data.data;
}

export function useRenameFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: renameFile,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["explorer"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    },
  });
}
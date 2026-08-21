import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

async function moveFile({ fileId, folderId }) {
  const response = await api.patch(`/files/${fileId}/move`, {
    folderId,
  });

  return response.data.data;
}

export function useMoveFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moveFile,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["explorer"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    },
  });
}
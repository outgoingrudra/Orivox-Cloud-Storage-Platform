import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

async function deleteFolderPermanently(folderId) {
  const response = await api.delete(`/folders/${folderId}`);
  return response.data;
}

export function useDeleteFolderPermanently() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFolderPermanently,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["trash"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    },
  });
}
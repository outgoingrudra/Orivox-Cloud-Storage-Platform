import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

async function deleteFilePermanently(fileId) {
  const response = await api.delete(`/files/${fileId}`);
  return response.data;
}

export function useDeleteFilePermanently() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFilePermanently,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["trash"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    },
  });
}
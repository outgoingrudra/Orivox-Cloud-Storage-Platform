import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

async function trashFile(fileId) {
  const response = await api.patch(`/files/${fileId}/trash`);
  return response.data.data;
}

export function useTrashFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: trashFile,

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
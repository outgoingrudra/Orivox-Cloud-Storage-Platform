import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

async function createFolder({ name, parentId }) {
  const response = await api.post("/folders", {
    name,
    parentId: parentId || null,
  });

  return response.data.data;
}

export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFolder,

    onSuccess: async () => {
      /*
        Refresh current explorer contents.
      */
      await queryClient.invalidateQueries({
        queryKey: ["explorer"],
      });

      /*
        Folder count on dashboard may change too.
      */
      await queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
}
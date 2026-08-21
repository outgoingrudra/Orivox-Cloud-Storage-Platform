import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

async function logoutOthers() {
  const response = await api.post(
    "/auth/logout-others"
  );

  return response.data;
}

export function useLogoutOthers() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: logoutOthers,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["sessions"],
      });
    },
  });
}
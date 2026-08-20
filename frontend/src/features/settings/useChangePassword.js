import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { api } from "@/lib/api";

async function changePassword({
  currentPassword,
  newPassword,
}) {
  const response = await api.patch(
    "/auth/change-password",
    {
      currentPassword,
      newPassword,
    }
  );

  return response.data;
}

export function useChangePassword() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: changePassword,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["sessions"],
      });
    },
  });
}
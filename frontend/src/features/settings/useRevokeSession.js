import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";

import { api } from "@/lib/api";
import { clearAccessToken } from "@/lib/token";
import { setUnauthenticated } from "@/store/authSlice";

async function revokeSession(sessionId) {
  const response = await api.delete(
    `/auth/sessions/${sessionId}`
  );

  return response.data;
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: revokeSession,

    onSuccess: async (
      _data,
      sessionId
    ) => {
      const sessionsData =
        queryClient.getQueryData([
          "sessions",
        ]);

      const session =
        sessionsData?.sessions?.find(
          (item) =>
            item.id === sessionId
        );

      /*
        If the user revoked the session
        they're currently using, clear the
        local access token immediately.
      */
      if (session?.current) {
        clearAccessToken();

        dispatch(
          setUnauthenticated()
        );

        queryClient.clear();

        return;
      }

      /*
        Revoking another device should keep
        the current device logged in.
      */
      await queryClient.invalidateQueries({
        queryKey: ["sessions"],
      });
    },
  });
}
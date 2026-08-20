import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { useDispatch } from "react-redux";

import { api } from "@/lib/api";
import { clearAccessToken } from "@/lib/token";
import { setUnauthenticated } from "@/store/authSlice";

async function logoutAll() {
  const response = await api.post(
    "/auth/logout-all"
  );

  return response.data;
}

export function useLogoutAll() {
  const queryClient =
    useQueryClient();

  const dispatch =
    useDispatch();

  return useMutation({
    mutationFn: logoutAll,

    onSuccess: () => {
      clearAccessToken();

      dispatch(
        setUnauthenticated()
      );

      queryClient.clear();
    },
  });
}
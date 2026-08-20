import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";

import { api } from "@/lib/api";
import { setAuthenticated } from "@/store/authSlice";

async function updateProfile({ name }) {
  const response = await api.patch(
    "/auth/me",
    {
      name,
    }
  );

  return response.data.data.user;
}

export function useUpdateProfile() {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: updateProfile,

    onSuccess: (user) => {
      dispatch(
        setAuthenticated(user)
      );
    },
  });
}
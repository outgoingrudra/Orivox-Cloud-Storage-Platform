import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { api } from "@/lib/api";

async function fetchKeys() {
  const response = await api.get("/developer/keys");
  return response.data.data.keys;
}

async function createKey(name) {
  const response = await api.post("/developer/keys", { name });
  return response.data.data;
}

async function revokeKey(keyId) {
  const response = await api.delete(`/developer/keys/${keyId}`);
  return response.data;
}

export function useDeveloperKeys() {
  return useQuery({
    queryKey: ["developer-keys"],
    queryFn: fetchKeys,
    staleTime: 30 * 1000,
  });
}

export function useCreateDeveloperKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createKey,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["developer-keys"],
      }),
  });
}

export function useRevokeDeveloperKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeKey,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["developer-keys"],
      }),
  });
}
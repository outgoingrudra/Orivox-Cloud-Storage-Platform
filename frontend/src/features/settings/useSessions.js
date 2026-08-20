import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

async function fetchSessions() {
  const response = await api.get(
    "/auth/sessions"
  );

  return response.data.data;
}

export function useSessions() {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: fetchSessions,
    staleTime: 15 * 1000,
  });
}
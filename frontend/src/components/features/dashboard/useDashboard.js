import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

async function fetchDashboard() {
  const response = await api.get("/dashboard");
  return response.data.data;
}

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    staleTime: 30 * 1000,
  });
}
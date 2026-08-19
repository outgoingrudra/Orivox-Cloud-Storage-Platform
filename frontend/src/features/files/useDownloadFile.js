import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

async function downloadFile(fileId) {
  const response = await api.get(
    `/files/${fileId}/download`
  );

  return response.data.data;
}

export function useDownloadFile() {
  return useMutation({
    mutationFn: downloadFile,
  });
}
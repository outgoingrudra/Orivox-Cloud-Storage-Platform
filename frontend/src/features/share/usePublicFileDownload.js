import { useMutation } from "@tanstack/react-query";

import { api } from "@/lib/api";

async function downloadPublicFile(token) {
  const response = await api.get(
    `/shares/public/file/${token}/download`
  );

  return response.data;
}

export function usePublicFileDownload() {
  return useMutation({
    mutationFn: downloadPublicFile,
  });
}
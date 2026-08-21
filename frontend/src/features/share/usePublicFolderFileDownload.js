import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

async function downloadPublicFolderFile({
  token,
  fileId,
}) {
  const response = await api.get(
    `/shares/public/folder/${token}/files/${fileId}/download`
  );

  return response.data;
}

export function usePublicFolderFileDownload() {
  return useMutation({
    mutationFn: downloadPublicFolderFile,
  });
}
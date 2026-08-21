import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

async function fetchPublicFolderContents({ token, folderId }) {
  const response = await api.get(
    `/shares/public/folder/${token}/contents`,
    {
      params: {
        folderId: folderId || undefined,
      },
    }
  );

  return response.data;
}

export function usePublicFolderContents({
  token,
  folderId = null,
}) {
  return useQuery({
    queryKey: [
      "public-folder-contents",
      token,
      folderId,
    ],
    queryFn: () =>
      fetchPublicFolderContents({
        token,
        folderId,
      }),
    enabled: Boolean(token),
    retry: false,
    staleTime: 20 * 1000,
  });
}
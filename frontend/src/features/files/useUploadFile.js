import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

async function uploadFile({
  file,
  folderId,
  onProgress,
}) {
  let reservationId = null;

  try {
    // ==================== 1. INITIATE ====================

    const initiateResponse = await api.post(
      "/files/upload/initiate",
      {
        fileName: file.name,
        mimeType:
          file.type ||
          "application/octet-stream",
        size: file.size,
        folderId: folderId || null,
      }
    );

    const {
      reservationId: createdReservationId,
      uploadUrl,
    } = initiateResponse.data.data;

    reservationId =
      createdReservationId;

    // ==================== 2. DIRECT STORAGE UPLOAD ====================

    await axios.put(
      uploadUrl,
      file,
      {
        headers: {
          "Content-Type":
            file.type ||
            "application/octet-stream",
        },

        onUploadProgress: (
          progressEvent
        ) => {
          if (
            !progressEvent.total ||
            !onProgress
          ) {
            return;
          }

          const percentage =
            Math.round(
              (progressEvent.loaded *
                100) /
                progressEvent.total
            );

          onProgress(percentage);
        },
      }
    );

    // ==================== 3. CONFIRM ====================

    const confirmResponse =
      await api.post(
        "/files/upload/confirm",
        {
          reservationId,
        }
      );

    return confirmResponse.data.data;
  } catch (error) {
    /*
      If reservation exists but upload/confirm
      fails, explicitly cancel it.

      Backend releases reserved quota and
      schedules any possible orphan object
      for cleanup.
    */
    if (reservationId) {
      try {
        await api.delete(
          `/files/upload/${reservationId}`
        );
      } catch (cancelError) {
        console.error(
          "Unable to cancel failed upload:",
          cancelError
        );
      }
    }

    throw error;
  }
}

export function useUploadFile() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: uploadFile,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["explorer"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        }),
      ]);
    },
  });
}
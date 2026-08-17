import {
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

import prisma from "../config/prisma.js";

import {
  getChannel,
} from "../config/rabbitmq.js";

import {
  storageClient,
  STORAGE_BUCKET,
} from "../config/storage.js";

const QUEUE = "storage.deletion";

const MAX_ATTEMPTS = 5;

export async function startStorageDeletionWorker() {
  const channel = getChannel();

  await channel.prefetch(5);

  await channel.consume(
    QUEUE,
    async (msg) => {
      if (!msg) {
        return;
      }

      let jobId;

      try {
        const payload = JSON.parse(
          msg.content.toString()
        );

        jobId = payload.jobId;

        const job =
          await prisma.storageDeletionJob.findUnique({
            where: {
              id: jobId,
            },
          });

        // Job already gone
        if (!job) {
          channel.ack(msg);
          return;
        }

        // Already completed
        if (
          job.status === "COMPLETED"
        ) {
          channel.ack(msg);
          return;
        }

        // Already permanently failed
        if (
          job.status === "FAILED"
        ) {
          channel.ack(msg);
          return;
        }

        // Retry limit reached
        if (
          job.attempts >= MAX_ATTEMPTS
        ) {
          await prisma.storageDeletionJob.update({
            where: {
              id: job.id,
            },

            data: {
              status: "FAILED",
              lastError:
                job.lastError ||
                "Maximum deletion attempts reached",
            },
          });

          channel.ack(msg);
          return;
        }

        // ==================== ATOMIC CLAIM ====================

        /*
          Only one worker should be able to move:

          PENDING → PROCESSING

          If another worker already claimed this job,
          updateMany returns count = 0.
        */
        const claimed =
          await prisma.storageDeletionJob.updateMany({
            where: {
              id: job.id,
              status: "PENDING",
            },

            data: {
              status: "PROCESSING",

              attempts: {
                increment: 1,
              },
            },
          });

        if (claimed.count !== 1) {
          /*
            Another worker already owns this job,
            or recovery/process state changed it.

            Acknowledge this duplicate message.
          */
          channel.ack(msg);
          return;
        }

        // ==================== DELETE FROM B2 ====================

        await storageClient.send(
          new DeleteObjectCommand({
            Bucket:
              STORAGE_BUCKET,

            Key:
              job.objectKey,
          })
        );

        // ==================== MARK COMPLETED ====================

        await prisma.storageDeletionJob.update({
          where: {
            id: job.id,
          },

          data: {
            status: "COMPLETED",

            completedAt:
              new Date(),

            lastError:
              null,
          },
        });

        channel.ack(msg);
      } catch (error) {
        console.error(
          "Storage deletion worker error:",
          error
        );

        if (jobId) {
          try {
            /*
              Put job back into PENDING so it
              can be retried by RabbitMQ or
              recovered by our scheduled job.
            */
            await prisma.storageDeletionJob.updateMany({
              where: {
                id: jobId,
                status: "PROCESSING",
              },

              data: {
                status: "PENDING",

                lastError:
                  error.message ||
                  "Storage deletion failed",
              },
            });
          } catch (dbError) {
            console.error(
              "Failed updating deletion job:",
              dbError
            );
          }
        }

        /*
          Requeue message.

          Since the DB job was reset to PENDING,
          this message can be claimed again.
        */
        channel.nack(
          msg,
          false,
          true
        );
      }
    }
  );

  
}
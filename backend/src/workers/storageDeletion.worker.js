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

        // Already processed
        if (
          job.status === "COMPLETED"
        ) {
          channel.ack(msg);
          return;
        }

        if (
          job.attempts >=
          MAX_ATTEMPTS
        ) {
          await prisma.storageDeletionJob.update({
            where: {
              id: job.id,
            },

            data: {
              status: "FAILED",
            },
          });

          channel.ack(msg);

          return;
        }

        // Mark processing
        await prisma.storageDeletionJob.update({
          where: {
            id: job.id,
          },

          data: {
            status: "PROCESSING",

            attempts: {
              increment: 1,
            },
          },
        });

        // Delete actual object from B2
        await storageClient.send(
          new DeleteObjectCommand({
            Bucket:
              STORAGE_BUCKET,

            Key:
              job.objectKey,
          })
        );

        // Mark success
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
            await prisma.storageDeletionJob.update({
              where: {
                id: jobId,
              },

              data: {
                status: "PENDING",

                lastError:
                  error.message,
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
          Requeue so RabbitMQ can retry.

          Later we'll improve this with
          retry delay / DLQ instead of
          immediate retry loops.
        */
        channel.nack(
          msg,
          false,
          true
        );
      }
    }
  );

  console.log(
    "Storage deletion worker started ✅"
  );
}
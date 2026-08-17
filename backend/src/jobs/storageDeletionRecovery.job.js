import "dotenv/config";

import prisma from "../config/prisma.js";

import {
  connectRabbitMQ,
  closeRabbitMQ,
} from "../config/rabbitmq.js";

import {
  publishStorageDeletion,
} from "../modules/file/file.publisher.js";

const BATCH_SIZE = 100;

const STUCK_PROCESSING_MINUTES = 10;

async function runStorageDeletionRecoveryJob() {
  try {
    await prisma.$connect();

    await connectRabbitMQ();

    console.log(
      "Storage deletion recovery job started"
    );

    const staleBefore = new Date(
      Date.now() -
        STUCK_PROCESSING_MINUTES *
          60 *
          1000
    );

    const jobs =
      await prisma.storageDeletionJob.findMany({
        where: {
          OR: [
            {
              status: "PENDING",
            },

            {
              status: "PROCESSING",

              updatedAt: {
                lt: staleBefore,
              },
            },
          ],
        },

        orderBy: {
          createdAt: "asc",
        },

        take: BATCH_SIZE,

        select: {
          id: true,
          status: true,
        },
      });

    let republished = 0;

    for (const job of jobs) {
      try {
        // ==================== RECOVER STUCK JOB ====================

        if (job.status === "PROCESSING") {
          const recovered =
            await prisma.storageDeletionJob.updateMany({
              where: {
                id: job.id,

                status: "PROCESSING",

                updatedAt: {
                  lt: staleBefore,
                },
              },

              data: {
                status: "PENDING",

                lastError:
                  "Recovered from stale PROCESSING state",
              },
            });

          /*
            Another process may already have
            recovered/completed this job.
          */
          if (recovered.count !== 1) {
            continue;
          }
        }

        // ==================== REPUBLISH ====================

        publishStorageDeletion(
          job.id
        );

        republished++;
      } catch (error) {
        console.error(
          `Failed to republish deletion job ${job.id}:`,
          error
        );
      }
    }

    console.log(
      `Storage deletion recovery completed: ${republished} job(s) republished ✅`
    );

    await closeRabbitMQ();
    await prisma.$disconnect();

    process.exit(0);
  } catch (error) {
    console.error(
      "Storage deletion recovery job failed:",
      error
    );

    try {
      await closeRabbitMQ();
    } catch {}

    try {
      await prisma.$disconnect();
    } catch {}

    process.exit(1);
  }
}

runStorageDeletionRecoveryJob();
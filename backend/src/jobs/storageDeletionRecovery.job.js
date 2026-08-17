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

async function runStorageDeletionRecoveryJob() {
  try {
    await prisma.$connect();

    await connectRabbitMQ();

    console.log(
      "Storage deletion recovery job started"
    );

    const jobs =
      await prisma.storageDeletionJob.findMany({
        where: {
          status: "PENDING",
        },

        orderBy: {
          createdAt: "asc",
        },

        take: BATCH_SIZE,

        select: {
          id: true,
        },
      });

    let republished = 0;

    for (const job of jobs) {
      try {
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

    await prisma.$disconnect();

    process.exit(1);
  }
}

runStorageDeletionRecoveryJob();
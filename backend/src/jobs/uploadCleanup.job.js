import "dotenv/config";

import prisma from "../config/prisma.js";

import {
  cleanupAllExpiredReservations,
} from "../modules/file/file.service.js";

async function runUploadCleanupJob() {
  try {
    await prisma.$connect();

    console.log(
      "Upload cleanup job started"
    );

    const cleaned =
      await cleanupAllExpiredReservations();

    console.log(
      `Upload cleanup completed: ${cleaned} reservation(s) cleaned ✅`
    );

    await prisma.$disconnect();

    process.exit(0);
  } catch (error) {
    console.error(
      "Upload cleanup job failed:",
      error
    );

    await prisma.$disconnect();

    process.exit(1);
  }
}

runUploadCleanupJob();
import "dotenv/config";

import app from "./app.js";
import prisma from "./config/prisma.js";

import {
  connectRabbitMQ,
  closeRabbitMQ,
} from "./config/rabbitmq.js";

import { startEmailWorker } from "./workers/email.worker.js";
import {
  startStorageDeletionWorker,
} from "./workers/storageDeletion.worker.js";
const PORT = process.env.PORT || 5000;

let server;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("PostgreSQL connected successfully ✅");

    await connectRabbitMQ();
    await startEmailWorker();
    await startStorageDeletionWorker();

    server = app.listen(PORT, () => {
      console.log(`Orivox API running on port ${PORT} 🚀`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);

    try {
      await closeRabbitMQ();
    } catch {}

    await prisma.$disconnect();

    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down...`);

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    }

    await closeRabbitMQ();
    await prisma.$disconnect();

    console.log("Shutdown complete ✅");

    process.exit(0);
  } catch (error) {
    console.error("Shutdown error:", error);

    process.exit(1);
  }
}

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  shutdown("SIGINT");
});

startServer();
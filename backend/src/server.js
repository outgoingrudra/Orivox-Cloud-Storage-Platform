import "dotenv/config";

import app from "./app.js";
import prisma from "./config/prisma.js";

import {
  connectRabbitMQ,
  closeRabbitMQ,
} from "./config/rabbitmq.js";

import { startEmailWorker } from "./workers/email.worker.js";

const PORT = process.env.PORT || 5000;

let server;

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("PostgreSQL connected successfully ✅");

    await connectRabbitMQ();
    await startEmailWorker();

    server = app.listen(PORT, () => {
      console.log(`Orivox API running on port ${PORT} 🚀`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);

    await prisma.$disconnect();

    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down...`);

  if (server) {
    server.close(async () => {
      try {
        await closeRabbitMQ();
        await prisma.$disconnect();

        console.log("Shutdown complete ✅");

        process.exit(0);
      } catch (error) {
        console.error("Shutdown error:", error);
        process.exit(1);
      }
    });
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

startServer();
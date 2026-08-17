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

function getCurrentTime() {
  return new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "medium",
  });
}

async function startServer() {
  const startTime = Date.now();

  console.log(`
╔══════════════════════════════════════════════╗
║                                              ║
║              ☁️  O R I V O X                 ║
║          Cloud Storage Platform              ║
║                                              ║
╚══════════════════════════════════════════════╝

🚀 Starting Orivox...
🕒 ${getCurrentTime()}
`);

  try {
    await prisma.$connect();
    console.log("  ✅ PostgreSQL        Connected");

    await connectRabbitMQ();
    console.log("  ✅ RabbitMQ          Connected");

    await startEmailWorker();
    console.log("  ✅ Email Worker      Running");

    await startStorageDeletionWorker();
    console.log("  ✅ Deletion Worker   Running");

    server = app.listen(PORT, () => {
      const startupTime = Date.now() - startTime;

      console.log(`
────────────────────────────────────────────────

  🌐 API Server        http://localhost:${PORT}
  🟢 Environment       ${process.env.NODE_ENV || "development"}
  ⚡ Startup Time      ${startupTime} ms
  🕒 Started At        ${getCurrentTime()}

────────────────────────────────────────────────

  ✨ Orivox is ready to accept requests.

`);
    });
  } catch (error) {
    console.error(`
❌ ORIVOX STARTUP FAILED

🕒 ${getCurrentTime()}

`, error);

    try {
      await closeRabbitMQ();
    } catch {}

    await prisma.$disconnect();

    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`
────────────────────────────────────────────────

🛑 ${signal} received
🕒 ${getCurrentTime()}

Gracefully shutting down Orivox...

────────────────────────────────────────────────
`);

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

      console.log("  ✅ HTTP Server       Closed");
    }

    await closeRabbitMQ();
    console.log("  ✅ RabbitMQ          Disconnected");

    await prisma.$disconnect();
    console.log("  ✅ PostgreSQL        Disconnected");

    console.log(`
────────────────────────────────────────────────

  👋 Orivox shutdown completed successfully.
  🕒 ${getCurrentTime()}

────────────────────────────────────────────────
`);

    process.exit(0);
  } catch (error) {
    console.error(
      "\n❌ Error during graceful shutdown:",
      error
    );

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
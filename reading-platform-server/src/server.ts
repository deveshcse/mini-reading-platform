import type { Server } from "node:http";
import app from "./app.js";
import { prisma } from "./config/db.config.js";
import { ENV } from "./config/env.config.js";
import { logger } from "./config/logger.config.js";

const PORT = ENV.PORT;

/**
 * Local URL reachable within this process (before any proxy/TLS).
 * Derived from the actual bound socket — never hardcoded.
 */
function listeningDisplayOrigin(server: Server): string {
  const a = server.address();
  if (!a || typeof a === "string") return `http://127.0.0.1:${PORT}`;
  const { address, port } = a;
  if (address === "0.0.0.0" || address === "::") return `http://localhost:${port}`;
  if (address.includes(":") && !address.startsWith("[")) return `http://[${address}]:${port}`;
  return `http://${address}:${port}`;
}

/**
 * Public URL as seen by clients — works on Render without any env config.
 *
 * Render injects:
 *   RENDER_EXTERNAL_URL  → e.g. https://my-service.onrender.com  (web services)
 *   RENDER_EXTERNAL_HOSTNAME → e.g. my-service.onrender.com      (all service types)
 *
 * Falls back to the local socket origin so local dev still works.
 */
function publicOrigin(localOrigin: string): string {
  if (process.env.RENDER_EXTERNAL_URL) return process.env.RENDER_EXTERNAL_URL.replace(/\/$/, "");
  if (process.env.RENDER_EXTERNAL_HOSTNAME) return `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`;
  return localOrigin; // local dev fallback
}

const server = app.listen(PORT, () => {
  const local = listeningDisplayOrigin(server);
  const pub = publicOrigin(local);

  logger.info(`Server listening (${ENV.NODE_ENV})`);
  logger.info(`Local process URL : ${local}`);

  if (pub !== local) {
    logger.info(`Public URL (Render): ${pub}`);
    logger.info(`API docs            : ${pub}/docs`);
  } else {
    logger.info(`API docs: ${local}/docs`);
  }
});

function shutdown(signal: string) {
  logger.info({ signal }, "Shutdown signal received");
  server.close(async () => {
    try {
      await prisma.$disconnect();
      logger.info("Server closed gracefully.");
      process.exit(0);
    } catch (err) {
      logger.error(err as Error, "Error during shutdown");
      process.exit(1);
    }
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
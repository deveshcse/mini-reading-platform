import app from "./app.js";
import { prisma } from "./config/db.config.js";
import { ENV } from "./config/env.config.js";
import { logger } from "./config/logger.config.js";

const PORT = ENV.PORT;

function apiPublicOrigin(): string | null {
  const fromEnv = ENV.API_PUBLIC_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (ENV.NODE_ENV !== "production") {
    return `http://localhost:${PORT}`;
  }
  return null;
}

const server = app.listen(PORT, () => {
  const origin = apiPublicOrigin();
  logger.info(`Server listening on port ${PORT} (${ENV.NODE_ENV})`);
  if (origin) {
    logger.info(`API base URL: ${origin}`);
    logger.info(`API docs: ${origin}/docs`);
  } else {
    logger.warn(
      "API_PUBLIC_URL is not set — cannot log the public API URL. Docs are at /docs"
    );
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

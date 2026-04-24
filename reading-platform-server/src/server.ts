import app from "./app.js";
import { ENV } from "./config/env.config.js";
import { logger } from "./config/logger.config.js";

const PORT = ENV.PORT;

const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT} in ${ENV.NODE_ENV} mode`);
  logger.info(`API Docs available at http://localhost:${PORT}/docs`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  server.close(() => {
    logger.info("Server closed gracefully.");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  server.close(() => {
    logger.info("Server closed gracefully.");
    process.exit(0);
  });
});

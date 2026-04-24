import pino from "pino";
import { ENV } from "./env.config.js";

export const logger = pino({
  level: ENV.NODE_ENV === "production" ? "info" : "debug",
  transport:
    ENV.NODE_ENV !== "production"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        }
      : undefined,
});

import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import swaggerUi from "swagger-ui-express";
import cookieParser from "cookie-parser";

import { logger } from "./config/logger.config.js";
import { swaggerSpec } from "./config/swagger.config.js";
import { errorHandler } from "./middleware/error.middleware.js";

// Routes
import authRoutes from "./modules/auth/auth.route.js";
import storyRoutes from "./modules/story/story.route.js";
import likeRoutes from "./modules/like/like.route.js";
import paymentRoutes from "./modules/payment/payment.route.js";
import planRoutes from "./modules/plan/plan.route.js";



const app = express();

// ── Global Middleware ─────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Swagger Documentation ─────────────────────────────────────────────────────
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── API Routes ────────────────────────────────────────────────────────────────
const apiRouter = express.Router();
apiRouter.use("/auth", authRoutes);
apiRouter.use("/stories", storyRoutes);
apiRouter.use("/stories", likeRoutes);
apiRouter.use("/payments", paymentRoutes);
apiRouter.use("/plans", planRoutes);



app.use("/api/v1", apiRouter);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ── Error Handler (must be last) ──────────────────────────────────────────────
app.use(errorHandler);

export default app;

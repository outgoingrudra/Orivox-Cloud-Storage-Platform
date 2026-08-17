import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import shareRoutes from "./modules/share/share.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import fileRoutes from "./modules/file/file.routes.js";
import { globalLimiter } from "./middlewares/rateLimit.middleware.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import { notFound, errorHandler } from "./middlewares/error.middleware.js";
import folderRoutes from "./modules/folder/folder.routes.js";
import trashRoutes from "./modules/trash/trash.routes.js";
import searchRoutes from "./modules/search/search.routes.js";
const app = express();


if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}
// ==================== SECURITY ====================

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

// ==================== REQUEST PARSING ====================

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// ==================== LOGGING ====================

app.use(morgan("dev"));

// ==================== HEALTH CHECK ====================

app.get("/api/v1/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Orivox API is running",
  });
});

// ==================== GLOBAL RATE LIMIT ====================
app.use("/api/v1", globalLimiter);
// ==================== ROUTES ====================
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/folders", folderRoutes);
app.use("/api/v1/files", fileRoutes);
app.use("/api/v1/trash",trashRoutes);
app.use("/api/v1/dashboard",dashboardRoutes);
app.use("/api/v1/shares",shareRoutes);
app.use( "/api/v1/search",searchRoutes);
// ==================== 404 HANDLER ====================
app.use(notFound);
// ==================== GLOBAL ERROR HANDLER ====================
app.use(errorHandler);

export default app;

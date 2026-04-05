import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" }); 
import fs from "fs";
import http from "http";
import https from "https";
import helmet from "helmet";

import connectDB from "./mongo.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import limiter from "./middleware/rateLimiter.js";
import logger from "./utils/logger.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4050;
const DEPLOY_ENV = process.env.DEPLOY_ENV || "local";

// ----------------------
// Security Middleware
// ----------------------
app.use(helmet());

// ----------------------
// Rate Limiter
// ----------------------
// app.use(limiter);

// ----------------------
// Body Parsers
// ----------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ----------------------
// CORS
// ----------------------
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ----------------------
// Static Files (🔥 ADD THIS HERE)
// ----------------------
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static("uploads")
);

// ----------------------
// Database Connection
// ----------------------
connectDB();

// ----------------------
// Health Check
// ----------------------
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "B2B Catalog Backend",
    time: new Date().toISOString(),
  });
});

// ----------------------
// API Routes
// ----------------------
app.use("/api/v1", routes);

// ----------------------
// 404 Handler
// ----------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    msg: "Route not found",
  });
});

// ----------------------
// Global Error Handler
// ----------------------
app.use(errorHandler);

// ----------------------
// Server Start
// ----------------------
const startServer = () => {
  if (DEPLOY_ENV === "local") {
    // Local → HTTP
    http.createServer(app).listen(PORT, () => {
      logger.info(`🚀 Local HTTP Server running on port ${PORT}`);
    });
  } else if (DEPLOY_ENV === "prod") {
    // Production → HTTPS (SSL required)
    try {
      const sslOptions = {
        key: fs.readFileSync(process.env.SSL_KEY_PATH),
        cert: fs.readFileSync(process.env.SSL_CERT_PATH),
      };

      https.createServer(sslOptions, app).listen(PORT, () => {
        logger.info(`🔐 Production HTTPS Server running on port ${PORT}`);
      });
    } catch (error) {
      logger.error("❌ Failed to start HTTPS server:", error);
      process.exit(1);
    }
  } else {
    // Fallback
    http.createServer(app).listen(PORT, () => {
      logger.warn(
        `⚠️ Unknown DEPLOY_ENV. Defaulting to HTTP on port ${PORT}`
      );
    });
  }
};

startServer();

export default app;

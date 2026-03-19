import express from "express";
import cors from "cors";
import dotenv from "dotenv";
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

// ----------------------
// Security Middleware
// ----------------------
app.use(helmet());

// ----------------------
// Rate Limiter
// ----------------------
app.use(limiter);

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
const sslKeyPath = process.env.SSL_KEY_PATH;
const sslCertPath = process.env.SSL_CERT_PATH;

const startServer = () => {
  if (sslKeyPath && sslCertPath) {
    const sslOptions = {
      key: fs.readFileSync(sslKeyPath),
      cert: fs.readFileSync(sslCertPath),
    };

    https.createServer(sslOptions, app).listen(PORT, () => {
      logger.info(`🔐 HTTPS Server running on port ${PORT}`);
    });
  } else {
    http.createServer(app).listen(PORT, () => {
      logger.info(`🚀 HTTP Server running on port ${PORT}`);
    });
  }
};

startServer();

export default app;

import dotenv from "dotenv";
dotenv.config();

import chalk from "chalk";
import express from "express";
import cors from "cors";

const app = express();

// Middleware - MUST be before routes
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:8080",
      "https://motobook-site.up.railway.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Request logging middleware
app.use((req, res, next) => {
  console.log(
    chalk.cyan(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  );
  next();
});

// Health check endpoint - Define BEFORE importing routes
app.get("/health", (req, res) => {
  console.log(chalk.green("Health check accessed"));
  res.status(200).json({
    status: "ok",
    service: "admin-service",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Root endpoint - Define BEFORE importing routes
app.get("/", (req, res) => {
  console.log(chalk.green("Root endpoint accessed"));
  res.status(200).json({
    message: "Admin Service API is running",
    version: "1.0.0",
    endpoints: {
      health: "GET /health",
      adminLogin: "POST /admin/login",
      getAdmins: "GET /admin/login",
    },
    status: "active",
  });
});

// Import routes AFTER defining basic routes
import adminRoutes from "./routes/adminRoutes.js";
app.use("/admin", adminRoutes);

// 404 handler - catches any undefined routes
app.use((req, res) => {
  console.log(chalk.yellow(`404 - Route not found: ${req.method} ${req.url}`));
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.url}`,
    availableEndpoints: {
      health: "GET /health",
      root: "GET /",
      admin: "GET/POST /admin/login",
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(chalk.red("Error occurred:"), err);
  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

const PORT = process.env.PORT || process.env.ADMIN_PORT || 3001;

// Start server
const server = app.listen(PORT, async () => {
  console.log(chalk.green("\n===================================="));
  console.log(chalk.green(`🚀 Server running on port ${PORT}`));
  console.log(chalk.green("====================================\n"));

  // Initialize database connection (non-blocking)
  try {
    const { checkConnections } = await import("./config/db.js");
    const createAllTable = (await import("./utils/dbUtils.js")).default;

    console.log(chalk.yellow("Initializing database connection..."));
    await checkConnections();
    console.log(chalk.green("✓ Database connected successfully\n"));

    console.log(chalk.yellow("Creating database tables..."));
    await createAllTable();
    console.log(chalk.green("✓ Database tables ready\n"));

    console.log(chalk.green("===================================="));
    console.log(chalk.green("✅ Admin Service is fully ready!"));
    console.log(chalk.green("====================================\n"));
  } catch (error) {
    console.log(chalk.red("\n===================================="));
    console.log(chalk.red("⚠️  Database initialization failed"));
    console.log(chalk.red("===================================="));
    console.log(
      chalk.yellow("Server is running but database operations may fail.")
    );
    console.error(chalk.red("\nError details:"), error.message);
    console.log(chalk.yellow("\nPlease check:"));
    console.log(chalk.yellow("  1. Database environment variables"));
    console.log(chalk.yellow("  2. Database service is running"));
    console.log(chalk.yellow("  3. Network connectivity\n"));
  }
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log(
    chalk.yellow("\n📛 SIGTERM signal received: closing HTTP server")
  );
  server.close(() => {
    console.log(chalk.green("✓ HTTP server closed"));
  });
});

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  console.error(chalk.red("❌ Uncaught Exception:"), error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error(chalk.red("❌ Unhandled Rejection at:"), promise);
  console.error(chalk.red("Reason:"), reason);
});

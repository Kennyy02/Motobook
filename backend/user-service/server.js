import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import chalk from "chalk";
import path from "path";
import { fileURLToPath } from "url";

// Recreate __dirname for ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();

// Middleware - MUST be before routes
app.use(express.json());
app.use(cors());

// Request logging middleware
app.use((req, res, next) => {
  console.log(
    chalk.cyan(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  );
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  console.log(chalk.green("Health check accessed"));
  res.status(200).json({
    status: "ok",
    service: "user-service",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Root endpoint
app.get("/", (req, res) => {
  console.log(chalk.green("Root endpoint accessed"));
  res.status(200).json({
    message: "User Service API is running",
    version: "1.0.0",
    endpoints: {
      health: "GET /health",
      register: "POST /api/auth/register",
      login: "POST /api/auth/login",
      users: "GET /api/auth/users",
    },
    status: "active",
  });
});

// Import routes AFTER defining basic routes
import authRoutes from "./src/routes/authRoutes.js";
app.use("/api/auth", authRoutes);

// 404 handler - catches any undefined routes
app.use((req, res) => {
  console.log(chalk.yellow(`404 - Route not found: ${req.method} ${req.url}`));
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.url}`,
    availableEndpoints: {
      health: "GET /health",
      root: "GET /",
      auth: "POST /api/auth/*",
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

const PORT = process.env.PORT || process.env.USER_PORT || 3002;

// Start server
const server = app.listen(PORT, async () => {
  console.log(chalk.green("\n===================================="));
  console.log(chalk.green(`🚀 User Service running on port ${PORT}`));
  console.log(chalk.green("====================================\n"));

  // Initialize database connection (non-blocking)
  try {
    const { checkConnections } = await import("./src/config/db.js");
    const createAllTable = (await import("./src/utils/userDbUtils.js")).default;

    console.log(chalk.yellow("Initializing database connection..."));
    await checkConnections();
    console.log(chalk.green("✓ Database connected successfully\n"));

    console.log(chalk.yellow("Creating database tables..."));
    await createAllTable();
    console.log(chalk.green("✓ Database tables ready\n"));

    console.log(chalk.green("===================================="));
    console.log(chalk.green("✅ User Service is fully ready!"));
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

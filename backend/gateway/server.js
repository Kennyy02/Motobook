import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createProxyMiddleware } from "http-proxy-middleware";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "MotoBook API Gateway",
    status: "running",
    version: "1.0.0",
    services: {
      admin: "/admin",
      business: "/api/business",
      user: "/api/user",
      order: "/api/order",
    },
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Proxy configuration with error handling
const proxyOptions = (target, serviceName) => ({
  target,
  changeOrigin: true,
  onError: (err, req, res) => {
    console.error(`${serviceName} error:`, err.message);
    res.status(503).json({
      error: `${serviceName} is currently unavailable`,
      message: "Please try again later",
    });
  },
  onProxyReq: (proxyReq, req) => {
    console.log(`[${serviceName}] ${req.method} ${req.path}`);
  },
});

// Route to Admin Service
app.use(
  "/admin",
  createProxyMiddleware(
    proxyOptions(
      process.env.ADMIN_SERVICE_URL || "http://localhost:3001",
      "Admin Service"
    )
  )
);

// Route to Business Service
app.use(
  "/api/business",
  createProxyMiddleware(
    proxyOptions(
      process.env.BUSINESS_SERVICE_URL || "http://localhost:3003",
      "Business Service"
    )
  )
);

// Route to User Service
app.use(
  "/api/user",
  createProxyMiddleware(
    proxyOptions(
      process.env.USER_SERVICE_URL || "http://localhost:3002",
      "User Service"
    )
  )
);

// Route to Order Service
app.use(
  "/api/order",
  createProxyMiddleware(
    proxyOptions(
      process.env.ORDER_SERVICE_URL || "http://localhost:3004",
      "Order Service"
    )
  )
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.path} does not exist`,
    availableRoutes: ["/admin", "/api/business", "/api/user", "/api/order"],
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Gateway error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: "Something went wrong",
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 MotoBook Gateway running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Services:`);
  console.log(
    `   - Admin: ${process.env.ADMIN_SERVICE_URL || "http://localhost:3001"}`
  );
  console.log(
    `   - Business: ${
      process.env.BUSINESS_SERVICE_URL || "http://localhost:3003"
    }`
  );
  console.log(
    `   - User: ${process.env.USER_SERVICE_URL || "http://localhost:3002"}`
  );
  console.log(
    `   - Order: ${process.env.ORDER_SERVICE_URL || "http://localhost:3004"}`
  );
});

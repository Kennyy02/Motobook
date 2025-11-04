// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import chalk from "chalk";
// import { createProxyMiddleware } from "http-proxy-middleware";

// dotenv.config();

// const app = express();

// app.use(cors());
// app.use(express.json());

// const PORT = process.env.GATEWAY_PORT || 3000;

// // Proxy /admin to Admin-Service (port 3001)
// app.use(
//   "/admin",
//   createProxyMiddleware({
//     target: `http://localhost:${process.env.ADMIN_PORT || 3001}`,
//     changeOrigin: true,
//     pathRewrite: {
//       "^/admin": "", // remove /admin prefix when forwarding
//     },
//   })
// );

// // Proxy /api/auth to User-Service (port 3002)
// app.use(
//   "/api/auth",
//   createProxyMiddleware({
//     target: `http://localhost:${process.env.USER_PORT || 3002}`,
//     changeOrigin: true,
//     pathRewrite: {
//       "^/api/auth": "/api/auth", // keep path intact (optional)
//     },
//   })
// );

// // Proxy /api/business to Business-Service (port 3003)
// app.use(
//   "/api/business",
//   createProxyMiddleware({
//     target: `http://localhost:${process.env.BUSINESS_PORT || 3003}`,
//     changeOrigin: true,
//     pathRewrite: {
//       "^/api/business": "/api/business",
//     },
//   })
// );

// // Proxy /api/orders to Order-Service (port 3004)
// app.use(
//   "/api/orders",
//   createProxyMiddleware({
//     target: `http://localhost:${process.env.ORDER_PORT || 3004}`,
//     changeOrigin: true,
//     pathRewrite: {
//       "^/api/orders": "/api/orders",
//     },
//   })
// );

// Serve your frontend static files if needed (optional)
// app.use(express.static("path_to_frontend_build_folder"));

// app.listen(PORT, () => {
//   console.log(chalk.green(`API Gateway running on port ${PORT}`));
// });

import { spawn } from "child_process";

const services = [
  "admin-service",
  "business-service",
  "order-service",
  "user-service",
];

services.forEach((service) => {
  const child = spawn("node", [`${service}/server.js`], {
    stdio: "inherit",
    shell: true,
  });

  child.on("error", (err) => {
    console.error(`Failed to start ${service}:`, err);
  });

  child.on("exit", (code, signal) => {
    if (code !== null) {
      console.log(`${service} exited with code ${code}`);
    } else if (signal) {
      console.log(`${service} was killed with signal ${signal}`);
    }
  });
});

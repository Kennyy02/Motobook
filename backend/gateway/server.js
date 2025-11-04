import express from "express";
import { spawn } from "child_process";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const PORT = process.env.PORT || 3000; // cPanel assigns PORT automatically

// Start microservices on internal ports
const services = [
  { name: "admin-service", port: 4001 },
  { name: "business-service", port: 4002 },
  { name: "order-service", port: 4003 },
  { name: "user-service", port: 4004 },
];

services.forEach(({ name, port }) => {
  const child = spawn("node", [`${name}/server.js`], {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, PORT: port }, // assign unique port to each service
  });

  child.on("error", (err) => {
    console.error(`Failed to start ${name}:`, err);
  });

  child.on("exit", (code, signal) => {
    if (code !== null) {
      console.log(`${name} exited with code ${code}`);
    } else if (signal) {
      console.log(`${name} was killed with signal ${signal}`);
    }
  });
});

// Proxy routes to services
app.use(
  "/api/admin",
  createProxyMiddleware({ target: "http://127.0.0.1:4001", changeOrigin: true })
);

app.use(
  "/api/business",
  createProxyMiddleware({ target: "http://127.0.0.1:4002", changeOrigin: true })
);

app.use(
  "/api/order",
  createProxyMiddleware({ target: "http://127.0.0.1:4003", changeOrigin: true })
);

app.use(
  "/api/user",
  createProxyMiddleware({ target: "http://127.0.0.1:4004", changeOrigin: true })
);

app.listen(PORT, () => {
  console.log(`Gateway running on port ${PORT}`);
});

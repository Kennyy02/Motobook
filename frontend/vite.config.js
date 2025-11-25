import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/",
  plugins: [react()],
  server: {
    host: "0.0.0.0", // Listen on all network interfaces
    port: 5173,
    strictPort: false,
  },
  preview: {
    host: "0.0.0.0", // Listen on all network interfaces
    port: 4173,
    strictPort: false,
    allowedHosts: [
      "motobook.up.railway.app",
      "motobook-site.up.railway.app",
      ".railway.app", // Allow all Railway subdomains
    ],
  },
});

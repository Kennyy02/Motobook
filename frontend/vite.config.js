import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/",
  preview: {
    allowedHosts: ["motobook.up.railway.app"],
  },
  plugins: [react()],
});

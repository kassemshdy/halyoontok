import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api/admin": {
        target: process.env.ADMIN_API_URL || "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/admin/, "/api"),
      },
      "/api/upload": {
        target: process.env.UPLOAD_API_URL || "http://localhost:8082",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/upload/, "/api"),
      },
      "/api/auth": {
        target: process.env.FRONT_API_URL || "http://localhost:8081",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
  },
});

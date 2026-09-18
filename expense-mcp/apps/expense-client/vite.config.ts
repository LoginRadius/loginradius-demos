import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The client talks to the expenses server directly over its absolute URL
// (VITE_REST_RESOURCE_URL), so there is no dev proxy here — dev and production
// take the same code path. In development that request is cross-origin, so the
// server's CORS_ORIGIN must name the Vite origin (http://localhost:5173);
// in production nginx serves both from one domain and it is same-origin.
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom", "react-router-dom"],
  },
  preview: {
    host: true,
    port: 4173,
    // In production the preview server sits behind nginx, which forwards the
    // public Host header (e.g. mydomain.com). The preview container is only
    // reachable inside the compose network, so accept any forwarded host.
    allowedHosts: true,
  },
});

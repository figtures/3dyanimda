import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { occtCspPlugin } from "./scripts/model-import/occt-csp.mjs";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    watch: { ignored: ["**/release/**"] },
    hmr: {
      overlay: false,
    },
  },
  plugins: [occtCspPlugin(), react()],
  worker: { format: "es", plugins: () => [occtCspPlugin()] },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
}));

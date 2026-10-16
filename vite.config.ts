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
  // Discover worker readers before the first upload: Vite's late dependency
  // optimization otherwise reloads the page and discards the selected File.
  optimizeDeps: { include: ["occt-import-js", "three", "fflate", "@xmldom/xmldom", "three/examples/jsm/loaders/STLLoader.js", "three/examples/jsm/loaders/OBJLoader.js"] },
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

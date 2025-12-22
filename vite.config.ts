import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Define API_URL based on mode - avoid importing from api.ts to prevent build issues
  const envApiUrl = process.env.VITE_API_URL;
  const API_URL = (envApiUrl ? envApiUrl.replace(/\/$/, '').replace(/\/api$/, '') : 'http://localhost:5000');

  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        '/api': {
          target: API_URL,
          changeOrigin: true,
        },
        '/socket.io': {
          target: API_URL,
          ws: true,
          changeOrigin: true,
        },
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});

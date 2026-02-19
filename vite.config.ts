import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { viteMcpPlugin } from "vite-plugin-mcp-client-tools";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), viteMcpPlugin()],
  base: "/immigration-checker/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

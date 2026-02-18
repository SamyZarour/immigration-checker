import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { viteMcpPlugin } from "vite-plugin-mcp-client-tools";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), viteMcpPlugin()],
  base: "/immigration-checker/",
});

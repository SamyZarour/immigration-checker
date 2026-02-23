import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { viteMcpPlugin } from "vite-plugin-mcp-client-tools";

const vendorChunks: Record<string, string[]> = {
  "vendor-react": [
    "react",
    "react-dom",
    "react-redux",
    "react-error-boundary",
    "scheduler",
  ],
  "vendor-rtk": ["@reduxjs/toolkit", "immer", "reselect"],
  "vendor-ui": [
    "radix-ui",
    "@radix-ui",
    "class-variance-authority",
    "clsx",
    "tailwind-merge",
    "lucide-react",
  ],
  "vendor-forms": ["react-hook-form", "@hookform/resolvers", "zod", "sonner"],
  "vendor-date": ["date-fns"],
};

function manualChunks(id: string): string | undefined {
  if (!id.includes("node_modules")) return undefined;
  for (const [chunk, packages] of Object.entries(vendorChunks)) {
    if (packages.some((pkg) => id.includes(`node_modules/${pkg}/`))) {
      return chunk;
    }
  }
  return undefined;
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    ...(mode === "development" ? [viteMcpPlugin()] : []),
  ],
  base: "/immigration-checker/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
}));

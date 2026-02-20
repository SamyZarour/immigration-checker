import path from "path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/**"],
      exclude: ["src/components/ui/**", "src/vite-env.d.ts", "src/main.tsx"],
      thresholds: {
        "src/utils/**": {
          lines: 95,
          functions: 95,
          branches: 95,
          statements: 95,
        },
      },
      reporter: ["text", "lcov", "html"],
    },
  },
});

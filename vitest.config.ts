import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/utils/**"],
      thresholds: { lines: 95, functions: 95, branches: 95, statements: 95 },
      reporter: ["text", "lcov", "html"],
    },
  },
});

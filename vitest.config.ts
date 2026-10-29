import { defineConfig } from "vitest/config";

// Offline, deterministic tests. They start local HTTP servers on 127.0.0.1 and never reach the internet.
// Live tests against a real backend are in tests/smoke and run with vitest.smoke.config.ts.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    exclude: ["tests/smoke/**"],
    testTimeout: 15_000,
  },
});

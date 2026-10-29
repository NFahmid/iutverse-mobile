import { defineConfig } from "vitest/config";

// Live smoke tests against a running backend (staging or a local Docker stack). See docs/staging-smoke-tests.md.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/smoke/**/*.smoke.test.ts"],
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});

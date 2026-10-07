import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // CPU-bound tests (satori OG render, argon2id) flaked at the 5s default
    // when the machine was contended — see ops/tech-debt.md. 15s still bounds
    // hangs; maxWorkers caps self-contention on high-core dev machines.
    testTimeout: 15_000,
    maxWorkers: 8,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["lib/**/*.ts", "app/api/**/*.ts"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});

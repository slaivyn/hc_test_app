import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    threads: false,
    testTimeout: 60 * 1000 * 4, // 4  mins
  },
});

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // The emulator is a single shared instance; parallel files would race on the
    // same documents and produce flaky results.
    fileParallelism: false,
    testTimeout: 20_000,
    hookTimeout: 20_000,
    include: ['tests/**/*.test.ts'],
  },
});

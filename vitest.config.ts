// Delima Realtors Platform 2.0 — Vitest configuration (issue #66, Task 8-a)
// Node environment: API route handlers are exercised directly as plain functions,
// no DOM and no network — every suite talks to the real SQLite DB via Prisma.
import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    globals: false,
    include: ['tests/unit/*.test.ts', 'tests/api/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    testTimeout: 20_000,
    passWithNoTests: false,
    // SQLite allows a single writer — run test files sequentially to avoid
    // SQLITE_BUSY contention between suites sharing db/custom.db.
    fileParallelism: false,
    env: {
      NODE_ENV: 'test',
      // Contract #2 (issue #66): rate limiting must be disabled in tests
      RATE_LIMIT_DISABLED: '1',
      // Contract #1 (issue #66): admin-key guard compares against ADMIN_PASSCODE
      ADMIN_PASSCODE: 'delima2026',
      DATABASE_URL: 'file:/home/z/my-project/db/custom.db',
    },
  },
})

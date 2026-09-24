// Delima Realtors Platform 2.0 — Vitest global setup (issue #66, Task 8-a)
// Runs BEFORE any test file / route module is imported, so env-dependent
// module-level reads (rate limit flags, admin passcode, Prisma datasource)
// observe the values below.
//
// Contract notes (issue #66):
// 1. /api/leads GET+PATCH require `x-admin-key` === ADMIN_PASSCODE ('delima2026').
// 2. In-memory rate limiting on POST endpoints must be disabled when
//    NODE_ENV === 'test' or RATE_LIMIT_DISABLED === '1'.
// 3. /api/subscribe contract lives in tests/api/subscribe.test.ts.

// NODE_ENV is typed readonly on process.env — assign via Object.assign
Object.assign(process.env, { NODE_ENV: 'test' })
process.env.RATE_LIMIT_DISABLED = '1'
process.env.ADMIN_PASSCODE = 'delima2026'
process.env.DATABASE_URL = 'file:/home/z/my-project/db/custom.db'

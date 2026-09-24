// Delima Realtors Platform 2.0 — admin passcode gate (issue #64)
//
// Shared CRM gate: GET/PATCH /api/leads require the `x-admin-key` header to
// match ADMIN_PASSCODE (env; falls back to the demo passcode 'delima2026'
// when unset, matching the client-side demo hint in the Agent CRM view).
//
// Timing safety: raw passcode strings can differ in length, and
// timingSafeEqual THROWS on unequal lengths — so both sides are hashed to
// fixed 32-byte SHA-256 digests first, and the digests are compared in
// constant time. A brute-forcer cannot learn anything from response latency.

import { createHash, timingSafeEqual } from 'node:crypto'

const FALLBACK_PASSCODE = 'delima2026'

/** Admin passcode from env (trimmed); demo fallback when unset/empty. */
export function getAdminPasscode(): string {
  const fromEnv = process.env.ADMIN_PASSCODE?.trim()
  return fromEnv ? fromEnv : FALLBACK_PASSCODE
}

/**
 * Constant-time check of the request's `x-admin-key` header against the
 * configured passcode. Both values are SHA-256 hashed so the compared
 * buffers are always exactly 32 bytes regardless of input length.
 */
export function isAdmin(request: Request): boolean {
  // Fail closed in production when no passcode is configured — the demo
  // fallback must never be the effective gate on a deployed instance.
  if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_PASSCODE?.trim()) {
    return false
  }
  const provided = request.headers.get('x-admin-key') ?? ''
  const expected = getAdminPasscode()
  const providedDigest = createHash('sha256').update(provided, 'utf8').digest()
  const expectedDigest = createHash('sha256').update(expected, 'utf8').digest()
  return timingSafeEqual(providedDigest, expectedDigest)
}

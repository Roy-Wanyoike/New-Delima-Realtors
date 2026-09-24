// Delima Realtors 3.0 — buyer account auth (issue #59)
//
// Design:
// - Passwords: scrypt (node:crypto) with a per-buyer 16-byte salt, stored as
//   "scrypt$<salt-hex>$<hash-hex>". Verification compares digests in constant
//   time. scrypt is memory-hard — a better KDF for interactive logins than a
//   bare SHA-256 loop, and needs no native deps (unlike bcrypt/argon2).
// - Sessions: 32 random bytes (base64url) sent to the browser as an httpOnly
//   cookie. Only the SHA-256 digest of the token is stored (BuyerSession
//   .tokenHash), so a database leak cannot be replayed as a login.
// - No secret env var is required: session validity is DB state, so buyer
//   auth works on Vercel with zero additional configuration.
//
// Cookie contract (must match src/lib/buyer-store.ts expectations):
//   name:      delima_session
//   httpOnly, sameSite=Lax, path=/, secure in production, maxAge 30 days.

import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { db } from '@/lib/db'

export const SESSION_COOKIE = 'delima_session'
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days
export const BUYER_CLIENT_DTO_FIELDS = {
  id: true,
  email: true,
  name: true,
  phone: true,
  createdAt: true,
} as const

const SCRYPT_KEYLEN = 64

/* ------------------------------- passwords ------------------------------ */

/** Hash a plaintext password → "scrypt$<salt-hex>$<hash-hex>". */
export function hashPassword(password: string): string {
  const salt = randomBytes(16)
  const hash = scryptSync(password.normalize('NFKC'), salt, SCRYPT_KEYLEN)
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`
}

/** Constant-time password verification against a stored hash. */
export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split('$')
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false
  try {
    const salt = Buffer.from(parts[1], 'hex')
    const expected = Buffer.from(parts[2], 'hex')
    const actual = scryptSync(password.normalize('NFKC'), salt, SCRYPT_KEYLEN)
    return expected.length === actual.length && timingSafeEqual(expected, actual)
  } catch {
    return false
  }
}

/* ------------------------------- sessions ------------------------------- */

function hashToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex')
}

/** Create a DB session row and return the raw cookie token (never persisted). */
export async function createSession(buyerId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)
  await db.buyerSession.create({
    data: { tokenHash: hashToken(token), buyerId, expiresAt },
  })
  return { token, expiresAt }
}

/** Resolve the authed buyer from the request's session cookie (null when guest). */
export async function getSessionBuyer(request: Request) {
  const cookieHeader = request.headers.get('cookie') ?? ''
  const raw = cookieHeader
    .split(';')
    .map(part => part.trim())
    .find(part => part.startsWith(`${SESSION_COOKIE}=`))
    ?.slice(SESSION_COOKIE.length + 1)
  if (!raw) return null

  const token = decodeURIComponent(raw)
  const session = await db.buyerSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { buyer: { select: BUYER_CLIENT_DTO_FIELDS } },
  })
  if (!session) return null
  if (session.expiresAt.getTime() < Date.now()) {
    await db.buyerSession.delete({ where: { id: session.id } }).catch(() => undefined)
    return null
  }
  return session.buyer
}

/** Delete the session row for the request's cookie (logout). */
export async function destroySession(request: Request): Promise<void> {
  const cookieHeader = request.headers.get('cookie') ?? ''
  const raw = cookieHeader
    .split(';')
    .map(part => part.trim())
    .find(part => part.startsWith(`${SESSION_COOKIE}=`))
    ?.slice(SESSION_COOKIE.length + 1)
  if (!raw) return
  await db.buyerSession.deleteMany({ where: { tokenHash: hashToken(decodeURIComponent(raw)) } })
}

/** Attributes of the Set-Cookie header for the session cookie. */
export function sessionCookie(token: string, expiresAt: Date): string {
  const bits = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Expires=${expiresAt.toUTCString()}`,
  ]
  if (process.env.NODE_ENV === 'production') bits.push('Secure')
  return bits.join('; ')
}

/** Attributes that clear the session cookie in the browser. */
export function clearedSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
}

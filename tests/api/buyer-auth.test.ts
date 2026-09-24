// Delima Realtors 3.0 — buyer account API tests (issue #59)
// Contracts:
//   POST /api/auth/register  → 201 {buyer}+cookie | 409 duplicate | 400 invalid
//   POST /api/auth/login     → 200 {buyer}+cookie | 401 bad credentials
//   GET  /api/account        → 200 {buyer, savedProperties, savedSearches} | 401
//   POST /api/account/saved-properties {slug} → 201 | bulk {slugs} → 200 idempotent
//   DELETE /api/account/saved-properties {slug} → 200
//   POST /api/account/saved-searches {name, filters} → 201 | DELETE {id} → 200
//   PATCH /api/account/profile {name?, phone?} → 200 {buyer}
//   POST /api/auth/logout → 200 {ok:true}, cookie cleared
import { describe, it, expect, afterAll } from 'vitest'
import { db } from '@/lib/db'
import * as registerRoute from '@/app/api/auth/register/route'
import * as loginRoute from '@/app/api/auth/login/route'
import * as logoutRoute from '@/app/api/auth/logout/route'
import * as accountRoute from '@/app/api/account/route'
import * as savedPropsRoute from '@/app/api/account/saved-properties/route'
import * as savedSearchesRoute from '@/app/api/account/saved-searches/route'
import * as profileRoute from '@/app/api/account/profile/route'

const EMAIL = 'qa-buyer@example.com'
const PASSWORD = 'qa-password-123'

function req(body: unknown, cookie?: string): Request {
  return new Request('http://localhost/api/x', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}) },
    body: JSON.stringify(body),
  })
}

function reqNoBody(method: string, cookie?: string): Request {
  return new Request('http://localhost/api/x', {
    method,
    headers: cookie ? { cookie } : {},
  })
}

function cookieFrom(res: Response): string {
  return res.headers.get('set-cookie')?.split(';')[0] ?? ''
}

let sessionCookie = ''

afterAll(async () => {
  await db.buyer.deleteMany({ where: { email: EMAIL } })
})

describe('POST /api/auth/register', () => {
  it('201 {buyer} and sets a session cookie', async () => {
    const res = await registerRoute.POST(req({ name: 'QA Buyer', email: EMAIL, phone: '+254700000009', password: PASSWORD }))
    expect(res.status).toBe(201)
    const body = (await res.json()) as { buyer?: { email?: string; name?: string } }
    expect(body.buyer?.email).toBe(EMAIL)
    expect(body.buyer?.name).toBe('QA Buyer')
    expect(cookieFrom(res)).toMatch(/^delima_session=/)
  })

  it('409 when the email is already registered', async () => {
    const res = await registerRoute.POST(req({ name: 'QA Buyer', email: EMAIL, password: PASSWORD }))
    expect(res.status).toBe(409)
  })

  it('400 on invalid payload (short password)', async () => {
    const res = await registerRoute.POST(req({ name: 'QA', email: 'short-pw@example.com', password: 'short' }))
    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  it('401 for wrong password', async () => {
    const res = await loginRoute.POST(req({ email: EMAIL, password: 'wrong-password' }))
    expect(res.status).toBe(401)
  })

  it('401 for unknown email', async () => {
    const res = await loginRoute.POST(req({ email: 'nobody@example.com', password: PASSWORD }))
    expect(res.status).toBe(401)
  })

  it('200 + cookie for correct credentials (email case-insensitive)', async () => {
    const res = await loginRoute.POST(req({ email: EMAIL.toUpperCase(), password: PASSWORD }))
    expect(res.status).toBe(200)
    expect(cookieFrom(res)).toMatch(/^delima_session=/)
    sessionCookie = cookieFrom(res)
  })
})

describe('GET /api/account', () => {
  it('401 for guests', async () => {
    const res = await accountRoute.GET(reqNoBody('GET'))
    expect(res.status).toBe(401)
  })

  it('200 {buyer, savedProperties, savedSearches} when authed', async () => {
    const res = await accountRoute.GET(reqNoBody('GET', sessionCookie))
    expect(res.status).toBe(200)
    const body = (await res.json()) as { buyer?: unknown; savedProperties?: unknown[]; savedSearches?: unknown[] }
    expect(body.buyer).toBeTruthy()
    expect(Array.isArray(body.savedProperties)).toBe(true)
    expect(Array.isArray(body.savedSearches)).toBe(true)
  })
})

describe('saved properties', () => {
  it('401 when guest adds', async () => {
    const res = await savedPropsRoute.POST(req({ slug: 'anything' }))
    expect(res.status).toBe(401)
  })

  it('POST {slug} → 201, bulk merge idempotent, DELETE → 200', async () => {
    const property = await db.property.findFirst({ select: { slug: true } })
    expect(property).toBeTruthy()
    const slug = property!.slug

    const add = await savedPropsRoute.POST(req({ slug }, sessionCookie))
    expect(add.status).toBe(201)

    // bulk merge with the same slug — idempotent, still saved exactly once
    const bulk = await savedPropsRoute.POST(req({ slugs: [slug] }, sessionCookie))
    expect(bulk.status).toBe(200)
    const bulkBody = (await bulk.json()) as { saved: string[] }
    expect(bulkBody.saved.filter(s => s === slug)).toHaveLength(1)

    const del = await savedPropsRoute.DELETE(req({ slug }, sessionCookie))
    expect(del.status).toBe(200)
    const list = await savedPropsRoute.GET(reqNoBody('GET', sessionCookie))
    const listBody = (await list.json()) as { saved: string[] }
    expect(listBody.saved).not.toContain(slug)
  })

  it('404 for unknown slug', async () => {
    const res = await savedPropsRoute.POST(req({ slug: 'does-not-exist' }, sessionCookie))
    expect(res.status).toBe(404)
  })
})

describe('saved searches', () => {
  it('POST → 201 then DELETE → 200 removes it', async () => {
    const filters = { q: '', type: 'ALL', status: 'ALL', minPrice: null, maxPrice: null, beds: 3, neighborhood: 'karen', featuredOnly: false, sort: 'featured' }
    const created = await savedSearchesRoute.POST(req({ name: 'QA Karen villas', filters }, sessionCookie))
    expect(created.status).toBe(201)
    const { search } = (await created.json()) as { search: { id: string } }

    const del = await savedSearchesRoute.DELETE(req({ id: search.id }, sessionCookie))
    expect(del.status).toBe(200)
  })

  it('400 on invalid filters payload', async () => {
    const res = await savedSearchesRoute.POST(req({ name: 'No filters here' }, sessionCookie))
    expect(res.status).toBe(400)
  })
})

describe('PATCH /api/account/profile', () => {
  it('200 {buyer} with updated fields', async () => {
    const res = await profileRoute.PATCH(new Request('http://localhost/api/x', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', cookie: sessionCookie },
      body: JSON.stringify({ name: 'QA Buyer Jr', phone: '+254700000010' }),
    }))
    expect(res.status).toBe(200)
    const body = (await res.json()) as { buyer?: { name?: string; phone?: string } }
    expect(body.buyer?.name).toBe('QA Buyer Jr')
    expect(body.buyer?.phone).toBe('+254700000010')
  })

  it('400 when nothing to update', async () => {
    const res = await profileRoute.PATCH(new Request('http://localhost/api/x', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', cookie: sessionCookie },
      body: JSON.stringify({}),
    }))
    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/logout', () => {
  it('200 {ok:true} and the session stops working', async () => {
    const res = await logoutRoute.POST(reqNoBody('POST', sessionCookie))
    expect(res.status).toBe(200)
    expect(res.headers.get('set-cookie')).toContain('Max-Age=0')

    const after = await accountRoute.GET(reqNoBody('GET', sessionCookie))
    expect(after.status).toBe(401)
  })
})

// Delima Realtors 3.0 — buyer account e2e (issues #59 + #63)
// Register → saved home syncs to the account → sign out → sign back in.
// Uses a unique email per run so it is safe against a seeded shared DB.
import { expect, test } from '@playwright/test'

const EMAIL = `e2e-buyer-${Date.now()}@example.com`
const PASSWORD = 'e2e-password-123'
const NAME = 'E2E Buyer'

test.describe('buyer accounts', () => {
  test('register, save a home, see it in the account, sign out, sign back in', async ({ page }) => {
    await page.goto('/')

    // 1. open account view from header
    await page.getByRole('button', { name: /sign in|ingia/i }).first().click()
    await expect(page.getByRole('heading', { name: /your delima account|akaunti/i })).toBeVisible()

    // 2. switch to the create-account tab and register
    await page.getByRole('tab', { name: /create account|fungua akaunti/i }).click()
    await page.getByLabel(/full name|jina kamili/i).fill(NAME)
    await page.getByLabel(/^email|barua pepe/i).first().fill(EMAIL)
    await page.getByLabel(/^password|nenosiri/i).first().fill(PASSWORD)
    await page.getByRole('button', { name: /create account|fungua akaunti/i }).last().click()

    // 3. dashboard appears
    await expect(page.getByRole('heading', { name: /welcome back, e2e|karibu tena/i })).toBeVisible({ timeout: 15_000 })

    // 4. browse properties and heart a home (server-backed now)
    await page.getByRole('navigation', { name: 'Primary' }).getByRole('button', { name: /properties|nyumba/i }).click()
    const card = page.locator('article[role="link"]').first()
    await expect(card).toBeVisible({ timeout: 20_000 })
    const heart = card.getByRole('button', { name: /save|hifadhi/i })
    await heart.click()
    await expect(card.getByRole('button', { name: /saved|imehifadhiwa/i })).toBeVisible()

    // 5. back to the account — the home is in the saved list
    await page.getByRole('button', { name: /account|akaunti/i }).first().click()
    await expect(page.locator('article[role="link"]').first()).toBeVisible({ timeout: 15_000 })

    // 6. sign out
    await page.getByRole('button', { name: /sign out|toka/i }).click()
    await expect(page.getByRole('heading', { name: /your delima account|akaunti/i })).toBeVisible()

    // 7. sign back in — saved home persists (server session + DB row)
    await page.getByRole('tab', { name: /sign in|ingia/i }).click()
    await page.getByLabel(/^email|barua pepe/i).first().fill(EMAIL)
    await page.getByLabel(/^password|nenosiri/i).first().fill(PASSWORD)
    await page.getByRole('button', { name: /sign in|ingia/i }).last().click()
    await expect(page.getByRole('heading', { name: /welcome back, e2e|karibu tena/i })).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('article[role="link"]').first()).toBeVisible({ timeout: 15_000 })
  })
})

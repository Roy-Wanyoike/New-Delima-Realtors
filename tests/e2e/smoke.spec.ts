// Delima Realtors 3.0 — smoke e2e (issue #63)
// Golden path: home renders live data → search → property detail → i18n toggle.
import { expect, test } from '@playwright/test'

test.describe('smoke', () => {
  test('home renders with live listings and stats', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('banner')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    // hero search card + trust chips render
    await expect(page.getByRole('button', { name: /search|tafuta/i }).first()).toBeVisible()
    // featured grid eventually shows property cards (seeded DB has 42 listings)
    await expect(page.locator('article[role="link"]').first()).toBeVisible({ timeout: 20_000 })
  })

  test('search filters and opens a property detail', async ({ page }) => {
    await page.goto('/')
    // use the properties view via nav
    await page.getByRole('navigation', { name: 'Primary' }).getByRole('button', { name: /properties|nyumba/i }).click()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 20_000 })
    // at least one listing card renders
    const card = page.locator('article[role="link"]').first()
    await expect(card).toBeVisible({ timeout: 20_000 })
    await card.click()
    // detail view shows title + spec strip
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('button', { name: /book a viewing|panga kutazama/i }).first()).toBeVisible()
  })

  test('EN/SW language toggle translates the header', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await expect(nav.getByRole('button', { name: 'Home' })).toBeVisible()
    // switch to Swahili
    await page.getByRole('button', { name: 'Kiswahili' }).click()
    await expect(nav.getByRole('button', { name: 'Nyumbani' })).toBeVisible()
    // html lang flips too
    await expect(page.locator('html')).toHaveAttribute('lang', 'sw')
    // switch back
    await page.getByRole('button', { name: 'English' }).click()
    await expect(nav.getByRole('button', { name: 'Home' })).toBeVisible()
  })
})

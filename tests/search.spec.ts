import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('live Unicode search updates counts, totals, and original-text highlights', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('status')).toContainText('16 activities')
  await page.getByRole('searchbox', { name: 'Search activities' }).fill('cafe')
  await expect(page.getByRole('status')).toHaveText('2 activities · 1h 20m')
  await expect(page.locator('.activity-row')).toHaveCount(2)
  await expect(page.locator('.activity-title mark')).toHaveText(['Café', 'Café'])
  await expect(page.locator('.total-time')).toHaveText('1h 20m')
  await page.getByRole('button', { name: 'Clear search', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('16 activities')
})

test('keyboard focus and Escape clear only query, preserving project and dates', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('navigation', { name: 'Projects' }).getByRole('button', { name: 'Client work', exact: true }).click()
  await page.getByLabel('Date range', { exact: true }).selectOption('today')
  await page.keyboard.press('Control+f')
  const search = page.getByRole('searchbox')
  await expect(search).toBeFocused()
  await search.fill('cafe')
  await expect(page.getByRole('status')).toHaveText('1 activity · 35m')
  await search.press('Escape')
  await expect(search).toHaveValue('')
  await expect(page.getByRole('status')).toHaveText('2 activities · 51m')
  await expect(page.getByLabel('Date range', { exact: true })).toHaveValue('today')
  await expect(page.getByRole('button', { name: 'Remove project filter Client work' })).toBeVisible()
  await search.blur()
  await page.keyboard.press('Meta+f')
  await expect(search).toBeFocused()
})

test('field constraints, literal operators, no-results guidance, and reset', async ({ page }) => {
  await page.goto('/')
  const search = page.getByRole('searchbox')
  await search.fill('Safari')
  await page.getByLabel('Search field', { exact: true }).selectOption('application')
  await expect(page.locator('.activity-row')).toHaveCount(4)
  await page.getByLabel('Search field', { exact: true }).selectOption('title')
  await expect(page.getByRole('heading', { name: 'No activities found' })).toBeVisible()
  await page.getByRole('button', { name: 'Reset All Filters' }).click()
  await search.fill('[draft]')
  await expect(page.getByRole('status')).toHaveText('1 activity · 32m')
  await search.fill('.*')
  await expect(page.getByRole('status')).toHaveText('0 activities · 0m')
  await page.getByRole('button', { name: 'Clear Search', exact: true }).last().click()
  await expect(page.locator('.activity-row')).toHaveCount(16)
})

test('date scope, project filtering, and activity details work by keyboard', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Date range', { exact: true }).selectOption('today')
  await expect(page.locator('.activity-row')).toHaveCount(8)
  await page.getByRole('button', { name: 'Filter by Atlas website', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('3 activities · 2h 22m')
  await page.locator('.activity-row').first().focus()
  await page.keyboard.press('Enter')
  const details = page.getByRole('region', { name: 'Activity details' })
  await expect(details).toContainText('Homepage exploration — Atlas')
  await expect(details).toContainText('figma.com/design/atlas/homepage')
  await page.getByRole('button', { name: 'Close activity details' }).click()
  await expect(details).not.toBeVisible()
})

test('evidence links serve original JSON with IDs in the production build', async ({ page, request }) => {
  await page.goto('/#evidence')
  await expect(page.getByRole('heading', { name: 'Behind the search.' })).toBeVisible()
  await expect(page.getByText('capability_unavailable', { exact: true })).toBeVisible()
  for (const link of await page.getByRole('link', { name: /^Open .*\.json/ }).all()) {
    const href = await link.getAttribute('href')
    const response = await request.get(href!)
    expect(response.ok()).toBeTruthy()
    const evidence = await response.json()
    expect(evidence.evidence_id).toMatch(/^ev_/)
    expect(evidence.authority).toBe('shipped-artifact')
  }
  await page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name: /^Activities/ }).click()
  await expect(page.getByRole('searchbox')).toBeVisible()
})

for (const colorScheme of ['light', 'dark'] as const) {
  for (const width of [1440, 390]) {
    test(`${colorScheme} ${width}px: accessible responsive search and evidence`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 })
      await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' })
      await page.goto('/')
      await page.getByRole('searchbox').fill('cafe')
      await expect(page.getByRole('status')).toHaveText('2 activities · 1h 20m')
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
      const searchAudit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
      expect(searchAudit.violations).toEqual([])
      await page.getByRole('searchbox').blur()
      await page.screenshot({ path: `verification/search-${colorScheme}-${width}.png`, fullPage: true })
      await page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name: 'Search evidence' }).click()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
      const evidenceAudit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
      expect(evidenceAudit.violations).toEqual([])
      await page.screenshot({ path: `verification/evidence-${colorScheme}-${width}.png`, fullPage: true })
    })
  }
}

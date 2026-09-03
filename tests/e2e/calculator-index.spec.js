const { test, expect } = require('@playwright/test');

test.describe('calculator index', () => {
  test('renders the category grid on load', async ({ page }) => {
    await page.goto('/index.html');

    await expect(page.locator('#calculator-index')).toHaveClass(/active/);
    const cardCount = await page.locator('.calc-card').count();
    expect(cardCount).toBeGreaterThan(50);
  });

  test('search filters the visible cards', async ({ page }) => {
    await page.goto('/index.html');

    await page.fill('#calc-search', 'Wilks');

    const visibleCards = page.locator('.calc-card-wrap:not([hidden])');
    await expect(visibleCards).toHaveCount(1);
    await expect(visibleCards.first()).toContainText('Wilks');
    await expect(page.locator('#calc-no-results')).toBeHidden();
  });

  test('search with no matches shows the no-results hint', async ({ page }) => {
    await page.goto('/index.html');

    await page.fill('#calc-search', 'zzzznonexistentcalculatorzzzz');

    await expect(page.locator('.calc-card-wrap:not([hidden])')).toHaveCount(0);
    await expect(page.locator('#calc-no-results')).toBeVisible();
  });

  test('clicking a card navigates to that calculator via the hash router', async ({ page }) => {
    await page.goto('/index.html');

    await page.fill('#calc-search', 'Wilks');
    await page.locator('.calc-card-wrap:not([hidden]) .calc-card').first().click();

    await expect(page).toHaveURL(/#calc\/wilks$/);
    await expect(page.locator('#wilks')).toHaveClass(/active/);
    await expect(page.locator('#back-to-index')).toBeVisible();

    await page.locator('#back-to-index').click();
    await expect(page.locator('#calculator-index')).toHaveClass(/active/);
  });
});

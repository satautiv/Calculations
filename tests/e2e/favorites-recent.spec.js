const { test, expect } = require('@playwright/test');

test.describe('Favorites and Recently Used', () => {
  test('favoriting a calculator persists and shows in a Favorites section', async ({ page }) => {
    await page.goto('/index.html');

    await expect(page.locator('.category-group[data-category="Favorites"]')).toHaveCount(0);

    await page.fill('#calc-search', 'Wilks');
    await page.locator('.calc-card-wrap:not([hidden]) .calc-favorite-btn').click();
    await page.fill('#calc-search', '');

    const favoritesGroup = page.locator('.category-group[data-category="Favorites"]');
    await expect(favoritesGroup.locator('.calc-card-wrap')).toHaveCount(1);
    await expect(favoritesGroup).toContainText('Wilks');

    await page.reload();
    await expect(page.locator('.category-group[data-category="Favorites"] .calc-card-wrap')).toHaveCount(1);

    // Unfavorite from within the Favorites section itself.
    await page.locator('.category-group[data-category="Favorites"] .calc-favorite-btn').click();
    await expect(page.locator('.category-group[data-category="Favorites"]')).toHaveCount(0);

    await page.reload();
    await expect(page.locator('.category-group[data-category="Favorites"]')).toHaveCount(0);
  });

  test('opening calculators builds a deduplicated, capped, most-recent-first Recently Used list', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('.category-group[data-category="Recently Used"]')).toHaveCount(0);

    for (const id of ['orm', 'plates', 'wilks', 'orm']) {
      await page.goto(`/index.html#calc/${id}`);
    }
    await page.goto('/index.html');

    const recentCards = page.locator('.category-group[data-category="Recently Used"] .calc-card-wrap');
    await expect(recentCards).toHaveCount(3);
    await expect(recentCards.nth(0)).toContainText('One-Rep Max');
    await expect(recentCards.nth(1)).toContainText('Wilks');
    await expect(recentCards.nth(2)).toContainText('Plate Loading');

    await page.reload();
    await expect(page.locator('.category-group[data-category="Recently Used"] .calc-card-wrap')).toHaveCount(3);
  });

  test('Favorites and Recently Used sections respect the search filter and hide when empty', async ({ page }) => {
    await page.goto('/index.html');

    await page.fill('#calc-search', 'Wilks');
    await page.locator('.calc-card-wrap:not([hidden]) .calc-favorite-btn').click();
    await page.goto('/index.html#calc/orm');
    await page.goto('/index.html');

    await page.fill('#calc-search', 'zzzznonexistentcalculatorzzzz');
    await expect(page.locator('.category-group[data-category="Favorites"]')).toBeHidden();
    await expect(page.locator('.category-group[data-category="Recently Used"]')).toBeHidden();
    await expect(page.locator('#calc-no-results')).toBeVisible();

    await page.fill('#calc-search', 'One-Rep Max');
    await expect(page.locator('.category-group[data-category="Favorites"]')).toBeHidden();
    await expect(page.locator('.category-group[data-category="Recently Used"]')).toBeVisible();
  });

  test('translates section titles and favorite labels with the language switcher', async ({ page }) => {
    await page.goto('/index.html');

    await page.fill('#calc-search', 'Wilks');
    await page.locator('.calc-card-wrap:not([hidden]) .calc-favorite-btn').click();
    await page.fill('#calc-search', '');

    await page.selectOption('#lang-select', 'es');

    await expect(page.locator('.category-group[data-category="Favorites"] .category-title')).toHaveText('Favoritos');
    await expect(page.locator('.calc-favorite-btn.active').first()).toHaveAttribute('aria-label', 'Quitar de favoritos');

    await page.selectOption('#lang-select', 'en');
    await expect(page.locator('.category-group[data-category="Favorites"] .category-title')).toHaveText('Favorites');
  });
});

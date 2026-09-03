const { test, expect } = require('@playwright/test');

test.describe('One-Rep Max calculator (simple, single-shot calculator)', () => {
  test('calculates and renders a result table', async ({ page }) => {
    await page.goto('/index.html#calc/orm');

    await page.fill('#orm-weight', '100');
    await page.fill('#orm-reps', '5');
    await page.click('#orm-calc');

    const result = page.locator('#orm-result');
    await expect(result.locator('.headline')).toContainText('average');
    await expect(result.locator('table tbody tr')).toHaveCount(4);
    await expect(result.locator('table')).toContainText('Epley');
  });

  test('shows a validation error for invalid input', async ({ page }) => {
    await page.goto('/index.html#calc/orm');

    await page.fill('#orm-weight', '0');
    await page.fill('#orm-reps', '5');
    await page.click('#orm-calc');

    await expect(page.locator('#orm-result')).toContainText('Enter a valid weight and rep count.');
  });
});

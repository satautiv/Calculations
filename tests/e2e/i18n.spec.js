const { test, expect } = require('@playwright/test');

test.describe('language switching', () => {
  test('switching language translates chrome and index without touching .result', async ({ page }) => {
    await page.goto('/index.html#calc/orm');

    await page.fill('#orm-weight', '100');
    await page.fill('#orm-reps', '5');
    await page.click('#orm-calc');
    const resultBefore = await page.locator('#orm-result').innerHTML();

    await page.selectOption('#lang-select', 'es');

    await expect(page.locator('h1')).toHaveText('Suite de Calculadoras');
    await expect(page.locator('#orm-calc')).toHaveText('Calcular');
    expect(await page.locator('#orm-result').innerHTML()).toBe(resultBefore);

    await page.click('#back-to-index');
    await expect(page.locator('.calc-card').first()).toBeVisible();
    const cardText = await page.locator('.calc-card').first().locator('h3').textContent();
    expect(cardText).not.toBe('');

    await page.selectOption('#lang-select', 'en');
    await expect(page.locator('h1')).toHaveText('Calculator Suite');
  });

  test('persists the selected language across a reload', async ({ page }) => {
    await page.goto('/index.html');
    await page.selectOption('#lang-select', 'es');
    await expect(page.locator('h1')).toHaveText('Suite de Calculadoras');

    await page.reload();

    await expect(page.locator('h1')).toHaveText('Suite de Calculadoras');
    await expect(page.locator('#lang-select')).toHaveValue('es');

    await page.selectOption('#lang-select', 'en');
  });
});

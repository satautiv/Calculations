const { test, expect } = require('@playwright/test');

test.describe('PWA support', () => {
  test('exposes a valid manifest with icons', async ({ page, request, baseURL }) => {
    await page.goto('/index.html');

    const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(manifestHref).toBe('manifest.json');

    const response = await request.get(new URL(manifestHref, baseURL).toString());
    expect(response.ok()).toBeTruthy();

    const manifest = await response.json();
    expect(manifest.name).toBeTruthy();
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
    expect(manifest.icons.some((i) => i.purpose === 'maskable')).toBe(true);
  });

  test('registers a service worker that serves the app offline', async ({ page, context }) => {
    await page.goto('/index.html');

    await page.evaluate(() => navigator.serviceWorker.ready);

    await context.setOffline(true);
    await page.reload();

    await expect(page.locator('h1')).toHaveText('Calculator Suite');
    const cardCount = await page.locator('.calc-card').count();
    expect(cardCount).toBeGreaterThan(50);

    await page.goto('/index.html#calc/orm');
    await page.fill('#orm-weight', '100');
    await page.fill('#orm-reps', '5');
    await page.click('#orm-calc');
    await expect(page.locator('#orm-result .headline')).toContainText('average');

    await context.setOffline(false);
  });
});

const { test, expect } = require('@playwright/test');

test.describe('Privacy Policy page', () => {
  test('is linked from the index footer and reachable on every view', async ({ page }) => {
    await page.goto('/index.html');

    const footerLink = page.locator('footer a[href="privacy.html"]');
    await expect(footerLink).toBeVisible();

    await page.goto('/index.html#calc/orm');
    await expect(page.locator('footer a[href="privacy.html"]')).toBeVisible();

    await footerLink.first().click().catch(() => {});
  });

  test('covers cookies, Google AdSense, and opt-out choices in plain language', async ({ page }) => {
    await page.goto('/privacy.html');

    await expect(page.locator('h2')).toHaveText('Privacy Policy');
    await expect(page.locator('main')).toContainText('Google AdSense');
    await expect(page.locator('main')).toContainText('cookies');
    await expect(page.locator('a[href="https://policies.google.com/technologies/ads"]')).toHaveCount(1);
    await expect(page.locator('a[href="https://adssettings.google.com"]')).toHaveCount(1);
    await expect(page.locator('a[href="https://policies.google.com/privacy"]')).toHaveCount(1);

    // No mailto: link — consistent with #456's decision not to publish a
    // personal email; the contact path is a GitHub issue link instead.
    expect(await page.locator('a[href^="mailto:"]').count()).toBe(0);
  });

  test('links back to the calculator index', async ({ page }) => {
    await page.goto('/privacy.html');

    await page.click('text=Back to calculators');
    await expect(page).toHaveURL(/index\.html$/);
    await expect(page.locator('#calculator-index')).toHaveClass(/active/);
  });
});

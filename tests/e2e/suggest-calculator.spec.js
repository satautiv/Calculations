const { test, expect } = require('@playwright/test');

test.describe('Suggest a calculator link', () => {
  test('opens a pre-filled GitHub issue in a new tab', async ({ page }) => {
    await page.goto('/index.html');

    const link = page.locator('.suggest-calculator-link');
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);

    const href = await link.getAttribute('href');
    const url = new URL(href);
    expect(url.origin + url.pathname).toBe('https://github.com/satautiv/Calculations/issues/new');
    expect(url.searchParams.get('title')).toContain('Suggestion');
    expect(url.searchParams.get('body')).toContain('What calculator would you like to see?');

    // No raw mailto: link should be present anywhere in the page — the
    // issue explicitly requires the fallback (if any) not be scrapable, and
    // this project skipped the email fallback entirely.
    expect(await page.locator('a[href^="mailto:"]').count()).toBe(0);
  });

  test('stays visible even when the search filter matches nothing', async ({ page }) => {
    await page.goto('/index.html');

    await page.fill('#calc-search', 'zzzznonexistentcalculatorzzzz');

    await expect(page.locator('.suggest-calculator')).toBeVisible();
  });

  test('translates with the language switcher', async ({ page }) => {
    await page.goto('/index.html');

    await page.selectOption('#lang-select', 'de');

    await expect(page.locator('.suggest-calculator-link')).toHaveText('Rechner vorschlagen');
    await expect(page.locator('.suggest-calculator p')).toHaveText('Fehlt ein Rechner, den Sie sich wünschen?');
  });
});

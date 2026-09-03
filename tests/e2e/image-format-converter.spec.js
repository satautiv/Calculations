const { test, expect } = require('@playwright/test');

test.describe('Image Format Converter', () => {
  test('converts to PNG by default with no background field shown', async ({ page }) => {
    await page.goto('/index.html#calc/image-format-converter');

    await expect(page.locator('#imgformat-bg-field')).toBeHidden();

    await page.setInputFiles('#imgformat-file', 'icons/icon-512.png');
    await page.click('#imgformat-calc');

    const result = page.locator('#imgformat-result');
    await expect(result.locator('.headline')).toHaveText('PNG');

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      result.locator('.image-download-btn').click(),
    ]);
    expect(download.suggestedFilename()).toBe('icon-512.png');
  });

  test('converts to JPEG with a background color field for transparency flattening', async ({ page }) => {
    await page.goto('/index.html#calc/image-format-converter');

    await page.setInputFiles('#imgformat-file', 'icons/icon-512.png');
    await page.selectOption('#imgformat-format', 'image/jpeg');
    await expect(page.locator('#imgformat-bg-field')).toBeVisible();

    await page.click('#imgformat-calc');

    const result = page.locator('#imgformat-result');
    await expect(result.locator('.headline')).toHaveText('JPEG');

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      result.locator('.image-download-btn').click(),
    ]);
    expect(download.suggestedFilename()).toBe('icon-512.jpg');
  });

  test('converts to WebP with no background field (WebP supports transparency)', async ({ page }) => {
    await page.goto('/index.html#calc/image-format-converter');

    await page.setInputFiles('#imgformat-file', 'icons/icon-512.png');
    await page.selectOption('#imgformat-format', 'image/webp');
    await expect(page.locator('#imgformat-bg-field')).toBeHidden();

    await page.click('#imgformat-calc');

    const result = page.locator('#imgformat-result');
    await expect(result.locator('.headline')).toHaveText('WebP');

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      result.locator('.image-download-btn').click(),
    ]);
    expect(download.suggestedFilename()).toBe('icon-512.webp');
  });

  test('shows a validation error when no file is chosen', async ({ page }) => {
    await page.goto('/index.html#calc/image-format-converter');

    await page.click('#imgformat-calc');

    await expect(page.locator('#imgformat-result')).toContainText('Choose an image file.');
  });
});

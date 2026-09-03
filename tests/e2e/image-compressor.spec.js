const { test, expect } = require('@playwright/test');

test.describe('Image Compressor', () => {
  test('compresses to JPEG and reports size change', async ({ page }) => {
    await page.goto('/index.html#calc/image-compressor');

    await expect(page.locator('#imgcompress-bg-field')).toBeVisible();

    await page.setInputFiles('#imgcompress-file', 'icons/icon-512.png');
    await page.fill('#imgcompress-quality', '50');
    await expect(page.locator('#imgcompress-quality-value')).toHaveText('50');

    await page.click('#imgcompress-calc');

    const result = page.locator('#imgcompress-result');
    await expect(result.locator('.headline')).toContainText(/smaller|larger/);
    await expect(result).toContainText('KB');
    await expect(result.locator('.image-preview')).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      result.locator('.image-download-btn').click(),
    ]);
    expect(download.suggestedFilename()).toBe('icon-512.jpg');
  });

  test('WebP output hides the background color field and compresses', async ({ page }) => {
    await page.goto('/index.html#calc/image-compressor');

    await page.selectOption('#imgcompress-format', 'image/webp');
    await expect(page.locator('#imgcompress-bg-field')).toBeHidden();

    await page.setInputFiles('#imgcompress-file', 'icons/icon-512.png');
    await page.fill('#imgcompress-quality', '30');
    await page.click('#imgcompress-calc');

    const result = page.locator('#imgcompress-result');
    await expect(result.locator('.headline')).toContainText('smaller');

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      result.locator('.image-download-btn').click(),
    ]);
    expect(download.suggestedFilename()).toBe('icon-512.webp');
  });

  test('can be recalculated repeatedly without erroring', async ({ page }) => {
    await page.goto('/index.html#calc/image-compressor');

    await page.setInputFiles('#imgcompress-file', 'icons/icon-512.png');
    await page.click('#imgcompress-calc');
    await expect(page.locator('#imgcompress-result .headline')).toBeVisible();

    await page.click('#imgcompress-calc');
    await expect(page.locator('#imgcompress-result .headline')).toBeVisible();
  });

  test('shows a validation error when no file is chosen', async ({ page }) => {
    await page.goto('/index.html#calc/image-compressor');

    await page.click('#imgcompress-calc');

    await expect(page.locator('#imgcompress-result')).toContainText('Choose an image file.');
  });

  test('the live quality value survives a language switch (translate="no" regression check)', async ({ page }) => {
    await page.goto('/index.html#calc/image-compressor');

    await page.fill('#imgcompress-quality', '65');
    await expect(page.locator('#imgcompress-quality-value')).toHaveText('65');

    await page.selectOption('#lang-select', 'es');
    await expect(page.locator('#imgcompress-quality-value')).toHaveText('65');

    await page.selectOption('#lang-select', 'en');
  });
});

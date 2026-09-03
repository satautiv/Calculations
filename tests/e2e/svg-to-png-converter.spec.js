const { test, expect } = require('@playwright/test');

const SAMPLE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" fill="red"/></svg>';

test.describe('SVG to PNG/JPEG Converter', () => {
  test('converts to PNG at the SVG\'s natural size', async ({ page }) => {
    await page.goto('/index.html#calc/svg-to-png-converter');

    await page.setInputFiles('#svg2img-file', {
      name: 'logo.svg',
      mimeType: 'image/svg+xml',
      buffer: Buffer.from(SAMPLE_SVG),
    });
    await page.click('#svg2img-calc');

    const result = page.locator('#svg2img-result');
    await expect(result.locator('.headline')).toHaveText('100×100 PNG');
    await expect(result.locator('.image-preview')).toBeVisible();
    await expect(result).toContainText('KB');

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      result.locator('.image-download-btn').click(),
    ]);
    expect(download.suggestedFilename()).toBe('logo.png');
  });

  test('converts to JPEG at a custom size with a background color', async ({ page }) => {
    await page.goto('/index.html#calc/svg-to-png-converter');

    await page.setInputFiles('#svg2img-file', {
      name: 'logo.svg',
      mimeType: 'image/svg+xml',
      buffer: Buffer.from(SAMPLE_SVG),
    });

    await page.selectOption('#svg2img-format', 'image/jpeg');
    await expect(page.locator('#svg2img-bg-field')).toBeVisible();

    await page.check('#svg2img-custom-size');
    await page.fill('#svg2img-width', '300');
    await page.fill('#svg2img-height', '150');
    await page.click('#svg2img-calc');

    const result = page.locator('#svg2img-result');
    await expect(result.locator('.headline')).toHaveText('300×150 JPEG');

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      result.locator('.image-download-btn').click(),
    ]);
    expect(download.suggestedFilename()).toBe('logo.jpg');
  });

  test('shows a validation error when no file is chosen', async ({ page }) => {
    await page.goto('/index.html#calc/svg-to-png-converter');

    await page.click('#svg2img-calc');

    await expect(page.locator('#svg2img-result')).toContainText('Choose an SVG file.');
  });

  test('requires a custom size for a file with no valid size entered', async ({ page }) => {
    await page.goto('/index.html#calc/svg-to-png-converter');

    await page.setInputFiles('#svg2img-file', {
      name: 'logo.svg',
      mimeType: 'image/svg+xml',
      buffer: Buffer.from(SAMPLE_SVG),
    });
    await page.check('#svg2img-custom-size');
    await page.click('#svg2img-calc');

    await expect(page.locator('#svg2img-result')).toContainText('Enter a valid custom width and height.');
  });
});

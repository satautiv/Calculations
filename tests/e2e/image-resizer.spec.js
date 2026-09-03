const { test, expect } = require('@playwright/test');

test.describe('Image Resizer', () => {
  test('shows original size and pre-fills width/height on file selection', async ({ page }) => {
    await page.goto('/index.html#calc/image-resizer');

    await page.setInputFiles('#imgresize-file', 'icons/icon-512.png');

    await expect(page.locator('#imgresize-original-size')).toHaveText('Original size: 512×512');
    await expect(page.locator('#imgresize-width')).toHaveValue('512');
    await expect(page.locator('#imgresize-height')).toHaveValue('512');
  });

  test('locks the aspect ratio when changing width', async ({ page }) => {
    await page.goto('/index.html#calc/image-resizer');

    await page.setInputFiles('#imgresize-file', 'icons/icon-512.png');
    await page.fill('#imgresize-width', '256');

    await expect(page.locator('#imgresize-height')).toHaveValue('256');

    await page.click('#imgresize-calc');
    await expect(page.locator('#imgresize-result .headline')).toHaveText('256×256');

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('.image-download-btn').click(),
    ]);
    expect(download.suggestedFilename()).toBe('icon-512.png');
  });

  test('allows independent width/height when aspect ratio is unlocked', async ({ page }) => {
    await page.goto('/index.html#calc/image-resizer');

    await page.setInputFiles('#imgresize-file', 'icons/icon-512.png');
    await page.uncheck('#imgresize-lock-aspect');
    await page.fill('#imgresize-width', '300');
    await page.fill('#imgresize-height', '100');

    await expect(page.locator('#imgresize-height')).toHaveValue('100');

    await page.click('#imgresize-calc');
    await expect(page.locator('#imgresize-result .headline')).toHaveText('300×100');
  });

  test('resizes by percentage', async ({ page }) => {
    await page.goto('/index.html#calc/image-resizer');

    await page.selectOption('#imgresize-mode', 'percent');
    await expect(page.locator('#imgresize-pixels-fields')).toBeHidden();
    await expect(page.locator('#imgresize-percent-field')).toBeVisible();

    await page.setInputFiles('#imgresize-file', 'icons/icon-512.png');
    await page.fill('#imgresize-percent', '25');
    await page.click('#imgresize-calc');

    await expect(page.locator('#imgresize-result .headline')).toHaveText('128×128');
  });

  test('shows a validation error when no file is chosen', async ({ page }) => {
    await page.goto('/index.html#calc/image-resizer');

    await page.click('#imgresize-calc');

    await expect(page.locator('#imgresize-result')).toContainText('Choose an image file.');
  });

  test('shows a validation error for an invalid percentage', async ({ page }) => {
    await page.goto('/index.html#calc/image-resizer');

    await page.selectOption('#imgresize-mode', 'percent');
    await page.setInputFiles('#imgresize-file', 'icons/icon-512.png');
    await page.fill('#imgresize-percent', '0');
    await page.click('#imgresize-calc');

    await expect(page.locator('#imgresize-result')).toContainText('Enter a valid percentage greater than zero.');
  });
});

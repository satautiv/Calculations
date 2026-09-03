const { test, expect } = require('@playwright/test');

test.describe('Base64 <-> Image Converter', () => {
  test('encodes an image file to a data URI and raw base64', async ({ page }) => {
    await page.goto('/index.html#calc/base64-image-converter');

    await page.setInputFiles('#b64img-file', 'icons/icon-192.png');
    await page.click('#b64img-calc');

    const result = page.locator('#b64img-result');
    await expect(result.locator('.headline')).toContainText('Encoded size:');

    const dataUri = await result.locator('textarea').first().inputValue();
    expect(dataUri).toMatch(/^data:image\/png;base64,/);

    const rawBase64 = await result.locator('textarea').nth(1).inputValue();
    expect(dataUri).toContain(rawBase64);
    expect(rawBase64.startsWith('data:')).toBe(false);
  });

  test('round-trips: decodes the data URI it just encoded back into a downloadable image', async ({ page }) => {
    await page.goto('/index.html#calc/base64-image-converter');

    await page.setInputFiles('#b64img-file', 'icons/icon-192.png');
    await page.click('#b64img-calc');
    const dataUri = await page.locator('#b64img-result textarea').first().inputValue();

    await page.selectOption('#b64img-mode', 'decode');
    await expect(page.locator('#b64img-file-field')).toBeHidden();
    await expect(page.locator('#b64img-input-field')).toBeVisible();

    await page.fill('#b64img-input', dataUri);
    await page.click('#b64img-calc');

    const result = page.locator('#b64img-result');
    await expect(result.locator('.headline')).toHaveText('Decoded image');
    await expect(result.locator('.image-preview')).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      result.locator('.image-download-btn').click(),
    ]);
    expect(download.suggestedFilename()).toBe('image.png');
  });

  test('decodes raw base64 (no data: prefix) using the selected image type', async ({ page }) => {
    await page.goto('/index.html#calc/base64-image-converter');

    await page.setInputFiles('#b64img-file', 'icons/icon-192.png');
    await page.click('#b64img-calc');
    const rawBase64 = await page.locator('#b64img-result textarea').nth(1).inputValue();

    await page.selectOption('#b64img-mode', 'decode');
    await expect(page.locator('#b64img-mime-field')).toBeVisible();
    await page.fill('#b64img-input', rawBase64);
    await page.click('#b64img-calc');

    await expect(page.locator('#b64img-result .headline')).toHaveText('Decoded image');
  });

  test('shows a validation error for invalid base64', async ({ page }) => {
    await page.goto('/index.html#calc/base64-image-converter');

    await page.selectOption('#b64img-mode', 'decode');
    await page.fill('#b64img-input', 'not valid base64 at all!!!');
    await page.click('#b64img-calc');

    await expect(page.locator('#b64img-result')).toContainText('This does not look like valid base64');
  });

  test('shows validation errors for empty input in each mode', async ({ page }) => {
    await page.goto('/index.html#calc/base64-image-converter');

    await page.click('#b64img-calc');
    await expect(page.locator('#b64img-result')).toContainText('Choose an image file.');

    await page.selectOption('#b64img-mode', 'decode');
    await page.click('#b64img-calc');
    await expect(page.locator('#b64img-result')).toContainText('Paste a data URI or base64 string.');
  });
});

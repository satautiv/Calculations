const { test, expect } = require('@playwright/test');

test.describe('Recipe Scaling calculator (dynamic add/remove rows)', () => {
  test('calculates correctly across the default rows plus an added row', async ({ page }) => {
    await page.goto('/index.html#calc/recipe-scaling');

    await page.fill('#recipe-original-servings', '4');
    await page.fill('#recipe-target-servings', '8');

    // 3 ingredient rows are pre-populated on load; add a 4th so the header
    // row must be correctly excluded from the ingredient query (see
    // issue-queue memory: this exact bug class has bitten several
    // dynamic-row calculators before).
    await page.click('#recipe-add-ingredient');

    const rows = page.locator('#recipe-ingredient-list .recipe-ingredient-row:not(.recipe-ingredient-header)');
    await expect(rows).toHaveCount(4);

    const ingredients = [
      { name: 'Flour', qty: '300', unit: 'g' },
      { name: 'Sugar', qty: '150', unit: 'g' },
      { name: 'Butter', qty: '100', unit: 'g' },
      { name: 'Eggs', qty: '2', unit: 'pcs' },
    ];
    for (let i = 0; i < ingredients.length; i++) {
      const row = rows.nth(i);
      await row.locator('.recipe-ing-name').fill(ingredients[i].name);
      await row.locator('.recipe-ing-qty').fill(ingredients[i].qty);
      await row.locator('.recipe-ing-unit').fill(ingredients[i].unit);
    }

    await page.click('#recipe-calc');

    const result = page.locator('#recipe-result');
    await expect(result.locator('.headline')).toContainText('2x');
    await expect(result.locator('table tbody tr')).toHaveCount(4);
    await expect(result).toContainText('600');
    await expect(result).toContainText('300');
    await expect(result).toContainText('200');
    await expect(result).toContainText('4');
  });

  test('removing rows excludes them from the calculation', async ({ page }) => {
    await page.goto('/index.html#calc/recipe-scaling');

    await page.fill('#recipe-original-servings', '2');
    await page.fill('#recipe-target-servings', '4');

    const rows = page.locator('#recipe-ingredient-list .recipe-ingredient-row:not(.recipe-ingredient-header)');
    await expect(rows).toHaveCount(3);

    const firstRow = rows.first();
    await firstRow.locator('.recipe-ing-name').fill('Flour');
    await firstRow.locator('.recipe-ing-qty').fill('100');
    await firstRow.locator('.recipe-ing-unit').fill('g');

    // Remove the last two default rows, leaving only the filled-in one.
    await rows.nth(2).locator('.recipe-remove-btn').click();
    await rows.nth(1).locator('.recipe-remove-btn').click();
    await expect(rows).toHaveCount(1);

    await page.click('#recipe-calc');

    const result = page.locator('#recipe-result');
    await expect(result.locator('.headline')).toContainText('2x');
    await expect(result.locator('table tbody tr')).toHaveCount(1);
    await expect(result).toContainText('200');
  });
});

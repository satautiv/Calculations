const { test, expect } = require('@playwright/test');

// Spot-checks the "How this works" explanatory content added to a
// representative calculator per category (issue #454): present, collapsed
// by default, expandable, and doesn't interfere with the calculator itself.
const CALCULATORS_WITH_HOW_IT_WORKS = [
  'orm',
  'compound-interest',
  'bakers-percentage',
  'bmi-calculator',
  'concrete-calculator',
  'stopping-distance-calculator',
  'sunrise-sunset-calculator',
  'cidr-subnet-calculator',
  'moon-phase-calculator',
];

test.describe('How this works content', () => {
  for (const id of CALCULATORS_WITH_HOW_IT_WORKS) {
    test(`${id} has a collapsed "How this works" section that expands`, async ({ page }) => {
      await page.goto(`/index.html#calc/${id}`);

      const details = page.locator(`#${id} details.how-it-works`);
      await expect(details).toHaveCount(1);
      await expect(details).not.toHaveJSProperty('open', true);

      await details.locator('summary').click();
      await expect(details).toHaveJSProperty('open', true);
      await expect(details.locator('p').first()).not.toBeEmpty();
    });
  }

  test('does not affect the One-Rep Max calculation itself', async ({ page }) => {
    await page.goto('/index.html#calc/orm');

    await page.fill('#orm-weight', '100');
    await page.fill('#orm-reps', '5');
    await page.click('#orm-calc');

    await expect(page.locator('#orm-result .headline')).toContainText('average');
    await expect(page.locator('#orm details.how-it-works')).not.toHaveJSProperty('open', true);
  });
});

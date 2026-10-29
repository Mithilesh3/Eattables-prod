import { expect, test } from '@playwright/test';

/**
 * Search behaviour.
 *
 * The suggestion list is a WAI-ARIA combobox, so these tests drive it the way
 * assistive technology does — by role — rather than by CSS class.
 *
 * Note: the search box is rendered twice (a desktop copy inside the header row
 * and a mobile copy on its own row), with only one visible per viewport, so
 * every lookup targets the visible instance.
 */

function searchBox(page: import('@playwright/test').Page) {
  return page
    .getByRole('combobox', { name: 'Search for products' })
    .locator('visible=true')
    .first();
}

function suggestions(page: import('@playwright/test').Page) {
  return page
    .getByRole('listbox', { name: 'Product suggestions' })
    .locator('visible=true')
    .first();
}

test.describe('Search suggestions', () => {
  test('shows nothing below two characters', async ({ page }) => {
    await page.goto('/');
    await searchBox(page).fill('a');
    await expect(suggestions(page)).toBeHidden();
  });

  test('suggests from two characters, showing name and category', async ({ page }) => {
    await page.goto('/');
    await searchBox(page).fill('al');

    const list = suggestions(page);
    await expect(list).toBeVisible();

    const first = list.getByRole('option').first();
    await expect(first).toContainText('Almonds');
    // Category context is what lets a shopper tell similar products apart.
    await expect(first).toContainText(/^in |in [A-Z]/);
  });

  test('caps the suggestion list at six', async ({ page }) => {
    await page.goto('/');
    // "eat" matches the eattables brand keyword on every own-brand product, so
    // the raw match count is well above the cap — which is the point of the test.
    await searchBox(page).fill('eat');
    await expect(suggestions(page)).toBeVisible();

    const count = await suggestions(page).getByRole('option').count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(6);
  });

  test('returns no suggestions for nonsense input', async ({ page }) => {
    await page.goto('/');
    await searchBox(page).fill('zzzqqq');
    await expect(suggestions(page)).toBeHidden();
  });

  test('closes on Escape', async ({ page }) => {
    await page.goto('/');
    const box = searchBox(page);
    await box.fill('al');
    await expect(suggestions(page)).toBeVisible();

    await box.press('Escape');
    await expect(suggestions(page)).toBeHidden();
  });

  test('keyboard arrows move the active option', async ({ page }) => {
    await page.goto('/');
    const box = searchBox(page);
    await box.fill('al');
    await expect(suggestions(page)).toBeVisible();

    await box.press('ArrowDown');
    await expect(suggestions(page).getByRole('option').first()).toHaveAttribute(
      'aria-selected',
      'true'
    );

    await box.press('ArrowDown');
    await expect(suggestions(page).getByRole('option').nth(1)).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  test('Enter without a selection runs a text search', async ({ page }) => {
    await page.goto('/');
    await searchBox(page).fill('almond');
    await searchBox(page).press('Enter');
    await expect(page).toHaveURL(/\/products\?q=almond/);
  });

  test('empty Enter goes to the full product list', async ({ page }) => {
    await page.goto('/');
    await searchBox(page).fill('   ');
    await searchBox(page).press('Enter');
    await expect(page).toHaveURL(/\/products$/);
  });
});

test.describe('Hindi and colloquial search terms', () => {
  // Aliases implemented in src/lib/catalog/source.ts (SEARCH_ALIASES).
  const expected: Array<[string, RegExp]> = [
    ['badam', /Almonds/],
    ['kaju', /Cashews/],
    ['kishmish', /Raisins/],
    ['khajoor', /Dates/],
    ['achar', /Amla Murabba/],
  ];

  for (const [term, match] of expected) {
    test(`"${term}" finds a matching product`, async ({ page }) => {
      await page.goto('/');
      await searchBox(page).fill(term);

      const list = suggestions(page);
      await expect(list, `no suggestions for "${term}"`).toBeVisible();
      await expect(list.getByRole('option').first()).toContainText(match);
    });
  }

  test('"masala" returns nothing because no spice product is in the demo catalogue', async ({
    page,
  }) => {
    // Documents actual behaviour rather than asserting a product that does not
    // exist. The Whole Spices CATEGORY exists, but it has no demo products, so
    // there is correctly nothing to suggest.
    await page.goto('/');
    await searchBox(page).fill('masala');
    await expect(suggestions(page)).toBeHidden();
  });
});

test.describe('Search suggestion navigation', () => {
  test('a suggestion links to the product detail route', async ({ page }) => {
    await page.goto('/');
    await searchBox(page).fill('al');

    const first = suggestions(page).getByRole('option').first();
    await expect(first).toHaveAttribute('href', /^\/products\/[a-z0-9-]+$/);
  });

  // BLOCKED: /products/[slug] does not exist yet (Step 3). Selecting a
  // suggestion navigates correctly but lands on a 404, so this journey cannot
  // complete. Documented rather than asserted as passing.
  test.fixme('selecting a suggestion opens the product page — BLOCKED: product detail route is Step 3', async ({
    page,
  }) => {
    await page.goto('/');
    await searchBox(page).fill('al');
    await suggestions(page).getByRole('option').first().click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Almonds');
  });
});

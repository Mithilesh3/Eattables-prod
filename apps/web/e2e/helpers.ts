import { type Locator, type Page, expect } from '@playwright/test';

/**
 * Shared helpers for the end-to-end suite.
 *
 * Test data comes from src/content/demo-catalog.ts, which is deterministic and
 * checked in. No prices are asserted anywhere: pricing is placeholder data and
 * the real figures are still pending from the business owner, so asserting on
 * them would bake invented values into the test suite.
 */

/** Multi-variant product — the card offers "Choose option". */
export const MULTI_VARIANT_PRODUCT = 'Premium Almonds';

/** Single-variant product — the card adds to the cart in one tap. */
export const SINGLE_VARIANT_PRODUCT = 'Nut-Stuffed Dates — Emerald';

export const CART_STORAGE_KEY = 'eattables.cart.v1';

/**
 * Clears the guest cart so each test starts from a known state.
 *
 * Deliberately NOT page.addInitScript: that re-runs on every navigation,
 * including page.reload(), which silently wiped the cart mid-test and made the
 * persistence test look like an application failure. Clearing once, before the
 * test navigates, is what "start clean" actually means here.
 */
export async function clearCart(page: Page) {
  await page.goto('/');
  await page.evaluate((key) => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* storage unavailable — nothing to clear */
    }
  }, CART_STORAGE_KEY);
}

/**
 * Product rails render twice — a scroll list for small screens and a grid for
 * larger ones — with only one visible at a time. Tests must act on the visible
 * copy, otherwise they click a `display:none` element.
 */
export function visibleCard(page: Page, productName: string): Locator {
  return page
    .locator('article')
    .filter({ hasText: productName })
    .locator('visible=true')
    .first();
}

/** Fails the test if the page scrolls sideways at the current viewport. */
export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
    };
  });
  // A 1px rounding tolerance: sub-pixel layout can report a harmless difference.
  expect(
    overflow.scrollWidth,
    `page scrolls horizontally: scrollWidth ${overflow.scrollWidth} > clientWidth ${overflow.clientWidth}`
  ).toBeLessThanOrEqual(overflow.clientWidth + 1);
}

/** Collects console errors so a test can assert the page loaded cleanly. */
export function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));
  return errors;
}

/** True when the layout is in its mobile configuration. */
export function isMobileWidth(page: Page): boolean {
  const size = page.viewportSize();
  return !!size && size.width < 1024;
}

import { expect, test } from '@playwright/test';
import {
  MULTI_VARIANT_PRODUCT,
  SINGLE_VARIANT_PRODUCT,
  clearCart,
  isMobileWidth,
  visibleCard,
} from './helpers';

/**
 * Cart interactions.
 *
 * No price, total or stock figure is asserted anywhere. Pricing is placeholder
 * data pending from the business owner, and totals are computed server-side at
 * checkout, which does not exist yet. These tests cover the client behaviour
 * that does exist: adding intent, changing quantity, and the count badge.
 */

test.beforeEach(async ({ page }) => {
  await clearCart(page);
});

test.describe('Add to cart', () => {
  test('a single-option product adds in one tap', async ({ page }) => {
    await page.goto('/');

    const card = visibleCard(page, SINGLE_VARIANT_PRODUCT);
    const addButton = card.getByRole('button', { name: 'Add to cart' });
    await expect(addButton).toBeVisible();
    await addButton.click();

    // The button is replaced in place by the quantity stepper.
    await expect(card.getByText('1', { exact: true })).toBeVisible();
    await expect(addButton).toBeHidden();
  });

  test('a multi-option product asks the shopper to choose', async ({ page }) => {
    await page.goto('/');

    const card = visibleCard(page, MULTI_VARIANT_PRODUCT);
    await expect(card.getByRole('button', { name: 'Choose option' })).toBeVisible();
    await expect(card.getByRole('button', { name: 'Add to cart' })).toBeHidden();
  });

  test('shows a confirmation toast with a View cart shortcut', async ({ page }) => {
    await page.goto('/');
    await visibleCard(page, SINGLE_VARIANT_PRODUCT)
      .getByRole('button', { name: 'Add to cart' })
      .click();

    const toast = page.getByRole('status');
    await expect(toast).toContainText(`${SINGLE_VARIANT_PRODUCT} added to cart`);

    await toast.getByRole('link', { name: 'View cart' }).click();
    await expect(page).toHaveURL(/\/cart$/);
  });
});

test.describe('Quantity stepper', () => {
  test('increments, decrements and removes', async ({ page }) => {
    await page.goto('/');
    const card = visibleCard(page, SINGLE_VARIANT_PRODUCT);
    await card.getByRole('button', { name: 'Add to cart' }).click();

    const increase = card.getByRole('button', { name: /Increase/ });
    const decrease = card.getByRole('button', { name: /Decrease|Remove/ });

    await increase.click();
    await expect(card.getByText('2', { exact: true })).toBeVisible();

    await increase.click();
    await expect(card.getByText('3', { exact: true })).toBeVisible();

    await decrease.click();
    await expect(card.getByText('2', { exact: true })).toBeVisible();

    // At quantity 1 the control becomes a remove action.
    await decrease.click();
    await expect(card.getByRole('button', { name: /Remove/ })).toBeVisible();

    await card.getByRole('button', { name: /Remove/ }).click();
    await expect(card.getByRole('button', { name: 'Add to cart' })).toBeVisible();
  });
});

test.describe('Cart count badge', () => {
  test('updates in the header and, on mobile, the bottom navigation', async ({
    page,
  }) => {
    await page.goto('/');

    const card = visibleCard(page, SINGLE_VARIANT_PRODUCT);
    await card.getByRole('button', { name: 'Add to cart' }).click();
    await card.getByRole('button', { name: /Increase/ }).click();

    // Header cart link shows 2.
    const headerCart = page.getByRole('banner').getByRole('link', { name: /cart/i });
    await expect(headerCart.first()).toContainText('2');

    if (isMobileWidth(page)) {
      const bottomCart = page
        .getByRole('navigation', { name: 'Main' })
        .getByRole('link', { name: /cart/i });
      await expect(bottomCart).toContainText('2');
    }
  });
});

test.describe('Guest cart persistence', () => {
  test('survives a page reload', async ({ page }) => {
    await page.goto('/');
    await visibleCard(page, SINGLE_VARIANT_PRODUCT)
      .getByRole('button', { name: 'Add to cart' })
      .click();
    await expect(
      visibleCard(page, SINGLE_VARIANT_PRODUCT).getByText('1', { exact: true })
    ).toBeVisible();

    await page.reload();

    // The stepper, not the Add button, proves the line was restored.
    await expect(
      visibleCard(page, SINGLE_VARIANT_PRODUCT).getByRole('button', {
        name: /Increase/,
      })
    ).toBeVisible();
  });

  test('stores identifiers and quantity only — never a price', async ({ page }) => {
    // This is the client-side half of the architecture's core invariant: the
    // cart carries intent, the server computes money.
    await page.goto('/');
    await visibleCard(page, SINGLE_VARIANT_PRODUCT)
      .getByRole('button', { name: 'Add to cart' })
      .click();
    await expect(
      visibleCard(page, SINGLE_VARIANT_PRODUCT).getByText('1', { exact: true })
    ).toBeVisible();

    const raw = await page.evaluate(() =>
      window.localStorage.getItem('eattables.cart.v1')
    );
    expect(raw).toBeTruthy();

    const lines = JSON.parse(raw!) as Array<Record<string, unknown>>;
    expect(lines.length).toBe(1);
    expect(Object.keys(lines[0]!).sort()).toEqual([
      'productId',
      'qty',
      'sku',
      'variantId',
    ]);

    const serialised = raw!.toLowerCase();
    for (const forbidden of ['price', 'total', 'mrp', 'discount', 'amount']) {
      expect(serialised, `cart must not persist "${forbidden}"`).not.toContain(forbidden);
    }
  });
});

test.describe('Checkout journey', () => {
  // BLOCKED: /cart renders a "coming next" placeholder and no checkout exists.
  // Order placement, payment and confirmation are Steps 4-5. Asserting a
  // successful order here would be fabricating behaviour that is not built.
  test.fixme('cart page lists added items and proceeds to checkout — BLOCKED: cart/checkout is Step 4', async ({
    page,
  }) => {
    await page.goto('/cart');
    await expect(page.getByText(SINGLE_VARIANT_PRODUCT)).toBeVisible();
  });
});

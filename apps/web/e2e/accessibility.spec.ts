import { expect, test } from '@playwright/test';
import { SINGLE_VARIANT_PRODUCT, isMobileWidth, visibleCard } from './helpers';

/**
 * Accessibility and touch-ergonomics checks.
 *
 * These are behavioural, not cosmetic: an icon-only control with no accessible
 * name is unusable with a screen reader, and a 32px tap target is unusable with
 * a thumb. Both are failures of the brief's "easy for everyone" goal.
 */

test.describe('Keyboard access', () => {
  test('skip link is the first stop and moves focus to main', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');

    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
  });

  test('the add-to-cart control is reachable and operable by keyboard', async ({
    page,
  }) => {
    await page.goto('/');
    const button = visibleCard(page, SINGLE_VARIANT_PRODUCT).getByRole('button', {
      name: 'Add to cart',
    });

    await button.focus();
    await expect(button).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(
      visibleCard(page, SINGLE_VARIANT_PRODUCT).getByRole('button', {
        name: /Increase/,
      })
    ).toBeVisible();
  });
});

test.describe('Accessible names', () => {
  test('every header action exposes a name to assistive technology', async ({ page }) => {
    await page.goto('/');
    const header = page.getByRole('banner');

    // Icon-only at small widths, so these depend on an aria-label.
    await expect(header.getByRole('link', { name: /cart/i })).toHaveCount(1);
    await expect(header.getByRole('link', { name: /login|account/i })).toHaveCount(1);
  });

  test('no interactive control is left without a name', async ({ page }) => {
    await page.goto('/');

    const unnamed = await page.evaluate(() => {
      const problems: string[] = [];
      const controls = document.querySelectorAll('a[href], button');
      controls.forEach((el) => {
        const htmlEl = el as HTMLElement;
        if (htmlEl.offsetParent === null) return; // not rendered
        const text = (htmlEl.innerText || '').trim();
        const label = htmlEl.getAttribute('aria-label');
        const labelledBy = htmlEl.getAttribute('aria-labelledby');
        const title = htmlEl.getAttribute('title');
        if (!text && !label && !labelledBy && !title) {
          problems.push(
            `${htmlEl.tagName.toLowerCase()}${
              htmlEl.getAttribute('href') ? `[href="${htmlEl.getAttribute('href')}"]` : ''
            }`
          );
        }
      });
      return problems;
    });

    expect(unnamed, `controls with no accessible name: ${unnamed.join(', ')}`).toEqual(
      []
    );
  });

  test('the search field is a labelled combobox', async ({ page }) => {
    await page.goto('/');
    const box = page
      .getByRole('combobox', { name: 'Search for products' })
      .locator('visible=true')
      .first();

    await expect(box).toHaveAttribute('aria-expanded', 'false');
    await box.fill('al');
    await expect(box).toHaveAttribute('aria-expanded', 'true');
    await expect(box).toHaveAttribute('aria-controls', /.+/);
  });
});

test.describe('Touch ergonomics', () => {
  test.skip(({ viewport }) => !viewport || viewport.width >= 1024, 'mobile only');

  test('primary tap targets are at least 40px tall', async ({ page }) => {
    await page.goto('/');

    const targets = [
      page.getByRole('button', { name: 'Open menu' }),
      page.getByRole('navigation', { name: 'Main' }).getByRole('link').first(),
      visibleCard(page, SINGLE_VARIANT_PRODUCT).getByRole('button', {
        name: 'Add to cart',
      }),
    ];

    for (const target of targets) {
      const box = await target.boundingBox();
      expect(box).not.toBeNull();
      // 40px is the practical floor; 44px is the WCAG 2.2 AAA target.
      expect(
        box!.height,
        `tap target too small: ${box!.height}px`
      ).toBeGreaterThanOrEqual(40);
    }
  });
});

test.describe('Layout integrity across pages', () => {
  const routes = ['/', '/products', '/categories', '/cart', '/account', '/about'];

  for (const route of routes) {
    test(`${route} has no horizontal scroll or clipped header`, async ({ page }) => {
      await page.goto(route);

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth, `${route} scrolls horizontally`).toBeLessThanOrEqual(
        clientWidth + 1
      );

      // The header must be fully within the viewport width.
      const header = await page.getByRole('banner').boundingBox();
      expect(header).not.toBeNull();
      expect(header!.width).toBeLessThanOrEqual(clientWidth + 1);

      if (isMobileWidth(page)) {
        await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
      }
    });
  }
});

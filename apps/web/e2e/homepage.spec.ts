import { expect, test } from '@playwright/test';
import {
  collectConsoleErrors,
  expectNoHorizontalOverflow,
  isMobileWidth,
} from './helpers';

test.describe('Homepage and navigation', () => {
  test('loads without console errors', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Nourishing lives'
    );
    // Next.js dev injects its own noise; only app-level errors should fail.
    const appErrors = errors.filter(
      (e) => !/favicon|DevTools|Download the React DevTools/i.test(e)
    );
    expect(appErrors, `console errors:\n${appErrors.join('\n')}`).toEqual([]);
  });

  test('renders the key homepage sections', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Shop by category' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Bestsellers' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ordering is simple' })).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
  });

  test('has no horizontal overflow', async ({ page }) => {
    await page.goto('/');
    await expectNoHorizontalOverflow(page);

    // Also check after scrolling to the bottom, where fixed elements live.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expectNoHorizontalOverflow(page);
  });

  test('navigates via the primary navigation', async ({ page }) => {
    await page.goto('/');

    if (isMobileWidth(page)) {
      // Desktop nav is hidden below lg; the drawer is covered separately.
      await expect(page.getByRole('navigation', { name: 'Primary' })).toBeHidden();
      return;
    }

    const nav = page.getByRole('navigation', { name: 'Primary' });
    await expect(nav).toBeVisible();

    await nav.getByRole('link', { name: 'Categories' }).click();
    await expect(page).toHaveURL(/\/categories$/);

    await nav.getByRole('link', { name: 'All Products' }).click();
    await expect(page).toHaveURL(/\/products$/);
  });

  test('keeps the primary navigation to four items', async ({ page }) => {
    await page.goto('/');
    if (isMobileWidth(page)) test.skip();

    const links = page.getByRole('navigation', { name: 'Primary' }).getByRole('link');
    await expect(links).toHaveCount(4);
  });
});

test.describe('Mobile drawer', () => {
  test.skip(({ viewport }) => !viewport || viewport.width >= 1024, 'mobile only');

  test('opens, navigates and closes', async ({ page }) => {
    await page.goto('/');

    const openButton = page.getByRole('button', { name: 'Open menu' });
    await expect(openButton).toBeVisible();
    await openButton.click();

    const drawer = page.getByRole('dialog', { name: 'Menu' });
    await expect(drawer).toBeVisible();

    // Close button works.
    await drawer.getByRole('button', { name: 'Close menu' }).click();
    await expect(drawer).toBeHidden();

    // Reopen and navigate — the drawer must close itself on route change.
    await openButton.click();
    await expect(drawer).toBeVisible();
    await drawer.getByRole('link', { name: 'Categories' }).click();
    await expect(page).toHaveURL(/\/categories$/);
    await expect(page.getByRole('dialog', { name: 'Menu' })).toBeHidden();
  });

  test('locks background scroll while open', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.getByRole('dialog', { name: 'Menu' })).toBeVisible();

    const overflow = await page.evaluate(() => document.body.style.overflow);
    expect(overflow).toBe('hidden');
  });

  test('closes when tapping the backdrop', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Open menu' }).click();
    const drawer = page.getByRole('dialog', { name: 'Menu' });
    await expect(drawer).toBeVisible();

    // Click the far right edge, which is backdrop rather than panel.
    const size = page.viewportSize()!;
    await page.mouse.click(size.width - 10, size.height / 2);
    await expect(drawer).toBeHidden();
  });
});

test.describe('Mobile bottom navigation', () => {
  test.skip(({ viewport }) => !viewport || viewport.width >= 1024, 'mobile only');

  test('is visible and navigates', async ({ page }) => {
    await page.goto('/');

    const bottomNav = page.getByRole('navigation', { name: 'Main' });
    await expect(bottomNav).toBeVisible();
    await expect(bottomNav.getByRole('link')).toHaveCount(4);

    await bottomNav.getByRole('link', { name: 'Categories' }).click();
    await expect(page).toHaveURL(/\/categories$/);
  });

  test('stays reachable after scrolling', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const bottomNav = page.getByRole('navigation', { name: 'Main' });
    await expect(bottomNav).toBeInViewport();
  });

  test('does not cover the footer content', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const footer = page.getByRole('contentinfo');
    const footerBox = await footer.boundingBox();
    const navBox = await page.getByRole('navigation', { name: 'Main' }).boundingBox();

    expect(footerBox).not.toBeNull();
    expect(navBox).not.toBeNull();
    // The spacer div below the footer must keep the two from overlapping.
    expect(footerBox!.y + footerBox!.height).toBeLessThanOrEqual(navBox!.y + 1);
  });
});

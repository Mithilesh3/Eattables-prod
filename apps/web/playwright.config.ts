import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright end-to-end configuration.
 *
 * Viewport coverage is explicit rather than relying on device presets alone,
 * because the brief names the exact widths that matter:
 *   360px  — the narrowest common Android screen
 *   390px  — modern iPhone
 *   768px  — tablet / iPad portrait, the md breakpoint
 *   1440px — standard desktop
 *
 * The 360 and 390 projects also enable touch and a mobile user agent, so the
 * bottom navigation and drawer are exercised the way a phone would.
 */

const PORT = Number(process.env.E2E_PORT ?? 3000);
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  // Serial by default: these tests share one dev server and assert on
  // localStorage cart state, so parallel workers would race each other.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 45_000,
  expect: { timeout: 10_000 },

  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],

  use: {
    baseURL,
    // Artefacts for diagnosing failures, as requested.
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // Video is off by default: recording every failing test slows a full run
    // considerably. Enable per-run with PWVIDEO=1 when diagnosing something
    // that a trace and screenshot do not explain.
    video: process.env.PWVIDEO ? 'retain-on-failure' : 'off',
  },

  projects: [
    {
      name: 'desktop-1440',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'tablet-768',
      use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'mobile-390',
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'mobile-360',
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 360, height: 740 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],

  /**
   * Reuses the dev server already running on :3000 instead of starting a second
   * one. Note: running `next build` while this dev server is live corrupts its
   * .next directory — run e2e and production builds separately.
   */
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});

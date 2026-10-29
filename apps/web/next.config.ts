import type { NextConfig } from 'next';

/**
 * Security headers applied to every response.
 *
 * A Content-Security-Policy is deliberately NOT set yet: it can only be written
 * once the payment gateway (Phase 4) and analytics origins are known, and a
 * placeholder CSP that everyone learns to bypass is worse than none. Adding it
 * is a release blocker before taking real payments.
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // The shared workspace package ships as TypeScript-built ESM.
  transpilePackages: ['@eattables/shared'],

  // Never leak the framework version in response headers.
  poweredByHeader: false,

  typescript: {
    // Type errors must fail the production build, not be deferred to runtime.
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;

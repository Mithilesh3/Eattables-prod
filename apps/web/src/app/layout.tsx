import type { Metadata, Viewport } from 'next';
import './globals.css';

/**
 * Root layout.
 *
 * Phase 1 keeps this minimal on purpose — the header, footer, navigation and
 * brand treatment arrive in Phase 2 once the official brand assets are supplied.
 */

export const metadata: Metadata = {
  title: {
    default: 'Eattables',
    template: '%s | Eattables',
  },
  description:
    'Eattables — premium healthy food, dry fruits, dates and gourmet groceries.',
  // Phase 1 is a scaffold with no public content. Indexing is enabled in Phase 2
  // alongside real pages, sitemap and structured data.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}

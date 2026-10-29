import type { Metadata, Viewport } from 'next';
import { Roboto } from 'next/font/google';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { CartProvider } from '@/lib/cart/CartContext';
import { SearchProvider } from '@/lib/catalog/SearchProvider';
import { getSearchEntries } from '@/lib/catalog/source';
import { ToastProvider } from '@/lib/ui/ToastContext';
import './globals.css';

/**
 * Roboto, loaded through next/font.
 *
 * Next downloads and self-hosts the font files at build time, so there is no
 * runtime request to Google, no render-blocking stylesheet and no layout shift
 * (the fallback metrics are matched automatically). This is the single place
 * fonts are loaded anywhere in the app — no @font-face, no <link> tag, and no
 * second copy of Roboto.
 *
 * Only the four weights the type scale actually uses are requested:
 *   400 body · 500 nav, buttons, product titles · 600 section headings, prices
 *   700 main headings
 */
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal'],
  display: 'swap',
  variable: '--font-roboto',
  fallback: ['Arial', 'Helvetica', 'sans-serif'],
});

export const metadata: Metadata = {
  title: {
    default: 'Eattables — Premium healthy food, dry fruits & gifting',
    template: '%s | Eattables',
  },
  description:
    'Premium dry fruits, dates, gourmet preserves and ready-to-eat health foods. Hygienically packed and cold-chain handled by Entais Retail Pvt. Ltd.',
  // Indexing stays off until real catalogue, pricing and legal pages exist.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2b2150',
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // The compact search index is built once on the server and handed to the
  // client, so suggestions are instant and cost no reads per keystroke.
  const searchEntries = await getSearchEntries();

  return (
    <html lang="en-IN" className={roboto.variable}>
      <body className="flex min-h-screen flex-col antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-brand-900 focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>

        <ToastProvider>
          <CartProvider>
            <SearchProvider entries={searchEntries}>
              <Header />
              <main id="main" className="flex-1">
                {children}
              </main>
              <Footer />
              <MobileBottomNav />
              {/* Clears the fixed bottom bar so the footer is never obscured. */}
              <div aria-hidden="true" className="h-16 lg:hidden" />
            </SearchProvider>
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

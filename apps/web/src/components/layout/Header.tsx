'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/layout/Logo';
import { SearchBar } from '@/components/layout/SearchBar';
import { PRIMARY_NAV, SECONDARY_NAV } from '@/components/layout/nav-links';
import { CartIcon, CloseIcon, MenuIcon, UserIcon } from '@/components/ui/icons';
import { useCart } from '@/lib/cart/CartContext';
import { cn } from '@/lib/utils/cn';

/**
 * Site header.
 *
 * Priorities, in order: search, cart, categories. Search is given permanent
 * real estate on every screen size rather than hidden behind an icon, because
 * typing a product name is the one interaction every shopper already knows.
 *
 * Icon buttons carry visible text labels on desktop — an icon alone is a
 * guessing game for someone who does not shop online often.
 */

function CartCount() {
  const { count, hydrated } = useCart();
  // Hidden until hydration so the server and client markup agree.
  if (!hydrated || count === 0) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 flex min-w-[1.125rem] items-center justify-center rounded-full bg-accent-500 px-1 text-[0.6875rem] font-bold text-white ring-2 ring-white">
      {count > 99 ? '99+' : count}
    </span>
  );
}

function isActive(pathname: string, href: string): boolean {
  const path = href.split('?')[0] ?? href;
  if (path === '/') return pathname === '/';
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white">
      <div className="bg-brand-900 text-center">
        <p className="px-4 py-1.5 text-xs text-white">
          Cold-chain handled · Hygienically packed
        </p>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ---------------------------------------------- row 1: identity */}
        <div className="flex h-16 items-center gap-3 lg:h-20">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            className="-ml-2 flex size-11 items-center justify-center rounded-lg text-brand-700 hover:bg-brand-50 lg:hidden"
          >
            <MenuIcon className="size-6" />
          </button>

          <Logo className="shrink-0" />

          {/* Desktop search: the widest element in the header, on purpose. */}
          <div className="mx-6 hidden max-w-xl flex-1 lg:block">
            <SearchBar />
          </div>

          <div className="ml-auto flex items-center gap-1">
            {/* aria-label is required, not decorative: the text labels below
                are `hidden` under lg, which would otherwise leave these as
                icon-only links with no accessible name at all. */}
            <Link
              href="/account"
              aria-label="Login to your account"
              className="flex min-h-11 items-center gap-2 rounded-lg px-2 py-2 text-brand-700 hover:bg-brand-50 sm:px-3"
            >
              <UserIcon className="size-6" />
              <span className="hidden text-sm font-medium lg:inline">Login</span>
            </Link>

            <Link
              href="/cart"
              aria-label="Cart"
              className="relative flex min-h-11 items-center gap-2 rounded-lg px-2 py-2 text-brand-700 hover:bg-brand-50 sm:px-3"
            >
              <span className="relative">
                <CartIcon className="size-6" />
                <CartCount />
              </span>
              <span className="hidden text-sm font-medium lg:inline">Cart</span>
            </Link>
          </div>
        </div>

        {/* ------------------------------- row 2: search (mobile + tablet) */}
        <div className="pb-3 lg:hidden">
          <SearchBar placeholder="Search for almonds, dates, gifts…" />
        </div>

        {/* ------------------------------------------ row 3: desktop nav */}
        <nav aria-label="Primary" className="hidden border-t border-brand-50 lg:block">
          <ul className="flex items-center gap-1 py-1">
            {PRIMARY_NAV.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  aria-current={isActive(pathname, link.href) ? 'page' : undefined}
                  className={cn(
                    'inline-flex min-h-11 items-center rounded-lg px-4 text-sm font-medium transition-colors',
                    isActive(pathname, link.href)
                      ? 'text-accent-600'
                      : 'text-brand-700 hover:bg-brand-50 hover:text-brand-900'
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* ------------------------------------------------- mobile drawer */}
      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-brand-950/50"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="absolute inset-y-0 left-0 flex w-[85%] max-w-xs flex-col bg-white shadow-raised"
          >
            <div className="flex items-center justify-between border-b border-brand-100 px-4 py-4">
              <Logo />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="flex size-11 items-center justify-center rounded-lg text-brand-700 hover:bg-brand-50"
              >
                <CloseIcon className="size-6" />
              </button>
            </div>

            <nav aria-label="Mobile" className="flex-1 overflow-y-auto p-3">
              <ul className="space-y-1">
                {PRIMARY_NAV.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className={cn(
                        'flex min-h-12 items-center rounded-lg px-4 text-base font-medium',
                        isActive(pathname, link.href)
                          ? 'bg-accent-50 text-accent-700'
                          : 'text-brand-800 hover:bg-brand-50'
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <hr className="my-3 border-brand-100" />

              <ul className="space-y-1">
                {SECONDARY_NAV.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="flex min-h-12 items-center rounded-lg px-4 text-base text-brand-600 hover:bg-brand-50"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="border-t border-brand-100 p-3">
              <Link
                href="/account"
                className="flex min-h-12 items-center gap-3 rounded-lg bg-brand-900 px-4 font-semibold text-white"
              >
                <UserIcon className="size-5" />
                Login / Sign up
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

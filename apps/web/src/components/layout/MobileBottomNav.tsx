'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CartIcon, HomeIcon, GridIcon, UserIcon } from '@/components/ui/icons';
import { useCart } from '@/lib/cart/CartContext';
import { cn } from '@/lib/utils/cn';

/**
 * Persistent bottom navigation on phones.
 *
 * The brief asks that the cart stay reachable throughout shopping. On a phone a
 * sticky header alone does not achieve that — the thumb sits at the bottom of
 * the screen, which is why every Indian shopping app puts the core destinations
 * there. Four items only: Home, Categories, Cart, Account.
 *
 * Hidden from `lg` upward, where the header already shows everything.
 */

const items = [
  { href: '/', label: 'Home', icon: HomeIcon },
  { href: '/categories', label: 'Categories', icon: GridIcon },
  { href: '/cart', label: 'Cart', icon: CartIcon, showsCount: true },
  { href: '/account', label: 'Account', icon: UserIcon },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { count, hydrated } = useCart();

  function active(href: string) {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-100 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="flex">
        {items.map(({ href, label, icon: ItemIcon, showsCount }) => (
          <li key={href} className="flex-1">
            <Link
              href={href}
              aria-current={active(href) ? 'page' : undefined}
              className={cn(
                'flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[0.6875rem] font-medium transition-colors',
                active(href) ? 'text-accent-600' : 'text-brand-500'
              )}
            >
              <span className="relative">
                <ItemIcon className="size-6" />
                {showsCount && hydrated && count > 0 ? (
                  <span className="absolute -right-2 -top-1 flex min-w-[1.0625rem] items-center justify-center rounded-full bg-accent-500 px-1 text-[0.6875rem] font-bold text-white ring-2 ring-white">
                    {count > 99 ? '99+' : count}
                  </span>
                ) : null}
              </span>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

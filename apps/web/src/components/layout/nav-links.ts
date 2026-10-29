/**
 * Primary navigation.
 *
 * Deliberately four items. Every extra link is another decision for someone who
 * just wants to buy almonds, so the test applied here was: would a first-time
 * shopper know what this does, and would they miss it if it were gone?
 *
 * Home lives on the logo (the universal convention). About and Contact are
 * reachable from the footer and the mobile menu — useful, but not shopping.
 */
export interface NavLink {
  href: string;
  label: string;
}

export const PRIMARY_NAV: NavLink[] = [
  { href: '/products', label: 'All Products' },
  { href: '/categories', label: 'Categories' },
  { href: '/products?tag=gifting', label: 'Gifting' },
  { href: '/contact', label: 'Help' },
];

/** Secondary links: available, but kept out of the shopping path. */
export const SECONDARY_NAV: NavLink[] = [
  { href: '/about', label: 'About Eattables' },
  { href: '/contact', label: 'Contact & support' },
];

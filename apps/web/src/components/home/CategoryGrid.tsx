import Link from 'next/link';
import type { Category } from '@eattables/shared';
import { Container, SectionHeading } from '@/components/ui/Container';

/**
 * Category tiles.
 *
 * Simplified from the earlier card layout: a large tap target, a short
 * monogram tile and the category name — nothing else. The previous version
 * carried a tagline, a description and a "Shop now" affordance per card, which
 * is three things to read before making one easy choice.
 *
 * Four across on a phone would be cramped, so it is two, growing to four on
 * desktop.
 */

/** Deterministic tint per tile, so the grid reads as a set rather than noise. */
const TINTS = [
  'bg-accent-50 text-accent-700',
  'bg-leaf-50 text-leaf-600',
  'bg-brand-50 text-brand-700',
  'bg-cream-200 text-brand-700',
];

export function CategoryGrid({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <Container as="section" className="py-10 sm:py-14">
      <SectionHeading title="Shop by category" />

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {categories.map((category, index) => (
          <li key={category.categoryId}>
            <Link
              href={`/products?category=${category.slug}`}
              className="flex min-h-[4.5rem] items-center gap-3 rounded-xl border border-brand-100 bg-white p-3 transition-colors hover:border-accent-300 hover:bg-accent-50/40 sm:gap-4 sm:p-4"
            >
              <span
                aria-hidden="true"
                className={`flex size-12 shrink-0 items-center justify-center rounded-lg font-wordmark text-xl font-bold sm:size-14 ${TINTS[index % TINTS.length]}`}
              >
                {category.name.charAt(0)}
              </span>
              <span className="min-w-0 text-sm font-semibold leading-snug text-brand-900 sm:text-base">
                {category.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}

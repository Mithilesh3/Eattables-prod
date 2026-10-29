import Link from 'next/link';
import type { CatalogItem } from '@eattables/shared';
import { ProductCard } from '@/components/product/ProductCard';
import { Container, SectionHeading } from '@/components/ui/Container';
import { ChevronRightIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils/cn';

/**
 * A titled row of products.
 *
 * Grid on desktop, horizontally scrollable on mobile — a scroll rail reads as
 * native on a phone and avoids a tall column of cards pushing the rest of the
 * homepage below the fold.
 *
 * Renders an honest empty state rather than nothing, so an unseeded catalogue
 * looks deliberate instead of broken.
 */
export function ProductRail({
  eyebrow,
  title,
  description,
  items,
  viewAllHref,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  items: CatalogItem[];
  viewAllHref?: string;
  className?: string;
}) {
  return (
    <Container as="section" className={cn('py-14 sm:py-20', className)}>
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        description={description}
        action={
          viewAllHref && items.length > 0 ? (
            <Link
              href={viewAllHref}
              className="inline-flex items-center gap-1 text-sm font-semibold text-accent-600 hover:text-accent-700"
            >
              View all
              <ChevronRightIcon className="size-4" />
            </Link>
          ) : null
        }
      />

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-200 bg-white px-6 py-14 text-center">
          <p className="font-semibold text-brand-900">No products to show yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-brand-400">
            The catalogue has not been published. Products appear here once they are added
            in the admin panel.
          </p>
        </div>
      ) : (
        <>
          <ul className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:hidden">
            {items.map((item) => (
              <li key={item.productId} className="w-[16rem] shrink-0 snap-start">
                <ProductCard item={item} className="h-full" />
              </li>
            ))}
          </ul>

          <ul className="hidden gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <li key={item.productId}>
                <ProductCard item={item} className="h-full" />
              </li>
            ))}
          </ul>
        </>
      )}
    </Container>
  );
}

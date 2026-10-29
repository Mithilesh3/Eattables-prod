import Link from 'next/link';
import type { CatalogItem } from '@eattables/shared';
import { AddToCartButton } from '@/components/product/AddToCartButton';
import { Price } from '@/components/ui/Price';
import { cn } from '@/lib/utils/cn';

/**
 * Product tile used by every listing surface.
 *
 * Shows a price RANGE across variants rather than a single figure, because most
 * Eattables products are sold in several weights. The actual charge is computed
 * server-side at checkout; this is display only.
 *
 * Product photography is pending from the business owner, so the media slot
 * falls back to a branded monogram rather than a broken-image placeholder.
 */
export function ProductCard({
  item,
  className,
}: {
  item: CatalogItem;
  className?: string;
}) {
  const href = `/products/${item.slug}`;

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-card transition-shadow hover:shadow-raised',
        className
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-cream-100">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image.url}
            alt={item.image.alt}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex size-full items-center justify-center bg-gradient-to-br from-cream-100 to-brand-100"
          >
            <span className="font-wordmark text-4xl font-bold text-brand-300">e</span>
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {item.brand !== 'eattables' ? (
            <span className="w-fit rounded-full bg-brand-900 px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-wider text-white">
              {item.brand}
            </span>
          ) : null}
          {item.tags.includes('new') ? (
            <span className="w-fit rounded-full bg-accent-500 px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-wider text-white">
              New
            </span>
          ) : null}
        </div>

        {!item.inStock ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <span className="rounded-full bg-brand-900 px-3 py-1.5 text-xs font-semibold text-white">
              Out of stock
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[0.6875rem] font-medium uppercase tracking-wider text-brand-400">
          {item.categoryName}
        </p>

        <h3 className="mt-1.5 font-medium leading-snug text-brand-900">
          {/* Stretched link: the whole card is the hit target, but only the
              product name is announced to assistive technology. */}
          <Link href={href} className="after:absolute after:inset-0">
            {item.name}
          </Link>
        </h3>

        <p className="mt-1.5 line-clamp-2 text-sm text-brand-400">
          {item.shortDescription}
        </p>

        <div className="mt-auto pt-3">
          <Price
            priceMin={item.priceMin}
            priceMax={item.priceMax}
            mrp={item.priceMin === item.priceMax ? item.mrpMax : undefined}
          />
          {item.variantCount > 1 ? (
            <p className="mt-1 text-xs text-brand-400">
              {item.variantCount} sizes available
            </p>
          ) : null}

          {/* Sits above the card's stretched link so it stays clickable. */}
          <div className="relative z-10 mt-3">
            <AddToCartButton item={item} size="sm" />
          </div>
        </div>
      </div>
    </article>
  );
}

import { discountPercent, formatPaise } from '@eattables/shared';
import { cn } from '@/lib/utils/cn';

/**
 * Renders a price range plus MRP strike-through and discount badge.
 *
 * Formatting only — it never computes what a customer pays. Checkout recomputes
 * every figure server-side from products/{id}; anything shown here is display.
 */
export function Price({
  priceMin,
  priceMax,
  mrp,
  className,
  size = 'md',
}: {
  priceMin: number;
  priceMax: number;
  mrp?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const isRange = priceMax > priceMin;
  const discount = mrp ? discountPercent(priceMin, mrp) : 0;

  const priceSize = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl',
  }[size];

  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-1', className)}>
      <span className={cn('font-semibold text-brand-900', priceSize)}>
        {formatPaise(priceMin)}
        {isRange ? (
          <span className="font-normal text-brand-400"> – {formatPaise(priceMax)}</span>
        ) : null}
      </span>

      {mrp && discount > 0 ? (
        <>
          <span className="text-xs text-brand-400 line-through sm:text-sm">
            {formatPaise(mrp)}
          </span>
          <span className="rounded bg-leaf-50 px-1.5 py-0.5 text-xs font-semibold text-leaf-600">
            {discount}% off
          </span>
        </>
      ) : null}
    </div>
  );
}

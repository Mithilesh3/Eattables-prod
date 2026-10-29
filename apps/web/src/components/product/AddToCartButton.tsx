'use client';

import { useRouter } from 'next/navigation';
import type { CatalogItem } from '@eattables/shared';
import { QuantityStepper } from '@/components/product/QuantityStepper';
import { useCart } from '@/lib/cart/CartContext';
import { useToast } from '@/lib/ui/ToastContext';
import { cn } from '@/lib/utils/cn';

/**
 * Add to cart, visible directly on the product card.
 *
 * Behaviour depends on the product, so the customer is never asked a question
 * that does not need asking:
 *   - One variant  → adds immediately. One tap, done.
 *   - Many variants → sends them to the product page to choose a size or
 *     flavour, because adding a guessed weight would be worse than asking.
 *   - Already in cart → the button becomes a quantity stepper in place, which
 *     is the pattern Indian grocery apps have made universally familiar.
 *
 * It only ever stores {sku, productId, variantId, qty}. No price is written
 * anywhere on the client; checkout recomputes every figure server-side.
 */
export function AddToCartButton({
  item,
  className,
  size = 'md',
}: {
  item: CatalogItem;
  className?: string;
  size?: 'sm' | 'md';
}) {
  const router = useRouter();
  const { lines, add, setQty, hydrated } = useCart();
  const toast = useToast();

  const singleVariant = item.variantCount === 1;
  const line = hydrated ? lines.find((l) => l.productId === item.productId) : undefined;

  // 40px minimum: an h-9 (36px) control failed the touch-target check on a phone.
  const height = size === 'sm' ? 'h-10' : 'h-11';

  if (!item.inStock) {
    return (
      <button
        type="button"
        disabled
        className={cn(
          height,
          'w-full rounded-lg border border-brand-100 bg-brand-50 px-4 text-sm font-semibold text-brand-400',
          className
        )}
      >
        Out of stock
      </button>
    );
  }

  if (line) {
    return (
      <QuantityStepper
        qty={line.qty}
        onChange={(qty) => setQty(line.sku, qty)}
        className={cn(height, className)}
        label={`Quantity of ${item.name}`}
      />
    );
  }

  function handleAdd() {
    if (!singleVariant) {
      router.push(`/products/${item.slug}`);
      return;
    }
    add({
      sku: `${item.productId}__v1`,
      productId: item.productId,
      variantId: `${item.productId}_v1`,
    });
    toast.show({
      message: `${item.name} added to cart`,
      actionLabel: 'View cart',
      actionHref: '/cart',
    });
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      className={cn(
        height,
        'w-full rounded-lg border border-accent-500 bg-accent-50 px-4 text-sm font-bold text-accent-700 transition-colors hover:bg-accent-500 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500',
        className
      )}
    >
      {singleVariant ? 'Add to cart' : 'Choose option'}
    </button>
  );
}

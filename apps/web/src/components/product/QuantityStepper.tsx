'use client';

import { LIMITS } from '@eattables/shared';
import { cn } from '@/lib/utils/cn';

/**
 * Quantity control: big obvious minus, the number, big obvious plus.
 *
 * Touch targets are a minimum of 40px square so they are comfortable on a
 * phone, and the minus turns into a remove action at qty 1 rather than
 * silently doing nothing — the customer should never tap a dead button.
 */
export function QuantityStepper({
  qty,
  onChange,
  className,
  label = 'Quantity',
}: {
  qty: number;
  onChange: (qty: number) => void;
  className?: string;
  label?: string;
}) {
  const atMax = qty >= LIMITS.maxQtyPerLine;

  return (
    <div
      className={cn(
        'flex w-full items-center justify-between rounded-lg border border-accent-500 bg-accent-500 text-white',
        className
      )}
    >
      <button
        type="button"
        onClick={() => onChange(qty - 1)}
        aria-label={qty === 1 ? `Remove ${label}` : `Decrease ${label}`}
        className="flex h-full min-w-10 items-center justify-center rounded-l-lg text-lg font-bold transition-colors hover:bg-accent-600"
      >
        {qty === 1 ? '🗑' : '−'}
      </button>

      <span aria-live="polite" className="px-2 text-sm font-bold tabular-nums">
        {qty}
      </span>

      <button
        type="button"
        onClick={() => onChange(qty + 1)}
        disabled={atMax}
        aria-label={`Increase ${label}`}
        title={atMax ? `Maximum ${LIMITS.maxQtyPerLine} per item` : undefined}
        className="flex h-full min-w-10 items-center justify-center rounded-r-lg text-lg font-bold transition-colors hover:bg-accent-600 disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}

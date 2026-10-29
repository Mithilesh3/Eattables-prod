'use client';

import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { LIMITS } from '@eattables/shared';

/**
 * Guest cart, held in localStorage.
 *
 * Scope and intent:
 *   - Stores IDENTIFIERS AND QUANTITY ONLY — never a price. This mirrors the
 *     Firestore rule on /carts/{uid} and the architecture's core invariant: the
 *     client sends intent, the server computes money.
 *   - For a signed-in user this will mirror into carts/{uid} and merge on login
 *     (Phase 4). Until then it is local-only, which is correct for guest browsing.
 *   - Totals are deliberately NOT computed here. Phase 4 calls the
 *     cart.getSummary callable for authoritative pricing.
 */

export interface CartLine {
  sku: string;
  productId: string;
  variantId: string;
  qty: number;
}

interface CartState {
  lines: CartLine[];
  /** Total units across all lines — what the navbar badge shows. */
  count: number;
  /** False until localStorage has been read, so SSR and first paint agree. */
  hydrated: boolean;
  add: (line: Omit<CartLine, 'qty'>, qty?: number) => void;
  setQty: (sku: string, qty: number) => void;
  remove: (sku: string) => void;
  clear: () => void;
}

const STORAGE_KEY = 'eattables.cart.v1';

const CartContext = createContext<CartState | null>(null);

function parse(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data
      .filter(
        (l): l is CartLine =>
          typeof l === 'object' &&
          l !== null &&
          typeof (l as CartLine).sku === 'string' &&
          Number.isInteger((l as CartLine).qty)
      )
      .map((l) => ({
        sku: l.sku,
        productId: l.productId,
        variantId: l.variantId,
        // Clamp on read: a hand-edited localStorage value must not exceed the
        // limits the server enforces anyway.
        qty: Math.min(Math.max(l.qty, 1), LIMITS.maxQtyPerLine),
      }))
      .slice(0, LIMITS.maxCartItems);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLines(parse(window.localStorage.getItem(STORAGE_KEY)));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const add = useCallback((line: Omit<CartLine, 'qty'>, qty = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.sku === line.sku);
      if (existing) {
        return prev.map((l) =>
          l.sku === line.sku
            ? { ...l, qty: Math.min(l.qty + qty, LIMITS.maxQtyPerLine) }
            : l
        );
      }
      if (prev.length >= LIMITS.maxCartItems) return prev;
      return [...prev, { ...line, qty: Math.min(qty, LIMITS.maxQtyPerLine) }];
    });
  }, []);

  const setQty = useCallback((sku: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.sku !== sku)
        : prev.map((l) =>
            l.sku === sku ? { ...l, qty: Math.min(qty, LIMITS.maxQtyPerLine) } : l
          )
    );
  }, []);

  const remove = useCallback((sku: string) => {
    setLines((prev) => prev.filter((l) => l.sku !== sku));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartState>(
    () => ({
      lines,
      count: lines.reduce((sum, l) => sum + l.qty, 0),
      hydrated,
      add,
      setQty,
      remove,
      clear,
    }),
    [lines, hydrated, add, setQty, remove, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}

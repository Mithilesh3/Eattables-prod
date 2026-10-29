import type { Paise } from '../types/common.js';

/**
 * Money helpers. All arithmetic happens on integer paise; rupees exist only at
 * the display boundary.
 */

export class MoneyError extends Error {}

/** Throws unless `value` is a safe, non-negative integer count of paise. */
export function assertPaise(value: number, label = 'amount'): asserts value is Paise {
  if (!Number.isInteger(value)) {
    throw new MoneyError(`${label} must be an integer number of paise, got ${value}`);
  }
  if (value < 0) {
    throw new MoneyError(`${label} must not be negative, got ${value}`);
  }
  if (!Number.isSafeInteger(value)) {
    throw new MoneyError(`${label} exceeds the safe integer range`);
  }
}

/** Sums paise amounts with validation. Empty list sums to 0. */
export function sumPaise(values: readonly number[]): Paise {
  let total = 0;
  for (const v of values) {
    assertPaise(v, 'line amount');
    total += v;
  }
  assertPaise(total, 'total');
  return total;
}

/** unitPrice × qty, with qty constrained to a sane positive integer. */
export function lineTotal(unitPrice: number, qty: number): Paise {
  assertPaise(unitPrice, 'unitPrice');
  if (!Number.isInteger(qty) || qty < 1) {
    throw new MoneyError(`qty must be a positive integer, got ${qty}`);
  }
  const total = unitPrice * qty;
  assertPaise(total, 'lineTotal');
  return total;
}

/**
 * Converts a rupee-denominated input (e.g. an admin price field) to paise.
 * Parsing via string avoids the classic `19.99 * 100 === 1998.9999…` bug.
 */
export function rupeesToPaise(rupees: number | string): Paise {
  const str = typeof rupees === 'number' ? rupees.toFixed(2) : rupees.trim();
  if (!/^-?\d+(\.\d{1,2})?$/.test(str)) {
    throw new MoneyError(`cannot parse "${rupees}" as a rupee amount`);
  }
  const negative = str.startsWith('-');
  const [whole = '0', frac = ''] = str.replace('-', '').split('.');
  const paise = Number(whole) * 100 + Number(frac.padEnd(2, '0'));
  if (negative) {
    throw new MoneyError('rupee amount must not be negative');
  }
  assertPaise(paise, 'paise');
  return paise;
}

/** Display only. Never feed the result back into arithmetic. */
export function formatPaise(paise: number, locale = 'en-IN'): string {
  assertPaise(paise, 'paise');
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(paise / 100);
}

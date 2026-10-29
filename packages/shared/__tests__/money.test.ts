import { describe, expect, it } from 'vitest';
import {
  MoneyError,
  assertPaise,
  formatPaise,
  lineTotal,
  rupeesToPaise,
  sumPaise,
} from '../src/core/money.js';

describe('assertPaise', () => {
  it('accepts non-negative integers', () => {
    expect(() => assertPaise(0)).not.toThrow();
    expect(() => assertPaise(24950)).not.toThrow();
  });

  it('rejects floats — money must never be fractional paise', () => {
    expect(() => assertPaise(249.5)).toThrow(MoneyError);
  });

  it('rejects negative amounts', () => {
    expect(() => assertPaise(-1)).toThrow(MoneyError);
  });

  it('rejects unsafe integers', () => {
    expect(() => assertPaise(Number.MAX_SAFE_INTEGER + 2)).toThrow(MoneyError);
  });
});

describe('rupeesToPaise', () => {
  it('converts without floating-point drift', () => {
    // 19.99 * 100 === 1998.9999999999998 in IEEE-754. String parsing avoids it.
    expect(rupeesToPaise('19.99')).toBe(1999);
    expect(rupeesToPaise(19.99)).toBe(1999);
    expect(rupeesToPaise('0.07')).toBe(7);
    expect(rupeesToPaise('1234.50')).toBe(123450);
  });

  it('pads a single decimal place', () => {
    expect(rupeesToPaise('5.5')).toBe(550);
  });

  it('handles whole rupees', () => {
    expect(rupeesToPaise('100')).toBe(10000);
  });

  it('rejects more than two decimal places', () => {
    expect(() => rupeesToPaise('1.234')).toThrow(MoneyError);
  });

  it('rejects junk and negatives', () => {
    expect(() => rupeesToPaise('abc')).toThrow(MoneyError);
    expect(() => rupeesToPaise('-5.00')).toThrow(MoneyError);
  });
});

describe('sumPaise', () => {
  it('sums exactly, with no accumulated drift', () => {
    const lines = Array.from({ length: 1000 }, () => rupeesToPaise('0.07'));
    expect(sumPaise(lines)).toBe(7000);
  });

  it('returns 0 for an empty basket', () => {
    expect(sumPaise([])).toBe(0);
  });

  it('propagates validation failures from any line', () => {
    expect(() => sumPaise([100, 2.5])).toThrow(MoneyError);
  });
});

describe('lineTotal', () => {
  it('multiplies price by quantity', () => {
    expect(lineTotal(24950, 3)).toBe(74850);
  });

  it('rejects zero, negative and fractional quantities', () => {
    expect(() => lineTotal(100, 0)).toThrow(MoneyError);
    expect(() => lineTotal(100, -1)).toThrow(MoneyError);
    expect(() => lineTotal(100, 1.5)).toThrow(MoneyError);
  });
});

describe('formatPaise', () => {
  it('renders paise as rupees for display', () => {
    // Assert on the digits rather than the currency glyph, which varies by ICU build.
    expect(formatPaise(24950)).toContain('249.50');
    expect(formatPaise(0)).toContain('0.00');
  });

  it('refuses to format an invalid amount', () => {
    expect(() => formatPaise(1.5)).toThrow(MoneyError);
  });
});

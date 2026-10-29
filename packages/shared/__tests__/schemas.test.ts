import { describe, expect, it } from 'vitest';
import {
  addressInputSchema,
  cartItemSchema,
  placeOrderInputSchema,
} from '../src/schemas/index.js';

const validAddress = {
  recipientName: 'Test Recipient',
  recipientPhone: '9999999999',
  line1: '12 Example Street',
  city: 'Lucknow',
  state: 'Uttar Pradesh',
  pincode: '226001',
};

describe('addressInputSchema', () => {
  it('accepts a well-formed address and applies defaults', () => {
    const parsed = addressInputSchema.parse(validAddress);
    expect(parsed.country).toBe('IN');
    expect(parsed.label).toBe('home');
    expect(parsed.isDefault).toBe(false);
  });

  it('rejects malformed PIN codes', () => {
    for (const pincode of ['12345', '0226001', 'ABC123', '226 001', '']) {
      expect(addressInputSchema.safeParse({ ...validAddress, pincode }).success).toBe(
        false
      );
    }
  });

  it('rejects unknown keys rather than silently dropping them', () => {
    // Strict mode is what stops a client smuggling extra fields into a write.
    const result = addressInputSchema.safeParse({
      ...validAddress,
      serviceable: true,
      isAdmin: true,
    });
    expect(result.success).toBe(false);
  });

  it('enforces length bounds', () => {
    expect(
      addressInputSchema.safeParse({ ...validAddress, recipientName: '' }).success
    ).toBe(false);
    expect(
      addressInputSchema.safeParse({ ...validAddress, line1: 'x'.repeat(201) }).success
    ).toBe(false);
  });
});

describe('cartItemSchema', () => {
  const validItem = {
    sku: 'EAT-DF-ALM-500G',
    productId: 'prod_almonds',
    variantId: 'var_500g',
    qty: 2,
  };

  it('accepts identifiers and quantity', () => {
    expect(cartItemSchema.parse(validItem).qty).toBe(2);
  });

  it('REJECTS any attempt to supply a price', () => {
    // The central invariant of the whole cart design.
    for (const money of [
      { unitPrice: 1 },
      { price: 1 },
      { lineTotal: 1 },
      { discount: 500 },
    ]) {
      expect(cartItemSchema.safeParse({ ...validItem, ...money }).success).toBe(false);
    }
  });

  it('rejects non-positive, fractional and oversized quantities', () => {
    for (const qty of [0, -1, 1.5, 100]) {
      expect(cartItemSchema.safeParse({ ...validItem, qty }).success).toBe(false);
    }
  });

  it('rejects malformed SKUs', () => {
    for (const sku of ['lowercase-sku', 'has space', 'ab', 'bad_underscore']) {
      expect(cartItemSchema.safeParse({ ...validItem, sku }).success).toBe(false);
    }
  });
});

describe('placeOrderInputSchema', () => {
  const valid = {
    addressId: 'addr_1',
    paymentMethod: 'online' as const,
    idempotencyKey: '123e4567-e89b-42d3-a456-426614174000',
  };

  it('accepts intent-only input', () => {
    expect(placeOrderInputSchema.parse(valid).addressId).toBe('addr_1');
  });

  it('REJECTS client-supplied totals', () => {
    // If this ever passes, the server is trusting the client with money.
    for (const injected of [
      { grandTotal: 1 },
      { totals: { grandTotal: 1 } },
      { items: [] },
      { paymentStatus: 'paid' },
    ]) {
      expect(placeOrderInputSchema.safeParse({ ...valid, ...injected }).success).toBe(
        false
      );
    }
  });

  it('requires a UUID idempotency key', () => {
    expect(
      placeOrderInputSchema.safeParse({ ...valid, idempotencyKey: 'not-a-uuid' }).success
    ).toBe(false);
  });
});

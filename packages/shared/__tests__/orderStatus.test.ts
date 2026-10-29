import { describe, expect, it } from 'vitest';
import {
  ALLOWED_TRANSITIONS,
  IllegalTransitionError,
  assertTransition,
  canCustomerCancel,
  canTransition,
  isTerminal,
} from '../src/core/orderStatus.js';
import { ORDER_STATUSES } from '../src/types/common.js';

describe('order status machine', () => {
  it('covers every declared status', () => {
    for (const status of ORDER_STATUSES) {
      expect(ALLOWED_TRANSITIONS[status]).toBeDefined();
    }
  });

  it('allows the happy path end to end', () => {
    const happyPath = [
      'CREATED',
      'CONFIRMED',
      'PROCESSING',
      'PACKED',
      'SHIPPED',
      'DELIVERED',
    ] as const;
    for (let i = 0; i < happyPath.length - 1; i++) {
      expect(canTransition(happyPath[i]!, happyPath[i + 1]!)).toBe(true);
    }
  });

  it('refuses to skip payment confirmation', () => {
    // The exploit this blocks: jumping an unpaid order straight into fulfilment.
    expect(canTransition('CREATED', 'PROCESSING')).toBe(false);
    expect(canTransition('CREATED', 'SHIPPED')).toBe(false);
    expect(canTransition('CREATED', 'DELIVERED')).toBe(false);
  });

  it('refuses to move backwards', () => {
    expect(canTransition('SHIPPED', 'PACKED')).toBe(false);
    expect(canTransition('DELIVERED', 'SHIPPED')).toBe(false);
    expect(canTransition('CONFIRMED', 'CREATED')).toBe(false);
  });

  it('treats terminal states as final', () => {
    for (const terminal of ['DELIVERED', 'CANCELLED', 'FAILED'] as const) {
      expect(isTerminal(terminal)).toBe(true);
      expect(ALLOWED_TRANSITIONS[terminal]).toHaveLength(0);
      for (const target of ORDER_STATUSES) {
        expect(canTransition(terminal, target)).toBe(false);
      }
    }
  });

  it('stops cancellation once the order is packed', () => {
    expect(canTransition('PACKED', 'CANCELLED')).toBe(false);
    expect(canTransition('SHIPPED', 'CANCELLED')).toBe(false);
  });

  it('permits cancellation only before packing', () => {
    expect(canCustomerCancel('CREATED')).toBe(true);
    expect(canCustomerCancel('CONFIRMED')).toBe(true);
    expect(canCustomerCancel('PROCESSING')).toBe(true);
    expect(canCustomerCancel('PACKED')).toBe(false);
    expect(canCustomerCancel('SHIPPED')).toBe(false);
    expect(canCustomerCancel('DELIVERED')).toBe(false);
  });

  it('throws a typed error on an illegal transition', () => {
    expect(() => assertTransition('CREATED', 'DELIVERED')).toThrow(
      IllegalTransitionError
    );
    expect(() => assertTransition('CREATED', 'CONFIRMED')).not.toThrow();
  });

  it('never lists a status as its own successor', () => {
    for (const status of ORDER_STATUSES) {
      expect(canTransition(status, status)).toBe(false);
    }
  });
});

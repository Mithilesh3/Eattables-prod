import type { OrderStatus } from '../types/common.js';

/**
 * The single source of truth for legal order status transitions.
 *
 * This map is checked inside the Firestore transaction that performs any
 * transition (Phase 4). Illegal transitions are rejected, never logged-and-allowed.
 * Keeping it here — in a pure, dependency-free module — means the same rules are
 * used by Cloud Functions, the admin UI's affordances, and the test suite.
 */
export const ALLOWED_TRANSITIONS: Readonly<Record<OrderStatus, readonly OrderStatus[]>> =
  Object.freeze({
    // Stock is reserved; awaiting webhook-verified payment.
    CREATED: ['CONFIRMED', 'FAILED', 'CANCELLED'],
    // Payment verified server-side; reservation committed.
    CONFIRMED: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['PACKED', 'CANCELLED'],
    // After PACKED a customer-initiated stop becomes a return, not a cancellation.
    PACKED: ['SHIPPED'],
    SHIPPED: ['DELIVERED'],
    // Terminal states.
    DELIVERED: [],
    CANCELLED: [],
    FAILED: [],
  });

/** Statuses from which a customer may still request cancellation. */
export const CUSTOMER_CANCELLABLE: readonly OrderStatus[] = [
  'CREATED',
  'CONFIRMED',
  'PROCESSING',
];

export const TERMINAL_STATUSES: readonly OrderStatus[] = [
  'DELIVERED',
  'CANCELLED',
  'FAILED',
];

export function isTerminal(status: OrderStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function canCustomerCancel(status: OrderStatus): boolean {
  return CUSTOMER_CANCELLABLE.includes(status);
}

export class IllegalTransitionError extends Error {
  constructor(
    readonly from: OrderStatus,
    readonly to: OrderStatus
  ) {
    super(`Illegal order status transition: ${from} -> ${to}`);
    this.name = 'IllegalTransitionError';
  }
}

/** Throws unless the transition is legal. Call inside the transaction. */
export function assertTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransition(from, to)) {
    throw new IllegalTransitionError(from, to);
  }
}

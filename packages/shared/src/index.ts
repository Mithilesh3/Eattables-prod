/**
 * @eattables/shared — the contract between every client and the backend.
 *
 * Only types, Zod schemas and PURE functions belong here. Anything that reads or
 * writes data, or that decides what a customer is charged, lives in `functions/`.
 */

export * from './types/common.js';
export * from './core/money.js';
export * from './core/orderStatus.js';
export * from './schemas/index.js';

/** Firestore collection names, so no string literal is ever typed twice. */
export const COLLECTIONS = {
  users: 'users',
  addresses: 'addresses',
  categories: 'categories',
  products: 'products',
  catalogIndex: 'catalogIndex',
  carts: 'carts',
  inventory: 'inventory',
  inventoryLedger: 'inventoryLedger',
  stockReservations: 'stockReservations',
  orders: 'orders',
  orderEvents: 'events',
  paymentIntents: 'paymentIntents',
  paymentEvents: 'paymentEvents',
  idempotencyKeys: 'idempotencyKeys',
  adminAuditLogs: 'adminAuditLogs',
  counters: 'counters',
  config: 'config',
} as const;

/**
 * Hard limits enforced server-side. The order-line cap is not arbitrary: a
 * Firestore transaction allows 500 document writes, and each order line touches
 * an inventory doc plus a ledger entry.
 */
export const LIMITS = {
  maxOrderLines: 50,
  maxQtyPerLine: 99,
  maxCartItems: 100,
  maxAddressesPerUser: 20,
  maxProductImageBytes: 5 * 1024 * 1024,
} as const;

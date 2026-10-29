/**
 * Core domain types shared by the web app, Cloud Functions and (later) mobile.
 *
 * NOTE ON MONEY: every monetary value in this system is an integer number of
 * paise. ₹249.50 is 24950. Floating-point rupees accumulate sub-paisa drift that
 * eventually fails GST reconciliation, so `number` here always means paise.
 */

/** An integer amount in paise. Never a float, never rupees. */
export type Paise = number;

export const CURRENCY = 'INR' as const;

/**
 * Authorization roles. The authoritative copy lives in the Firebase Auth custom
 * claim `role`; the `role` field on users/{uid} is a display mirror only and must
 * never be read by Security Rules.
 */
export const ROLES = [
  'customer',
  'catalog_manager',
  'ops',
  'admin',
  'superadmin',
] as const;
export type Role = (typeof ROLES)[number];

export const STAFF_ROLES: readonly Role[] = [
  'catalog_manager',
  'ops',
  'admin',
  'superadmin',
];

/** Separation of duty: whoever edits prices must not be able to touch orders. */
export const ROLE_PERMISSIONS: Record<Role, readonly string[]> = {
  customer: [],
  catalog_manager: ['catalog:write', 'inventory:read', 'inventory:adjust'],
  ops: ['orders:read', 'orders:update', 'inventory:read', 'inventory:adjust'],
  admin: [
    'catalog:write',
    'orders:read',
    'orders:update',
    'inventory:read',
    'inventory:adjust',
    'customers:read',
    'audit:read',
  ],
  superadmin: ['*'],
};

/** MVP order lifecycle. Returns/refund states arrive with the return policy. */
export const ORDER_STATUSES = [
  'CREATED',
  'CONFIRMED',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'FAILED',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = [
  'pending',
  'authorized',
  'paid',
  'failed',
  'refunded',
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export type ProductStatus = 'draft' | 'active' | 'archived';

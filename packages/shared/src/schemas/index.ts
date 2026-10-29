import { z } from 'zod';

/**
 * Zod schemas shared by client and server.
 *
 * The SAME schema validates in the browser (instant form feedback) and inside the
 * Cloud Function (the authoritative check), so the two can never drift apart.
 *
 * All object schemas are `.strict()`: unknown keys are rejected rather than
 * silently ignored, which stops a client from smuggling extra fields into a write.
 */

/** Indian postal code: six digits, first digit non-zero. */
export const pincodeSchema = z
  .string()
  .regex(/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit Indian PIN code');

/** E.164-ish; the authoritative check is Firebase Auth phone verification. */
export const phoneSchema = z
  .string()
  .regex(/^[+]?[0-9]{10,15}$/, 'Enter a valid phone number');

export const skuSchema = z
  .string()
  .min(3)
  .max(64)
  .regex(/^[A-Z0-9-]+$/, 'SKU must be uppercase letters, digits and hyphens');

export const addressInputSchema = z
  .object({
    label: z.enum(['home', 'work', 'other']).default('home'),
    recipientName: z.string().trim().min(1).max(100),
    recipientPhone: phoneSchema,
    line1: z.string().trim().min(1).max(200),
    line2: z.string().trim().max(200).optional(),
    landmark: z.string().trim().max(120).optional(),
    city: z.string().trim().min(1).max(100),
    state: z.string().trim().min(1).max(100),
    pincode: pincodeSchema,
    country: z.literal('IN').default('IN'),
    isDefault: z.boolean().default(false),
  })
  .strict();
export type AddressInput = z.infer<typeof addressInputSchema>;

/**
 * A cart line carries IDENTIFIERS AND QUANTITY ONLY — never a price. Prices are
 * resolved server-side at summary and checkout time. Mirrored by the Firestore
 * rule on /carts/{userId}, which rejects any money-bearing key.
 */
export const cartItemSchema = z
  .object({
    sku: skuSchema,
    productId: z.string().min(1).max(64),
    variantId: z.string().min(1).max(64),
    qty: z.int().min(1).max(99),
  })
  .strict();
export type CartItem = z.infer<typeof cartItemSchema>;

export const cartSchema = z
  .object({
    userId: z.string().min(1),
    items: z.array(cartItemSchema).max(100),
  })
  .strict();
export type Cart = z.infer<typeof cartSchema>;

/**
 * Input to checkout.placeOrder. Note what is ABSENT: no prices, no totals, no
 * item list with values. The server loads the cart from Firestore and computes
 * every figure itself.
 */
export const placeOrderInputSchema = z
  .object({
    addressId: z.string().min(1).max(64),
    paymentMethod: z.enum(['online']),
    idempotencyKey: z.uuid(),
  })
  .strict();
export type PlaceOrderInput = z.infer<typeof placeOrderInputSchema>;

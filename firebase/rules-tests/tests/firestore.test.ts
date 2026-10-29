import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  type RulesTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import {
  ALICE,
  BOB,
  claims,
  createTestEnv,
  validAddress,
  validUser,
} from '../helpers.js';

/**
 * Firestore Security Rules tests.
 *
 * The NEGATIVE tests are the valuable ones: each asserts that a specific attack
 * is impossible. If one of these ever starts passing, money or customer data is
 * exposed.
 */

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await createTestEnv();
});

afterAll(async () => {
  await testEnv?.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();

  // Seed via a context that bypasses rules, mimicking Cloud Functions.
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'products/p_active'), {
      name: 'Premium Almonds',
      status: 'active',
      categoryId: 'c_dryfruits',
      variants: [{ sku: 'EAT-DF-ALM-500G', sellingPrice: 100000 }],
    });
    await setDoc(doc(db, 'products/p_draft'), { name: 'Unreleased', status: 'draft' });
    await setDoc(doc(db, 'categories/c_dryfruits'), {
      name: 'Dry Fruits',
      isActive: true,
    });
    await setDoc(doc(db, 'categories/c_hidden'), { name: 'Hidden', isActive: false });
    await setDoc(doc(db, 'catalogIndex/shard0'), { items: [], version: 1 });
    await setDoc(doc(db, 'users', ALICE), validUser);
    await setDoc(doc(db, 'users', ALICE, 'addresses', 'addr1'), validAddress);
    await setDoc(doc(db, 'carts', ALICE), { userId: ALICE, items: [] });
    await setDoc(doc(db, 'orders/o_alice'), {
      userId: ALICE,
      status: 'CONFIRMED',
      paymentStatus: 'paid',
      totals: { grandTotal: 250000 },
    });
    await setDoc(doc(db, 'orders/o_alice/events/e1'), {
      from: 'CREATED',
      to: 'CONFIRMED',
    });
    await setDoc(doc(db, 'inventory/EAT-DF-ALM-500G'), {
      onHand: 10,
      reserved: 0,
      available: 10,
    });
    await setDoc(doc(db, 'inventoryLedger/led1'), {
      sku: 'EAT-DF-ALM-500G',
      type: 'receipt',
      qtyDelta: 10,
    });
    await setDoc(doc(db, 'paymentIntents/pi_1'), { orderId: 'o_alice', amount: 250000 });
    await setDoc(doc(db, 'paymentEvents/evt_1'), { processingStatus: 'processed' });
    await setDoc(doc(db, 'adminAuditLogs/log1'), { action: 'price_change' });
    await setDoc(doc(db, 'config/serviceability'), { pincodes: [] });
    await setDoc(doc(db, 'config/taxRates'), { note: 'not public' });
    await setDoc(doc(db, 'coupons/SAVE10'), { value: 10 });
  });
});

const anon = () => testEnv.unauthenticatedContext().firestore();
const alice = () => testEnv.authenticatedContext(ALICE, claims.customer).firestore();
const bob = () => testEnv.authenticatedContext(BOB, claims.customer).firestore();
const opsUser = () => testEnv.authenticatedContext('ops_uid', claims.ops).firestore();
const adminUser = () =>
  testEnv.authenticatedContext('admin_uid', claims.admin).firestore();
const catalogManager = () =>
  testEnv.authenticatedContext('cm_uid', claims.catalogManager).firestore();
const superadminUser = () =>
  testEnv.authenticatedContext('sa_uid', claims.superadmin).firestore();

// ---------------------------------------------------------------- catalogue
describe('products', () => {
  it('lets anyone read an active product', async () => {
    await assertSucceeds(getDoc(doc(anon(), 'products/p_active')));
  });

  it('hides draft products from the public', async () => {
    await assertFails(getDoc(doc(anon(), 'products/p_draft')));
    await assertFails(getDoc(doc(alice(), 'products/p_draft')));
  });

  it('lets staff read drafts', async () => {
    await assertSucceeds(getDoc(doc(opsUser(), 'products/p_draft')));
  });

  it('BLOCKS a customer changing a price', async () => {
    // The headline guarantee of the whole architecture.
    await assertFails(
      updateDoc(doc(alice(), 'products/p_active'), {
        variants: [{ sku: 'EAT-DF-ALM-500G', sellingPrice: 1 }],
      })
    );
  });

  it('BLOCKS even an admin writing products directly from a client', async () => {
    // Catalogue writes go through audited callables, never the client SDK.
    await assertFails(updateDoc(doc(adminUser(), 'products/p_active'), { name: 'x' }));
  });

  it('blocks anonymous product creation and deletion', async () => {
    await assertFails(setDoc(doc(anon(), 'products/p_new'), { status: 'active' }));
    await assertFails(deleteDoc(doc(alice(), 'products/p_active')));
  });
});

describe('categories and catalogIndex', () => {
  it('exposes active categories and the index publicly', async () => {
    await assertSucceeds(getDoc(doc(anon(), 'categories/c_dryfruits')));
    await assertSucceeds(getDoc(doc(anon(), 'catalogIndex/shard0')));
  });

  it('hides inactive categories', async () => {
    await assertFails(getDoc(doc(anon(), 'categories/c_hidden')));
  });

  it('blocks writes to the index', async () => {
    await assertFails(setDoc(doc(alice(), 'catalogIndex/shard0'), { items: [] }));
  });
});

// --------------------------------------------------------------- user data
describe('users', () => {
  it('lets the owner read their profile', async () => {
    await assertSucceeds(getDoc(doc(alice(), 'users', ALICE)));
  });

  it('BLOCKS reading another customer profile', async () => {
    await assertFails(getDoc(doc(bob(), 'users', ALICE)));
  });

  it('allows an owner to update an allowlisted field', async () => {
    await assertSucceeds(
      updateDoc(doc(alice(), 'users', ALICE), { displayName: 'Alice A.' })
    );
  });

  it('BLOCKS self-promotion to admin', async () => {
    // Privilege escalation via a profile write.
    await assertFails(updateDoc(doc(alice(), 'users', ALICE), { role: 'admin' }));
    await assertFails(updateDoc(doc(alice(), 'users', ALICE), { role: 'superadmin' }));
  });

  it('BLOCKS un-suspending oneself', async () => {
    await assertFails(updateDoc(doc(alice(), 'users', ALICE), { status: 'active2' }));
  });

  it('BLOCKS self-verifying a phone or email', async () => {
    // Alice is seeded unverified; flipping these would bypass OTP verification.
    await assertFails(updateDoc(doc(alice(), 'users', ALICE), { phoneVerified: true }));
    await assertFails(updateDoc(doc(alice(), 'users', ALICE), { emailVerified: true }));
  });

  it('BLOCKS changing the phone number on the profile', async () => {
    // The phone is the account identifier; it may only change via re-verification.
    await assertFails(
      updateDoc(doc(alice(), 'users', ALICE), { phone: '+910000000000' })
    );
  });

  it('BLOCKS smuggling unknown fields into a profile', async () => {
    await assertFails(updateDoc(doc(alice(), 'users', ALICE), { rewardBalance: 999999 }));
  });

  it('blocks client-side user creation and deletion', async () => {
    await assertFails(setDoc(doc(bob(), 'users', BOB), validUser));
    await assertFails(deleteDoc(doc(alice(), 'users', ALICE)));
  });

  it('blocks a suspended account entirely', async () => {
    const susp = testEnv.authenticatedContext(ALICE, claims.suspended).firestore();
    await assertFails(getDoc(doc(susp, 'users', ALICE)));
    await assertFails(updateDoc(doc(susp, 'users', ALICE), { displayName: 'x' }));
  });
});

describe('addresses', () => {
  it('lets the owner manage their own addresses', async () => {
    await assertSucceeds(getDoc(doc(alice(), 'users', ALICE, 'addresses', 'addr1')));
    await assertSucceeds(
      setDoc(doc(alice(), 'users', ALICE, 'addresses', 'addr2'), {
        ...validAddress,
        addressId: 'addr2',
      })
    );
  });

  it('BLOCKS reading another customer addresses', async () => {
    await assertFails(getDoc(doc(bob(), 'users', ALICE, 'addresses', 'addr1')));
    await assertFails(
      setDoc(doc(bob(), 'users', ALICE, 'addresses', 'addr3'), validAddress)
    );
  });

  it('BLOCKS self-declaring an address serviceable', async () => {
    // Serviceability is a server decision; this would bypass delivery-area limits.
    await assertFails(
      setDoc(doc(alice(), 'users', ALICE, 'addresses', 'addr4'), {
        ...validAddress,
        addressId: 'addr4',
        serviceable: true,
      })
    );
  });

  it('rejects malformed PIN codes and phone numbers', async () => {
    for (const pincode of ['12345', '0226001', 'ABC123']) {
      await assertFails(
        setDoc(doc(alice(), 'users', ALICE, 'addresses', 'addr5'), {
          ...validAddress,
          addressId: 'addr5',
          pincode,
        })
      );
    }
    await assertFails(
      setDoc(doc(alice(), 'users', ALICE, 'addresses', 'addr6'), {
        ...validAddress,
        addressId: 'addr6',
        recipientPhone: 'not-a-phone',
      })
    );
  });

  it('rejects oversized fields and non-IN countries', async () => {
    await assertFails(
      setDoc(doc(alice(), 'users', ALICE, 'addresses', 'addr7'), {
        ...validAddress,
        addressId: 'addr7',
        line1: 'x'.repeat(201),
      })
    );
    await assertFails(
      setDoc(doc(alice(), 'users', ALICE, 'addresses', 'addr8'), {
        ...validAddress,
        addressId: 'addr8',
        country: 'US',
      })
    );
  });
});

// -------------------------------------------------------------------- cart
describe('carts', () => {
  it('lets the owner write an intent-only cart', async () => {
    await assertSucceeds(
      setDoc(doc(alice(), 'carts', ALICE), {
        userId: ALICE,
        items: [
          { sku: 'EAT-DF-ALM-500G', productId: 'p_active', variantId: 'v1', qty: 2 },
        ],
        updatedAt: new Date(),
      })
    );
  });

  it('BLOCKS a cart carrying any money field', async () => {
    // Central cart invariant: the cart never stores a price.
    for (const money of [
      { grandTotal: 1 },
      { totals: { grandTotal: 1 } },
      { unitPrice: 1 },
      { discount: 50000 },
      { deliveryCharge: 0 },
    ]) {
      await assertFails(
        setDoc(doc(alice(), 'carts', ALICE), {
          userId: ALICE,
          items: [],
          ...money,
        })
      );
    }
  });

  it('BLOCKS reading or writing another customer cart', async () => {
    await assertFails(getDoc(doc(bob(), 'carts', ALICE)));
    await assertFails(setDoc(doc(bob(), 'carts', ALICE), { userId: ALICE, items: [] }));
  });

  it('rejects a cart whose userId does not match the path', async () => {
    await assertFails(setDoc(doc(alice(), 'carts', ALICE), { userId: BOB, items: [] }));
  });

  it('enforces the cart item cap', async () => {
    const items = Array.from({ length: 101 }, (_, i) => ({
      sku: `EAT-X-${i}`,
      productId: 'p',
      variantId: 'v',
      qty: 1,
    }));
    await assertFails(setDoc(doc(alice(), 'carts', ALICE), { userId: ALICE, items }));
  });

  it('requires authentication', async () => {
    await assertFails(getDoc(doc(anon(), 'carts', ALICE)));
  });
});

// ------------------------------------------------------------------ orders
describe('orders', () => {
  it('lets the owner read their order and its events', async () => {
    await assertSucceeds(getDoc(doc(alice(), 'orders/o_alice')));
    await assertSucceeds(getDoc(doc(alice(), 'orders/o_alice/events/e1')));
  });

  it('BLOCKS reading another customer order', async () => {
    await assertFails(getDoc(doc(bob(), 'orders/o_alice')));
    await assertFails(getDoc(doc(bob(), 'orders/o_alice/events/e1')));
    await assertFails(getDoc(doc(anon(), 'orders/o_alice')));
  });

  it('BLOCKS marking an order paid', async () => {
    // The free-order exploit. Payment status is set only by a verified webhook.
    await assertFails(
      updateDoc(doc(alice(), 'orders/o_alice'), { paymentStatus: 'paid' })
    );
  });

  it('BLOCKS changing an order total', async () => {
    await assertFails(
      updateDoc(doc(alice(), 'orders/o_alice'), { totals: { grandTotal: 1 } })
    );
  });

  it('BLOCKS advancing order status, even for staff, from a client', async () => {
    await assertFails(updateDoc(doc(alice(), 'orders/o_alice'), { status: 'SHIPPED' }));
    await assertFails(updateDoc(doc(opsUser(), 'orders/o_alice'), { status: 'SHIPPED' }));
  });

  it('BLOCKS creating an order directly', async () => {
    await assertFails(
      setDoc(doc(alice(), 'orders/o_forged'), {
        userId: ALICE,
        status: 'CONFIRMED',
        paymentStatus: 'paid',
        totals: { grandTotal: 0 },
      })
    );
  });

  it('BLOCKS writing order events', async () => {
    await assertFails(
      setDoc(doc(alice(), 'orders/o_alice/events/e2'), { to: 'DELIVERED' })
    );
  });

  it('lets staff read orders', async () => {
    await assertSucceeds(getDoc(doc(opsUser(), 'orders/o_alice')));
  });
});

// ------------------------------------------- inventory, payments, audit, config
describe('inventory', () => {
  it('BLOCKS customers reading exact stock levels', async () => {
    await assertFails(getDoc(doc(alice(), 'inventory/EAT-DF-ALM-500G')));
    await assertFails(getDoc(doc(anon(), 'inventory/EAT-DF-ALM-500G')));
  });

  it('lets permitted staff read stock', async () => {
    await assertSucceeds(getDoc(doc(opsUser(), 'inventory/EAT-DF-ALM-500G')));
  });

  it('BLOCKS all client stock writes, including staff', async () => {
    await assertFails(
      updateDoc(doc(alice(), 'inventory/EAT-DF-ALM-500G'), { available: 9999 })
    );
    await assertFails(
      updateDoc(doc(opsUser(), 'inventory/EAT-DF-ALM-500G'), { available: 9999 })
    );
  });
});

describe('payments', () => {
  it('BLOCKS all client access to payment intents', async () => {
    await assertFails(getDoc(doc(alice(), 'paymentIntents/pi_1')));
    await assertFails(
      updateDoc(doc(alice(), 'paymentIntents/pi_1'), { status: 'captured' })
    );
    await assertFails(getDoc(doc(adminUser(), 'paymentIntents/pi_1')));
  });

  it('BLOCKS all client access to webhook events', async () => {
    // Writing here would let an attacker forge or suppress payment idempotency.
    await assertFails(getDoc(doc(alice(), 'paymentEvents/evt_1')));
    await assertFails(setDoc(doc(alice(), 'paymentEvents/evt_forged'), { ok: true }));
  });
});

describe('audit logs', () => {
  it('lets admins read and nobody write', async () => {
    await assertSucceeds(getDoc(doc(adminUser(), 'adminAuditLogs/log1')));
    await assertFails(setDoc(doc(adminUser(), 'adminAuditLogs/log2'), { action: 'x' }));
  });

  it('BLOCKS non-admins reading the audit trail', async () => {
    await assertFails(getDoc(doc(alice(), 'adminAuditLogs/log1')));
    await assertFails(getDoc(doc(opsUser(), 'adminAuditLogs/log1')));
  });
});

describe('config', () => {
  it('exposes only non-sensitive config publicly', async () => {
    await assertSucceeds(getDoc(doc(anon(), 'config/serviceability')));
    await assertFails(getDoc(doc(anon(), 'config/taxRates')));
    await assertFails(getDoc(doc(alice(), 'config/taxRates')));
  });

  it('blocks config writes', async () => {
    await assertFails(
      setDoc(doc(adminUser(), 'config/serviceability'), { pincodes: [] })
    );
  });
});

// ------------------------------------------------- separation of duty (roles)
// Regression cover for the Phase 1 review finding C1: order reads were gated on
// the coarse isStaff(), which granted catalog_manager access to every customer's
// order — including the embedded address, phone and email. Order access now
// requires the explicit 'orders:read' permission.
describe('separation of duty', () => {
  it('BLOCKS catalog_manager from reading customer orders', async () => {
    await assertFails(getDoc(doc(catalogManager(), 'orders/o_alice')));
  });

  it('BLOCKS catalog_manager from reading order events', async () => {
    // Events leak status history for an order the role may not see at all.
    await assertFails(getDoc(doc(catalogManager(), 'orders/o_alice/events/e1')));
  });

  it('lets ops and admin read orders — they hold orders:read', async () => {
    await assertSucceeds(getDoc(doc(opsUser(), 'orders/o_alice')));
    await assertSucceeds(getDoc(doc(adminUser(), 'orders/o_alice')));
    await assertSucceeds(getDoc(doc(opsUser(), 'orders/o_alice/events/e1')));
  });

  it('lets superadmin through via the * permission wildcard', async () => {
    // hasPerm() must honour '*', matching requirePerm() in the function guards.
    await assertSucceeds(getDoc(doc(superadminUser(), 'orders/o_alice')));
    await assertSucceeds(getDoc(doc(superadminUser(), 'inventory/EAT-DF-ALM-500G')));
  });

  it('still BLOCKS every staff role from writing orders', async () => {
    for (const ctx of [catalogManager(), opsUser(), adminUser(), superadminUser()]) {
      await assertFails(updateDoc(doc(ctx, 'orders/o_alice'), { status: 'SHIPPED' }));
    }
  });

  it('grants inventory reads by permission, not by staff status', async () => {
    // catalog_manager and ops both legitimately manage stock.
    await assertSucceeds(getDoc(doc(catalogManager(), 'inventory/EAT-DF-ALM-500G')));
    await assertSucceeds(getDoc(doc(opsUser(), 'inventory/EAT-DF-ALM-500G')));
    await assertSucceeds(getDoc(doc(catalogManager(), 'inventoryLedger/led1')));
  });

  it('BLOCKS a staff role without inventory:read from reading stock', async () => {
    // Proves the permission is load-bearing rather than vestigial: this role is
    // staff, but holds no inventory permission.
    const supportish = testEnv
      .authenticatedContext('sup_uid', { role: 'ops', perms: ['orders:read'] })
      .firestore();
    await assertFails(getDoc(doc(supportish, 'inventory/EAT-DF-ALM-500G')));
    await assertFails(getDoc(doc(supportish, 'inventoryLedger/led1')));
  });

  it('BLOCKS non-admin staff from reading commercially sensitive config', async () => {
    // Tax rates and delivery pricing were previously readable by any staff role.
    for (const ctx of [catalogManager(), opsUser()]) {
      await assertFails(getDoc(doc(ctx, 'config/taxRates')));
    }
    await assertSucceeds(getDoc(doc(adminUser(), 'config/taxRates')));
  });

  it('BLOCKS a suspended staff account despite valid permissions', async () => {
    const suspendedOps = testEnv
      .authenticatedContext('sops_uid', {
        role: 'ops',
        perms: ['orders:read', 'inventory:read'],
        suspended: true,
      })
      .firestore();
    await assertFails(getDoc(doc(suspendedOps, 'orders/o_alice')));
    await assertFails(getDoc(doc(suspendedOps, 'inventory/EAT-DF-ALM-500G')));
  });

  it('BLOCKS a forged perms claim from a customer', async () => {
    // Claims are set only by a superadmin callable; this proves the rule reads
    // the token rather than anything the user controls in Firestore.
    await assertFails(
      updateDoc(doc(alice(), 'users', ALICE), { perms: ['orders:read'] })
    );
  });
});

// -------------------------------------------------------------- default deny
describe('default deny', () => {
  it('denies collections deferred to later phases', async () => {
    for (const path of [
      'coupons/SAVE10',
      'rewardLedger/r1',
      'subscriptions/s1',
      'referralCodes/CODE1',
      'b2bAccounts/acc1',
      'batches/b1',
      'stockReservations/res1',
      'idempotencyKeys/key1',
      'counters/orderNumber',
    ]) {
      await assertFails(getDoc(doc(alice(), path)));
      await assertFails(setDoc(doc(alice(), path), { x: 1 }));
    }
  });

  it('denies an arbitrary unknown collection', async () => {
    await assertFails(getDoc(doc(anon(), 'totallyUnknown/doc1')));
    await assertFails(setDoc(doc(alice(), 'totallyUnknown/doc1'), { x: 1 }));
    await assertFails(setDoc(doc(adminUser(), 'totallyUnknown/doc1'), { x: 1 }));
  });
});

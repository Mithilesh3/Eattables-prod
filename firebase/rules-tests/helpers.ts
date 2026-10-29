import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  type RulesTestEnvironment,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export const PROJECT_ID = 'eattables-rules-test';

export async function createTestEnv(): Promise<RulesTestEnvironment> {
  return initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync(here('../firestore.rules'), 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
    storage: {
      rules: readFileSync(here('../storage.rules'), 'utf8'),
      host: '127.0.0.1',
      port: 9199,
    },
  });
}

/** Custom claims exactly as Cloud Functions would set them. */
export const claims = {
  customer: { role: 'customer' },
  catalogManager: { role: 'catalog_manager', perms: ['catalog:write', 'inventory:read'] },
  ops: { role: 'ops', perms: ['orders:read', 'orders:update', 'inventory:read'] },
  admin: {
    role: 'admin',
    perms: ['orders:read', 'inventory:read', 'customers:read', 'audit:read'],
  },
  superadmin: { role: 'superadmin', perms: ['*'] },
  suspended: { role: 'customer', suspended: true },
} as const;

export const ALICE = 'alice_uid';
export const BOB = 'bob_uid';

export const validAddress = {
  addressId: 'addr1',
  label: 'home',
  recipientName: 'Alice Example',
  recipientPhone: '9999999999',
  line1: '12 Example Street',
  city: 'Lucknow',
  state: 'Uttar Pradesh',
  pincode: '226001',
  country: 'IN',
  isDefault: true,
  serviceable: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const validUser = {
  uid: ALICE,
  phone: '+919999999999',
  email: null,
  displayName: 'Alice',
  // Seeded UNVERIFIED on purpose: the escalation worth testing is an unverified
  // user flipping these to true. Writing the value it already holds is a no-op
  // that unchanged() correctly permits and proves nothing.
  phoneVerified: false,
  emailVerified: false,
  role: 'customer',
  accountType: 'b2c',
  status: 'active',
  defaultAddressId: null,
  marketingConsent: { email: false, sms: false, whatsapp: false },
  createdAt: new Date(),
  updatedAt: new Date(),
};

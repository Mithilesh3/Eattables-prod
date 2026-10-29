import { afterAll, beforeAll, describe, it } from 'vitest';
import {
  type RulesTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { getBytes, ref, uploadBytes } from 'firebase/storage';
import { ALICE, claims, createTestEnv } from '../helpers.js';

/**
 * Cloud Storage Security Rules tests.
 *
 * The critical assertion here is that /invoices is unreadable by every client,
 * including the invoice's own owner. Invoices carry names, addresses, phone
 * numbers and purchase history; they are served only via short-lived signed URLs
 * minted by a Cloud Function after an ownership check.
 */

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await createTestEnv();
  await testEnv.clearStorage();
});

afterAll(async () => {
  await testEnv?.cleanup();
});

const png = () => new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const meta = { contentType: 'image/png' };

const anon = () => testEnv.unauthenticatedContext().storage();
const customer = () => testEnv.authenticatedContext(ALICE, claims.customer).storage();
const catalog = () =>
  testEnv.authenticatedContext('cm_uid', claims.catalogManager).storage();
const opsUser = () => testEnv.authenticatedContext('ops_uid', claims.ops).storage();

describe('product media', () => {
  it('is readable by anyone', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await uploadBytes(ref(ctx.storage(), 'products/p1/main.png'), png(), meta);
    });
    await assertSucceeds(getBytes(ref(anon(), 'products/p1/main.png')));
  });

  it('is writable by a catalog manager', async () => {
    await assertSucceeds(uploadBytes(ref(catalog(), 'products/p1/new.png'), png(), meta));
  });

  it('BLOCKS uploads by customers and anonymous users', async () => {
    await assertFails(uploadBytes(ref(customer(), 'products/p1/evil.png'), png(), meta));
    await assertFails(uploadBytes(ref(anon(), 'products/p1/evil.png'), png(), meta));
  });

  it('BLOCKS uploads by staff without the catalogue permission', async () => {
    // Separation of duty: ops fulfils orders, it does not manage media.
    await assertFails(uploadBytes(ref(opsUser(), 'products/p1/ops.png'), png(), meta));
  });

  it('BLOCKS non-image content types', async () => {
    // Stops HTML/SVG/script being served from the product media origin.
    for (const contentType of ['text/html', 'image/svg+xml', 'application/javascript']) {
      await assertFails(
        uploadBytes(ref(catalog(), 'products/p1/bad'), png(), { contentType })
      );
    }
  });

  it('BLOCKS oversized uploads', async () => {
    const tooBig = new Uint8Array(6 * 1024 * 1024);
    await assertFails(uploadBytes(ref(catalog(), 'products/p1/big.png'), tooBig, meta));
  });
});

describe('invoices', () => {
  it('BLOCKS reads by the owner, other users and staff alike', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await uploadBytes(ref(ctx.storage(), `invoices/${ALICE}/inv1.pdf`), png(), {
        contentType: 'application/pdf',
      });
    });

    await assertFails(getBytes(ref(customer(), `invoices/${ALICE}/inv1.pdf`)));
    await assertFails(getBytes(ref(anon(), `invoices/${ALICE}/inv1.pdf`)));
    await assertFails(getBytes(ref(catalog(), `invoices/${ALICE}/inv1.pdf`)));
  });

  it('BLOCKS client uploads of forged invoices', async () => {
    await assertFails(
      uploadBytes(ref(customer(), `invoices/${ALICE}/forged.pdf`), png(), {
        contentType: 'application/pdf',
      })
    );
  });
});

describe('default deny', () => {
  it('denies arbitrary paths', async () => {
    for (const path of ['random/file.png', 'kyc/doc.pdf', 'backups/db.json']) {
      await assertFails(uploadBytes(ref(catalog(), path), png(), meta));
      await assertFails(getBytes(ref(anon(), path)));
    }
  });
});

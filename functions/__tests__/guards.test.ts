import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  GuardError,
  assertAppCheck,
  parseInput,
  requireAuth,
  requirePerm,
  requireRole,
  requireStaff,
} from '../src/lib/guards.js';
import { redact } from '../src/lib/logger.js';

const customer = { auth: { uid: 'u1', token: { role: 'customer' } }, app: {} };
const ops = {
  auth: { uid: 'u2', token: { role: 'ops', perms: ['orders:update'] } },
  app: {},
};
const superadmin = {
  auth: { uid: 'u3', token: { role: 'superadmin', perms: ['*'] } },
  app: {},
};

describe('assertAppCheck', () => {
  it('rejects a request with no App Check token when enforcing', () => {
    expect(() => assertAppCheck({ auth: { uid: 'u1' } }, true)).toThrow(GuardError);
  });

  it('allows it when enforcement is off (emulator/local dev)', () => {
    expect(() => assertAppCheck({ auth: { uid: 'u1' } }, false)).not.toThrow();
  });
});

describe('requireAuth', () => {
  it('rejects anonymous callers', () => {
    expect(() => requireAuth({})).toThrow(GuardError);
    try {
      requireAuth({});
    } catch (e) {
      expect((e as GuardError).code).toBe('unauthenticated');
    }
  });

  it('defaults an unknown role to customer rather than escalating', () => {
    expect(requireAuth({ auth: { uid: 'u1' } }).role).toBe('customer');
  });

  it('reads the role from custom claims', () => {
    expect(requireAuth(ops).role).toBe('ops');
  });

  it('blocks a suspended account immediately', () => {
    // Without this, a compromised account keeps access until its token expires.
    expect(() =>
      requireAuth({ auth: { uid: 'u1', token: { role: 'admin', suspended: true } } })
    ).toThrow(GuardError);
  });

  it('ignores a role supplied in the request body', () => {
    // Claims are the only authorization source; payload data must not matter.
    const ctx = requireAuth({
      auth: { uid: 'u1', token: { role: 'customer' } },
      data: { role: 'superadmin' },
    });
    expect(ctx.role).toBe('customer');
  });
});

describe('requireRole / requireStaff', () => {
  it('lets staff through', () => {
    expect(requireStaff(ops).uid).toBe('u2');
    expect(requireStaff(superadmin).role).toBe('superadmin');
  });

  it('keeps customers out of staff surfaces', () => {
    expect(() => requireStaff(customer)).toThrow(GuardError);
    try {
      requireStaff(customer);
    } catch (e) {
      expect((e as GuardError).code).toBe('permission-denied');
    }
  });

  it('enforces separation of duty between staff roles', () => {
    const catalog = {
      auth: { uid: 'u4', token: { role: 'catalog_manager', perms: ['catalog:write'] } },
    };
    // Whoever edits prices must not be able to act on orders.
    expect(() => requireRole(catalog, ['ops', 'admin', 'superadmin'])).toThrow(
      GuardError
    );
    expect(() => requirePerm(catalog, 'orders:update')).toThrow(GuardError);
  });
});

describe('requirePerm', () => {
  it('grants on an exact permission', () => {
    expect(requirePerm(ops, 'orders:update').uid).toBe('u2');
  });

  it('honours the superadmin wildcard', () => {
    expect(requirePerm(superadmin, 'anything:at:all').role).toBe('superadmin');
  });

  it('denies a missing permission', () => {
    expect(() => requirePerm(ops, 'catalog:write')).toThrow(GuardError);
  });

  it('denies when no perms claim exists at all', () => {
    expect(() => requirePerm(customer, 'orders:read')).toThrow(GuardError);
  });
});

describe('parseInput', () => {
  const schema = z.object({ qty: z.int().min(1) }).strict();

  it('returns parsed data on success', () => {
    expect(parseInput(schema, { qty: 2 })).toEqual({ qty: 2 });
  });

  it('rejects unknown keys', () => {
    expect(() => parseInput(schema, { qty: 2, unitPrice: 1 })).toThrow(GuardError);
  });

  it('reports invalid-argument with a useful message', () => {
    try {
      parseInput(schema, { qty: 0 });
      expect.unreachable('should have thrown');
    } catch (e) {
      expect((e as GuardError).code).toBe('invalid-argument');
      expect((e as GuardError).message).toContain('qty');
    }
  });
});

describe('logger redaction', () => {
  it('redacts personal data at every nesting level', () => {
    const out = redact({
      uid: 'u1',
      orderId: 'o1',
      phone: '9999999999',
      shippingAddress: {
        recipientName: 'A Person',
        line1: '12 Example Street',
        city: 'Lucknow',
      },
    }) as Record<string, unknown>;

    expect(out['uid']).toBe('u1');
    expect(out['orderId']).toBe('o1');
    expect(out['phone']).toBe('[redacted]');
    const addr = out['shippingAddress'] as Record<string, unknown>;
    expect(addr['recipientName']).toBe('[redacted]');
    expect(addr['line1']).toBe('[redacted]');
    // City alone is not identifying and stays useful for debugging.
    expect(addr['city']).toBe('Lucknow');
  });

  it('redacts inside arrays and is case-insensitive', () => {
    const out = redact({ users: [{ Email: 'a@b.com' }] }) as Record<string, unknown>;
    expect((out['users'] as Record<string, unknown>[])[0]!['Email']).toBe('[redacted]');
  });
});

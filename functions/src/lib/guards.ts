import type { ZodType } from 'zod';
import type { Role } from '@eattables/shared';
import { STAFF_ROLES } from '@eattables/shared';

/**
 * The guard chain every callable runs before it touches data:
 *
 *   1. App Check   — is this request from our real app, or a script?
 *   2. Auth        — is there a verified user?
 *   3. Role / perm — is that user allowed to do this?
 *   4. Input       — does the payload match the shared schema, strictly?
 *
 * These are plain functions over a minimal request shape rather than decorators,
 * so they are unit-testable without the emulator or a live Functions runtime.
 */

export type GuardErrorCode =
  'failed-precondition' | 'unauthenticated' | 'permission-denied' | 'invalid-argument';

/** Mirrors firebase-functions HttpsError without coupling the guards to it. */
export class GuardError extends Error {
  constructor(
    readonly code: GuardErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'GuardError';
  }
}

/** The subset of CallableRequest the guards actually need. */
export interface GuardableRequest {
  app?: unknown;
  auth?: {
    uid: string;
    token?: Record<string, unknown>;
  };
  data?: unknown;
}

export interface AuthContext {
  uid: string;
  role: Role;
  perms: readonly string[];
  suspended: boolean;
}

/**
 * Rejects traffic without a valid App Check token. Enabled per-environment:
 * the emulator does not mint real App Check tokens, so local development would
 * otherwise be impossible.
 */
export function assertAppCheck(req: GuardableRequest, enforce: boolean): void {
  if (enforce && req.app == null) {
    throw new GuardError('failed-precondition', 'App Check verification failed');
  }
}

/**
 * Resolves the caller's identity from the ID token's CUSTOM CLAIMS.
 *
 * Authorization never reads users/{uid}.role — that field is a display mirror.
 * Trusting it here would turn any write to a user document into a privilege
 * escalation, and would add a billed read to every call.
 */
export function requireAuth(req: GuardableRequest): AuthContext {
  if (!req.auth?.uid) {
    throw new GuardError('unauthenticated', 'Sign in to continue');
  }

  const token = req.auth.token ?? {};
  const rawRole = token['role'];
  const rawPerms = token['perms'];
  const suspended = token['suspended'] === true;

  // A suspended account loses access immediately, rather than waiting up to an
  // hour for its existing ID token to expire.
  if (suspended) {
    throw new GuardError('permission-denied', 'This account is suspended');
  }

  return {
    uid: req.auth.uid,
    role: (typeof rawRole === 'string' ? rawRole : 'customer') as Role,
    perms: Array.isArray(rawPerms) ? (rawPerms as string[]) : [],
    suspended,
  };
}

export function requireRole(
  req: GuardableRequest,
  allowed: readonly Role[]
): AuthContext {
  const ctx = requireAuth(req);
  if (!allowed.includes(ctx.role)) {
    throw new GuardError('permission-denied', 'Insufficient role');
  }
  return ctx;
}

export function requireStaff(req: GuardableRequest): AuthContext {
  return requireRole(req, STAFF_ROLES);
}

export function requirePerm(req: GuardableRequest, perm: string): AuthContext {
  const ctx = requireAuth(req);
  if (!ctx.perms.includes(perm) && !ctx.perms.includes('*')) {
    throw new GuardError('permission-denied', `Missing permission: ${perm}`);
  }
  return ctx;
}

/** Parses with the shared Zod schema. Strict schemas reject unknown keys. */
export function parseInput<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const detail = result.error.issues
      .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('; ');
    throw new GuardError('invalid-argument', `Invalid request: ${detail}`);
  }
  return result.data;
}

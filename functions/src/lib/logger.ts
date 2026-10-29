import { logger } from 'firebase-functions';

/**
 * PII-redacting structured logger.
 *
 * Customer names, phone numbers, emails and addresses must never reach Cloud
 * Logging: logs are retained, widely readable inside a project, and exported.
 * Redaction is centralised here so it is a property of the logger rather than
 * something every call site has to remember.
 */

const REDACTED = '[redacted]';

const SENSITIVE_KEYS = new Set([
  'phone',
  'phonenumber',
  'email',
  'password',
  'otp',
  'token',
  'idtoken',
  'accesstoken',
  'refreshtoken',
  'authorization',
  'apikey',
  'secret',
  'signature',
  'card',
  'cardnumber',
  'cvv',
  'upi',
  'recipientname',
  'recipientphone',
  'line1',
  'line2',
  'landmark',
  'displayname',
  'address',
]);

export function redact(value: unknown, depth = 0): unknown {
  if (depth > 6 || value == null) return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  if (typeof value !== 'object') return value;

  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    out[key] = SENSITIVE_KEYS.has(key.toLowerCase()) ? REDACTED : redact(val, depth + 1);
  }
  return out;
}

export interface LogContext {
  /** Threads a single request through every log line it produces. */
  correlationId?: string;
  uid?: string;
  [key: string]: unknown;
}

export const log = {
  info(message: string, context: LogContext = {}): void {
    logger.info(message, redact(context));
  },
  warn(message: string, context: LogContext = {}): void {
    logger.warn(message, redact(context));
  },
  error(message: string, context: LogContext = {}): void {
    logger.error(message, redact(context));
  },
};

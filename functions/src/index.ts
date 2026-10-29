import { initializeApp } from 'firebase-admin/app';
import { setGlobalOptions } from 'firebase-functions/v2';
import { onCall } from 'firebase-functions/v2/https';
import { log } from './lib/logger.js';

/**
 * Cloud Functions entry point.
 *
 * Phase 1 deliberately exposes no business logic. It establishes the runtime
 * defaults, the Admin SDK initialisation and one unauthenticated health check
 * used to prove the emulator wiring works end to end.
 *
 * Business callables (cart, checkout, payment, order, inventory, admin) arrive
 * in Phases 3-5 under src/domains/.
 */

initializeApp();

setGlobalOptions({
  // Mumbai: lowest latency to the launch market, and keeps data in India.
  region: 'asia-south1',
  // A hard ceiling on concurrency is cost protection, not performance tuning —
  // it bounds the damage from a runaway loop or a traffic flood.
  maxInstances: 10,
  memory: '256MiB',
  timeoutSeconds: 60,
});

export const health = onCall({ enforceAppCheck: false }, (request) => {
  log.info('health check', { authenticated: request.auth != null });
  return {
    status: 'ok',
    service: 'eattables-functions',
    phase: 1,
    timestamp: new Date().toISOString(),
  };
});

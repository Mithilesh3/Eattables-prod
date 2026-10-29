import { type FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { type Auth, connectAuthEmulator, getAuth } from 'firebase/auth';
import {
  type Firestore,
  connectFirestoreEmulator,
  getFirestore,
} from 'firebase/firestore';
import {
  type Functions,
  connectFunctionsEmulator,
  getFunctions,
} from 'firebase/functions';
import {
  type FirebaseStorage,
  connectStorageEmulator,
  getStorage,
} from 'firebase/storage';

/**
 * Firebase client SDK setup.
 *
 * IMPORTANT: every value here is a NEXT_PUBLIC_* variable and is shipped to the
 * browser. That is correct and expected — the Firebase web config is an
 * identifier, not a credential. Access is controlled by Security Rules and App
 * Check, never by hiding these values.
 *
 * What must NEVER appear in this file or anywhere under apps/web:
 *   - a service-account key
 *   - the Firebase Admin SDK
 *   - payment gateway secret keys or webhook signing secrets
 * `npm run check:client-env` fails the build if a non-public variable is read here.
 */

// Next.js inlines process.env.NEXT_PUBLIC_* at build time only for STATIC member
// access. Reading them dynamically (process.env[someVariable]) yields undefined in
// the browser bundle, so every lookup below must be written out literally, and the
// completeness check must inspect this object rather than process.env.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true';

export class FirebaseConfigError extends Error {}

const ENV_VAR_FOR_FIELD: Record<keyof typeof firebaseConfig, string> = {
  apiKey: 'NEXT_PUBLIC_FIREBASE_API_KEY',
  authDomain: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  projectId: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  storageBucket: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'NEXT_PUBLIC_FIREBASE_APP_ID',
};

function missingConfigVars(): string[] {
  return (Object.keys(ENV_VAR_FOR_FIELD) as (keyof typeof firebaseConfig)[])
    .filter((field) => !firebaseConfig[field])
    .map((field) => ENV_VAR_FOR_FIELD[field]);
}

/** Returns the config with every field proven present, or throws. */
function requireConfig(): Required<typeof firebaseConfig> {
  const missing = missingConfigVars();
  if (missing.length > 0) {
    throw new FirebaseConfigError(
      `Firebase is not configured. Missing: ${missing.join(', ')}. ` +
        `Copy apps/web/.env.example to apps/web/.env.local. ` +
        `No Firebase project exists yet as of Phase 1 — use the emulator suite.`
    );
  }
  return firebaseConfig as Required<typeof firebaseConfig>;
}

let cached: {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  functions: Functions;
  storage: FirebaseStorage;
} | null = null;

/**
 * Lazily initialises Firebase. Called on first use rather than at module load so
 * that an unconfigured environment fails with a clear message at the point of
 * use, instead of crashing every page render.
 */
export function getFirebase() {
  if (cached) return cached;

  const config = requireConfig();

  const app = getApps().length ? getApp() : initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);
  // Must match the region set in functions/src/index.ts.
  const functions = getFunctions(app, 'asia-south1');
  const storage = getStorage(app);

  if (useEmulators) {
    const host = process.env.NEXT_PUBLIC_EMULATOR_HOST ?? '127.0.0.1';
    connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
    connectFirestoreEmulator(db, host, 8080);
    connectFunctionsEmulator(functions, host, 5001);
    connectStorageEmulator(storage, host, 9199);
  }

  cached = { app, auth, db, functions, storage };
  return cached;
}

export function isFirebaseConfigured(): boolean {
  return missingConfigVars().length === 0;
}

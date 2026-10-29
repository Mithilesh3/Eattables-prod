#!/usr/bin/env node
/**
 * Guard: nothing privileged may reach the browser bundle.
 *
 * Fails the build if anything under apps/web/src:
 *   1. reads a process.env variable that is not NEXT_PUBLIC_* (or an allowlisted
 *      build-time variable), or
 *   2. imports the Firebase Admin SDK / firebase-functions, or
 *   3. contains something that looks like a service-account key or private key.
 *
 * This is cheap, runs with no extra tooling, and catches the single most damaging
 * mistake available in this codebase: shipping a privileged credential to users.
 */

import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const ROOT = process.cwd();
const SCAN_DIRS = [join(ROOT, 'apps', 'web', 'src')];
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs']);

/** Build-time variables Next.js itself defines; safe and never user-supplied. */
const ALLOWED_ENV = new Set(['NODE_ENV', 'VERCEL_ENV', 'NEXT_RUNTIME', 'TZ']);

const FORBIDDEN_IMPORTS = [/firebase-admin/, /firebase-functions/, /google-auth-library/];

const SECRET_SHAPES = [
  { re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/, label: 'private key block' },
  { re: /"type"\s*:\s*"service_account"/, label: 'service-account JSON' },
  { re: /\bprivate_key_id\b/, label: 'service-account field' },
];

const envRead = /process\.env\.([A-Za-z_][A-Za-z0-9_]*)/g;

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return; // directory not present yet
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      yield* walk(full);
    } else if (EXTENSIONS.has(full.slice(full.lastIndexOf('.')))) {
      yield full;
    }
  }
}

const problems = [];

function record(file, line, message) {
  problems.push(`${relative(ROOT, file).split(sep).join('/')}:${line}  ${message}`);
}

for (const dir of SCAN_DIRS) {
  for await (const file of walk(dir)) {
    const source = await readFile(file, 'utf8');
    const lines = source.split(/\r?\n/);

    lines.forEach((text, index) => {
      const lineNo = index + 1;

      for (const match of text.matchAll(envRead)) {
        const name = match[1];
        if (!name.startsWith('NEXT_PUBLIC_') && !ALLOWED_ENV.has(name)) {
          record(
            file,
            lineNo,
            `reads non-public env var "${name}". Browser code may only read NEXT_PUBLIC_*; move this to a Cloud Function.`
          );
        }
      }

      for (const re of FORBIDDEN_IMPORTS) {
        if (
          re.test(text) &&
          /\b(import|require)\b/.test(text) &&
          !text.trimStart().startsWith('*') &&
          !text.trimStart().startsWith('//')
        ) {
          record(file, lineNo, `imports privileged module matching ${re}`);
        }
      }

      for (const { re, label } of SECRET_SHAPES) {
        if (re.test(text)) {
          record(file, lineNo, `contains what looks like a ${label}`);
        }
      }
    });
  }
}

if (problems.length > 0) {
  console.error('\nclient-env check FAILED — privileged material in browser code:\n');
  for (const p of problems) console.error('  ' + p);
  console.error(`\n${problems.length} problem(s) found.\n`);
  process.exit(1);
}

console.log(
  'client-env check passed: no privileged env vars, imports or key material in apps/web/src'
);

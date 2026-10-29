import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'next-env.d.ts',
      // Playwright's generated artefacts: the HTML report ships a bundled,
      // minified trace viewer, and linting third-party build output is noise.
      'playwright-report/**',
      'test-results*/**',
    ],
  },
  {
    rules: {
      // The Admin SDK must never be importable from the browser bundle. This is
      // the lint-level half of the defence; scripts/check-client-env.mjs is the other.
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'firebase-admin',
              message:
                'The Firebase Admin SDK is privileged and must never be used in apps/web. Put the logic in a Cloud Function.',
            },
            {
              name: 'firebase-functions',
              message: 'firebase-functions belongs in functions/, not in the web app.',
            },
          ],
          patterns: [
            {
              group: ['firebase-admin/*'],
              message:
                'The Firebase Admin SDK is privileged and must never be used in apps/web.',
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;

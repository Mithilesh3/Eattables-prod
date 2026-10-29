# Eattables

Premium healthy-food D2C e-commerce platform for **Entais Retail Pvt. Ltd.**
Dry fruits, dates, snacks, spices, oils, pickles and gourmet groceries.

> **Status: Phase 1 — platform scaffold.**
> There is no storefront, no checkout, no payment integration and no admin panel yet.
> No Firebase project has been created and no credentials exist. See
> [docs/OPEN_QUESTIONS.md](docs/OPEN_QUESTIONS.md) for what is blocking the next phases.

---

## Stack

| Layer          | Technology                                       |
| -------------- | ------------------------------------------------ |
| Web            | Next.js (App Router) + TypeScript + Tailwind CSS |
| Database       | Cloud Firestore                                  |
| Auth           | Firebase Authentication (phone OTP + email)      |
| Media          | Cloud Storage for Firebase                       |
| Business logic | Cloud Functions (TypeScript)                     |
| CI             | GitHub Actions                                   |

## Repository layout

```
apps/web/              Next.js customer site (admin panel will live at /admin)
packages/shared/       Types, Zod schemas and pure helpers shared by web + functions
functions/             Cloud Functions — the ONLY place privileged logic runs
firebase/              Security Rules, indexes and rules tests
  rules-tests/         Automated Firestore + Storage rules tests
scripts/               Repo guards (e.g. no privileged env vars in browser code)
docs/                  Architecture, security notes, open questions
.github/workflows/     CI
```

## Architectural rules

These are load-bearing. Breaking one is a security regression, not a style choice.

1. **All money, stock and status logic lives in `functions/`.** Next.js route
   handlers are for sitemap/OG images only — never business logic.
2. **The client sends intent, never values.** `{productId, variantId, qty,
addressId}` — never a price, total or payment status.
3. **Security Rules are default-deny.** Every commerce collection is
   `allow write: if false` for clients. Writes happen in Cloud Functions via the
   Admin SDK, which bypasses rules.
4. **Authorization comes from custom claims**, never from `users/{uid}.role`
   (that field is a display mirror; reading it in rules is a privilege-escalation
   path and a billed read).
5. **Money is integer paise.** `₹249.50` is `24950`. Never a float.
6. **No service-account key, ever.** Not in the repo, not in CI secrets, not on a
   developer machine.

## Getting started

Prerequisites: **Node.js 20+**, **npm 10+**, **Java 11+** (the Firestore and
Storage emulators are JVM processes), and the Firebase CLI (`npm i -g firebase-tools`).

```bash
npm install
npm run build --workspace=@eattables/shared   # other packages import its output

cp apps/web/.env.example apps/web/.env.local  # placeholders are fine for emulator work

npm run emulators        # terminal 1 — Emulator UI on http://127.0.0.1:4000
npm run dev              # terminal 2 — site on http://localhost:3000
```

No Firebase project is required for local development. Everything runs against the
Emulator Suite, and `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true` points the client at it.

## Commands

| Command                    | What it does                                               |
| -------------------------- | ---------------------------------------------------------- |
| `npm run dev`              | Next.js dev server                                         |
| `npm run emulators`        | Auth, Firestore, Functions, Storage + Emulator UI          |
| `npm test`                 | Unit tests (shared + functions)                            |
| `npm run test:rules`       | **Security Rules tests** — boots the emulators, needs Java |
| `npm run lint`             | ESLint                                                     |
| `npm run typecheck`        | TypeScript across all workspaces                           |
| `npm run check:client-env` | Fails if browser code reads a non-public env var           |
| `npm run format`           | Prettier write                                             |
| `npm run verify`           | Everything CI runs, except the rules tests                 |

`npm run verify` builds `@eattables/shared` first: the other workspaces typecheck
against its emitted declarations, so without that step a clean checkout fails with
`TS2307: Cannot find module '@eattables/shared'`. It therefore works straight after
`npm ci`, with no manual pre-build.

## Environment and secrets

- **Browser config** → `apps/web/.env.example` → copy to `.env.local`.
  Every value is `NEXT_PUBLIC_*` and ships to the browser. That is correct: the
  Firebase web config is an identifier, not a credential.
- **Server secrets** (payment gateway keys, webhook signing secrets, SMS/email API
  keys) live in **Google Secret Manager** and are read only by Cloud Functions.
  They are never committed and never placed in a `.env` file. See `.env.example`.

CI blocks a merge if a `.env`, a credential-shaped file, or key material in the
client bundle is detected.

## Security

See [docs/SECURITY.md](docs/SECURITY.md). Before taking real payments, the release
blocker checklist in that document must be fully green.

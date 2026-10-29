# Security model

Status: **Phase 1**. The controls below are either implemented now or scheduled
against the phase noted. Nothing in this document should be read as a claim that
the platform is production-ready — it is not, and must not accept real payments
until the release blocker checklist at the end is fully green.

---

## 1. Threat model in one line

This is a consumer e-commerce site handling real money and personal data. The
attacker we design against is an ordinary, moderately skilled person with a browser
devtools console, not a nation state. That attacker's cheapest wins are:

| Attack                                                 | Control                                                                                   |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Edit a price in the client and buy for ₹1              | Prices are never accepted from the client; Firestore rules forbid product writes          |
| Call the "payment succeeded" callback without paying   | Payment status is set only by a signature-verified webhook (Phase 4)                      |
| Replay a webhook to double-credit an order             | `paymentEvents` document ID **is** the provider event ID; created in the same transaction |
| Read someone else's orders or addresses                | Ownership checks in rules; negative tests assert this                                     |
| Promote oneself to admin by writing `users/{uid}.role` | Authorization reads custom claims only; rules pin the `role` field with `unchanged()`     |
| Oversell the last unit of stock                        | Transactional reservation (Phase 3)                                                       |
| Scrape exact stock levels                              | `inventory` is not client-readable                                                        |
| Download an invoice by guessing a URL                  | `/invoices` is `allow read: if false`; signed URLs only                                   |
| Drain the SMS budget with OTP requests                 | India-only region allowlist + per-phone throttle (Phase 3)                                |

## 2. Authorization

**Custom claims are the only authorization source.** `request.auth.token.role` and
`request.auth.token.perms`, set exclusively by a superadmin-callable Cloud Function
and always audited.

`users/{uid}.role` is a **display mirror for the admin UI**. Security Rules must
never read it. Doing so would mean any write to a user document is a potential
privilege escalation, and would add a billed document read to every rule evaluation.

Roles, with deliberate separation of duty:

| Role              | May do                             | May **not** do                       |
| ----------------- | ---------------------------------- | ------------------------------------ |
| `customer`        | Own cart, addresses, orders (read) | Anything else                        |
| `catalog_manager` | Products, media, stock             | Touch orders                         |
| `ops`             | Orders, fulfilment, stock          | Edit prices                          |
| `admin`           | The above + customers + audit      | Grant roles                          |
| `superadmin`      | Grant roles, destructive ops       | — (MFA required, minimum two humans) |

A `suspended: true` claim denies access immediately, in both rules and the function
guards, rather than waiting up to an hour for the ID token to expire.

## 3. Data access

`firebase/firestore.rules` is default-deny. Almost every commerce collection is
`allow write: if false` for clients. This makes "a customer cannot change a price,
total, payment status, stock level or order status" true **structurally** — there is
no rule that could permit it, so no bug in rules logic can expose it.

The only client-writable paths are:

- `users/{uid}` — a narrow field allowlist, with `role`, `status`, `accountType`,
  `phone` and verification flags pinned by `unchanged()`.
- `users/{uid}/addresses/{id}` — shape-validated; `serviceable` must be `false`
  (serviceability is a server decision).
- `carts/{uid}` — **identifiers and quantity only**. Any money-bearing key is
  rejected outright.

`firebase/storage.rules` is likewise default-deny: public product media (staff-write,
type and size capped) and private invoices (no client access at all).

## 4. Defence in depth

| Layer                 | Purpose                                                                             |
| --------------------- | ----------------------------------------------------------------------------------- |
| Zod schema (client)   | Instant form feedback. **Not security.**                                            |
| Security Rules        | Backstop if the client is bypassed entirely                                         |
| Cloud Function guards | The authoritative check — App Check, auth, role, strict schema, business invariants |
| Firestore transaction | Atomicity and concurrency correctness                                               |
| Audit log             | Written in the same transaction, so an action cannot succeed unlogged               |

The _same_ Zod schema from `@eattables/shared` runs on both client and server, so the
two can never drift apart. All schemas are `.strict()` — unknown keys are rejected,
not ignored, which stops a client smuggling extra fields into a write.

## 5. Secrets

| Secret                                  | Lives in                                                                                | Never in                  |
| --------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------- |
| Firebase web config                     | `NEXT_PUBLIC_*` — **public by design**                                                  | —                         |
| Service-account keys                    | **Nowhere.** Functions use the runtime default SA; CI uses Workload Identity Federation | Repo, CI secrets, laptops |
| Payment gateway secret + webhook secret | Google Secret Manager                                                                   | Any client code           |
| SMS / email API keys                    | Google Secret Manager                                                                   | Any client code           |

Enforced mechanically, not by review:

- `scripts/check-client-env.mjs` fails the build if anything under `apps/web/src`
  reads a non-`NEXT_PUBLIC_` env var, imports `firebase-admin`/`firebase-functions`,
  or contains key-shaped material.
- ESLint `no-restricted-imports` blocks the Admin SDK in web code.
- `gitleaks` scans **full history** in CI — a secret committed and later "removed"
  is still in the git objects and still leaked.
- CI fails if a `.env` or credential-shaped file is tracked, or if key material
  appears in the built client bundle.

## 6. Logging

`functions/src/lib/logger.ts` redacts personal data (names, phones, emails, address
lines, tokens, card fields) at every nesting level before anything reaches Cloud
Logging. Redaction is a property of the logger rather than something each call site
must remember.

## 7. Known gaps at Phase 1

Stated plainly so none of these is mistaken for done:

- **No Content-Security-Policy yet.** It can only be written once the payment
  gateway and analytics origins are known (Phase 4). Other security headers are set.
- **App Check is not enabled yet** — it needs a real Firebase project. Required
  before launch.
- **Rules tests have not been executed on this machine** — the emulators need a
  JRE, which is not installed locally. They run in CI.
- No rate limiting, no MFA enforcement, no backups, no monitoring. All are
  Phase 3–5 items and all are release blockers.
- Transitive advisories remain in the dependency tree (see §8).

## 8. Dependency posture

`npm audit` at the time of scaffolding: **0 critical**, 6 high, 10 moderate — all
transitive and all dev/test-path.

- `vitest`/`tinypool` criticals were removed by upgrading to vitest 5.
- `postcss` is pinned forward via a root `overrides` entry.
- `@grpc/grpc-js` (high) is pinned by the Firebase **client** SDK, which uses it
  only in Node during rules tests; the advisory concerns gRPC server auth contexts.
  The only "fix" npm offers is downgrading `firebase` to v9, which is not
  acceptable. Tracked, re-checked each dependency bump, not shipped to users.

Dependabot and a scheduled `npm audit` should be enabled when the repository goes
active.

---

## Release blockers — none of this may be waived

Must all be ✅ before accepting money from a real customer.

**Payment**

- [ ] Payment confirmed only by signature-verified webhook or server-side polling
- [ ] Webhook signature verified against the **raw** body
- [ ] Replayed webhook proven to be a no-op (automated test)
- [ ] Webhook amount asserted equal to the server-computed order total
- [ ] Dropped-webhook recovery proven by the reconciliation job
- [ ] No card/UPI/bank data stored anywhere
- [ ] Gateway secret provably absent from the client bundle

**Pricing and orders**

- [ ] 100% of prices, taxes and totals computed server-side
- [ ] Tampered client price has zero effect (explicit test)
- [ ] Order price snapshot immutable after creation
- [ ] Duplicate submit returns the original order (idempotency)

**Inventory**

- [ ] Concurrent last-unit purchase: exactly one success (explicit test)
- [ ] Stock can never go negative
- [ ] Every movement writes an `inventoryLedger` entry

**Platform**

- [ ] Rules tests green, 100% collection coverage, negative tests included
- [ ] App Check enforced on Functions and Firestore
- [ ] OTP rate-limited; SMS restricted to India
- [ ] Staff MFA; least-privilege claims; superadmin list reviewed
- [ ] CSP deployed and verified
- [ ] `gitleaks` clean on full history
- [ ] Daily backups enabled **and a restore rehearsed**
- [ ] Budget alerts configured and test-fired
- [ ] Error monitoring and uptime checks live
- [ ] Rollback procedure tested

**Business and legal** (owner-supplied — engineering cannot complete these)

- [ ] Terms, Privacy, Shipping, Returns, Refunds, Cancellation published
- [ ] FSSAI licence number displayed
- [ ] GST registration confirmed; invoice format accountant-approved
- [ ] Legal Metrology declarations on packaged-commodity listings
- [ ] Grievance Officer details published
- [ ] Payment gateway KYC complete

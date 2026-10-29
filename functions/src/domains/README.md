# Domains

Business logic lives here, one folder per domain. Empty at Phase 1 by design.

Planned, in the order they arrive:

| Folder          | Phase | Responsibility                                                                                                 |
| --------------- | ----- | -------------------------------------------------------------------------------------------------------------- |
| `catalog/`      | 2     | Product + category writes, `catalogIndex` rebuild trigger                                                      |
| `user/`         | 3     | Signup trigger, profile provisioning                                                                           |
| `cart/`         | 3     | `getCartSummary` — the authoritative price computation                                                         |
| `checkout/`     | 3     | `placeOrder` — pricing, tax, delivery, stock reservation, idempotency                                          |
| `inventory/`    | 3     | Reserve, commit, release, adjust (always ledgered)                                                             |
| `payment/`      | 4     | `createIntent`, webhook verification, reconciliation. `providers/` holds gateway adapters behind one interface |
| `order/`        | 4     | Status machine, cancellation                                                                                   |
| `notification/` | 4     | Transactional email/SMS                                                                                        |
| `admin/`        | 5     | Staff mutations, every one audited                                                                             |

Every callable goes through the guard chain in `../lib/guards.ts`: App Check →
auth → role/permission → strict Zod parse → business invariants → transaction →
audit log.

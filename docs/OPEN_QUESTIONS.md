# Open questions — business owner input required

Nothing here has been guessed. No price, tax rate, delivery charge, policy or
credential appears anywhere in this repository, and none will be invented.

🔴 blocks a phase · 🟡 needed during a phase · 🟢 can wait

Last updated: end of Phase 1.

---

## Blocking the next phases

| #     | Question                                                                                                                                                                                    | Blocks                 |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 🔴 Q1 | **Which payment gateway?** (Razorpay / PhonePe / Cashfree / PayU / CCAvenue). Merchant KYC routinely takes 1–3 weeks — **start it now, in parallel**, whatever else happens.                | Phase 4 entirely       |
| 🔴 Q2 | **GST** registration status, HSN codes per category, applicable rates.                                                                                                                      | Phase 3 pricing engine |
| 🔴 Q3 | **Product data**: final list with names, descriptions, variants, weights, **prices and MRPs**, plus photography.                                                                            | Phase 2 catalogue      |
| 🔴 Q4 | **Brand assets**: logo files, exact hex palette, licensed fonts, tone of voice. Current tokens in `globals.css` are provisional placeholders approximated from the pitch deck.              | Phase 2 styling        |
| 🔴 Q5 | **Legal content**: Terms, Privacy, Shipping, Returns, Refunds, Cancellation, Grievance Officer details, FSSAI licence number, registered address.                                           | Phase 5 launch         |
| 🔴 Q6 | **Serviceable Lucknow PIN codes** at launch.                                                                                                                                                | Phase 3 checkout       |
| 🔴 Q7 | **Return/refund window and cancellation cut-off.** Perishables are usually non-returnable. This shapes the order state machine, which currently stops at `DELIVERED` with no return states. | Phase 3 order model    |

## Needed during a phase

| #      | Question                                                                                                                                                                |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🟡 Q8  | **Delivery charges** — flat, slab, or free above a threshold? Express/slot surcharge?                                                                                   |
| 🟡 Q9  | **Cash on Delivery at launch?** If yes: charge, order-value cap, eligible PIN codes. Currently `placeOrderInputSchema` accepts `online` only.                           |
| 🟡 Q10 | **Do cut-fresh / perishable items ship at launch**, or shelf-stable only? Delivery slots and same-day cut-offs materially change checkout.                              |
| 🟡 Q11 | **Catalogue size by end of Year 1** — 50, 200 or 1,000+ SKUs? Decides whether a search service (Algolia/Typesense) is needed instead of the client-side `catalogIndex`. |
| 🟡 Q12 | **BOLD product structure**: 2 products × 5 flavour variants (recommended), or 10 separate products?                                                                     |
| 🟡 Q13 | **Auth providers** — confirm phone OTP + email. Add Google Sign-In?                                                                                                     |
| 🟡 Q14 | **Notification channels** at launch: email, SMS, or both? WhatsApp needs a BSP and template approval (weeks of lead time) — flag early if wanted.                       |
| 🟡 Q15 | **Minimum order value**, if any.                                                                                                                                        |
| 🟡 Q16 | **Staff list and roles**; who holds `superadmin`?                                                                                                                       |
| 🟡 Q17 | **Stock reservation window** during checkout (15 minutes is typical).                                                                                                   |
| 🟡 Q18 | Out-of-stock items: hide, grey out, or allow backorder?                                                                                                                 |

## Infrastructure decisions

| #      | Question                                                                                                                     |
| ------ | ---------------------------------------------------------------------------------------------------------------------------- |
| 🟡 Q19 | **Domain name** and current DNS registrar.                                                                                   |
| 🟡 Q20 | **Hosting**: Firebase App Hosting (recommended — same project and region as Firestore) or Vercel?                            |
| 🟡 Q21 | **Firebase project IDs** for dev and prod. Region is recommended as `asia-south1` (Mumbai) — **this is permanent once set.** |
| 🟢 Q22 | Data-retention policy: how long are orders, customer data and logs kept?                                                     |
| 🟢 Q23 | Backup retention period.                                                                                                     |
| 🟢 Q24 | Where should production alerts go — email, Slack, WhatsApp?                                                                  |

## Compliance (India) — values must come from the business

These are legal obligations with schema and UI implications. The data model
accommodates them; the values do not exist yet.

- FSSAI licence number (displayed on site and invoices)
- Legal Metrology declarations: net quantity, MRP inclusive of taxes,
  manufacturer/packer details, country of origin, consumer-care contact, best-before
- GST registration and compliant tax invoice format
- Consumer Protection (E-Commerce) Rules: published policies + Grievance Officer
- RBI card-storage rules: no card data stored — gateway tokenisation only
- DPDP Act 2023: marketing consent, data export/deletion, India data residency

## Deferred to future phases (not MVP)

Mobile app · subscriptions · premium gifting flow · combos · coupons · referral
codes and reward ledger · loyalty · B2B accounts · procurement, batch/expiry, cold
chain · delivery-partner app · marketplace connectors · AI forecasting · advanced
analytics.

> Note on the referral programme: the pitch deck states the structure is _"subject
> to legal review"_. When it is scheduled, a **written legal opinion is required
> before any reward code ships**, and the implementation must stay single-level.
> Multi-level reward structures risk liability under the Prize Chits and Money
> Circulation Schemes (Banning) Act 1978 and the Consumer Protection (Direct
> Selling) Rules 2021.

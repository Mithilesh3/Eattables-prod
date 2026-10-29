/**
 * Phase 1 placeholder.
 *
 * This page exists to prove the toolchain renders and builds. It contains no
 * storefront, no product data and no prices — the catalogue arrives in Phase 2,
 * and no price may be shown until the business owner supplies real ones.
 */
export default function Home() {
  const checklist = [
    'Next.js App Router + TypeScript + Tailwind CSS',
    'Monorepo: apps/web, packages/shared, functions',
    'Firebase Emulator Suite configuration',
    'Firestore + Storage rules with default-deny',
    'Automated Security Rules tests',
    'CI: lint, typecheck, test, build, secret scanning',
  ];

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-8 px-6 py-16">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-600">
          Health · Wealth · Care
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-brand-900">Eattables</h1>
        <p className="text-brand-700">
          Platform scaffold — Phase 1 of the MVP build. The storefront, checkout and admin
          panel are not implemented yet.
        </p>
      </header>

      <section
        aria-labelledby="phase-1-heading"
        className="rounded-xl border border-brand-100 bg-white p-6 shadow-sm"
      >
        <h2 id="phase-1-heading" className="text-sm font-semibold text-brand-900">
          Phase 1 scope
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-brand-700">
          {checklist.map((item) => (
            <li key={item} className="flex gap-3">
              <span aria-hidden="true" className="text-accent-500">
                ✓
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <footer className="text-xs text-brand-500">
        Eattables — a brand by Entais Retail Pvt. Ltd.
      </footer>
    </main>
  );
}

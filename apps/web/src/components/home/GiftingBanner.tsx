import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

/**
 * Gifting feature band.
 *
 * Intentionally promotional in tone but free of specific offers: no discount
 * percentage, no bundle price, no coupon code. Offer mechanics are a business
 * decision and combos/coupons are deferred past the MVP.
 */
export function GiftingBanner() {
  return (
    <Container as="section" className="py-6">
      <div className="relative overflow-hidden rounded-3xl bg-brand-900 px-6 py-14 text-white sm:px-12 sm:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(40rem 30rem at 80% 20%, rgba(217,132,58,0.32), transparent 62%)',
          }}
        />
        <div className="relative max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-300">
            Premium gifting
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
            Festive &amp; corporate date gift boxes
          </h2>
          <p className="mt-4 max-w-xl text-brand-100">
            Chocolate, rose and nut-stuffed dates presented in signature boxes — made for
            festivals, client gifting and occasions that deserve more than a basket.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/products?tag=gifting" size="lg">
              Browse gift boxes
            </ButtonLink>
            <ButtonLink
              href="/contact"
              size="lg"
              variant="outline"
              className="border-white/25 bg-transparent text-white hover:border-white/50 hover:bg-white/10"
            >
              Corporate enquiries
            </ButtonLink>
          </div>
        </div>
      </div>
    </Container>
  );
}

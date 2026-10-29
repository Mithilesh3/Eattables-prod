import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { LeafIcon, ShieldIcon, SnowflakeIcon } from '@/components/ui/icons';

/**
 * Homepage hero.
 *
 * Every claim here is drawn from the pitch deck (cold chain, hygienic packing,
 * seven categories). It makes no delivery-time promise and quotes no price,
 * because neither has been confirmed by the business owner.
 */

const proofPoints = [
  { icon: SnowflakeIcon, label: 'Cold-chain handled' },
  { icon: ShieldIcon, label: 'Quality checked' },
  { icon: LeafIcon, label: 'Preservative-free options' },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-brand-900 text-white">
      {/* Decorative wash — purely atmospheric, hidden from assistive tech. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(60rem 40rem at 85% 15%, rgba(217,132,58,0.28), transparent 60%),' +
            'radial-gradient(45rem 35rem at 10% 90%, rgba(47,107,70,0.25), transparent 65%)',
        }}
      />

      <Container className="relative py-16 sm:py-20 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent-200">
              Health · Wealth · Care
            </p>

            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
              Nourishing lives, one fresh bite at a time
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-brand-100 sm:text-lg">
              Premium dry fruits, dates, gourmet preserves and ready-to-eat health foods —
              curated across seven categories, hygienically packed and cold-chain handled.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/products" size="lg">
                Shop the collection
              </ButtonLink>
              <ButtonLink
                href="/products?tag=gifting"
                size="lg"
                variant="outline"
                className="border-white/25 bg-transparent text-white hover:border-white/50 hover:bg-white/10"
              >
                Explore gifting
              </ButtonLink>
            </div>

            <ul className="mt-10 flex flex-wrap gap-x-7 gap-y-3">
              {proofPoints.map(({ icon: PointIcon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-2.5 text-sm text-brand-100"
                >
                  <PointIcon className="size-5 text-accent-300" />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {/* Product photography is pending (Q3). Rather than a stock image that
              misrepresents the brand, this is a typographic category montage. */}
          <div className="relative hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: 'Dry Fruits', note: 'Almonds · Cashews · Raisins' },
                { title: 'Dates', note: 'Stuffed · Chocolate · Rose' },
                { title: 'Gifting', note: 'Festive & corporate boxes' },
                { title: 'BOLD', note: 'Five flavours, two nuts' },
              ].map((tile, index) => (
                <div
                  key={tile.title}
                  className={[
                    'rounded-2xl border border-white/15 bg-white/[0.07] p-6 backdrop-blur-sm',
                    index % 2 === 1 ? 'translate-y-6' : '',
                  ].join(' ')}
                >
                  <p className="text-xl font-bold">{tile.title}</p>
                  <p className="mt-2 text-xs leading-relaxed text-brand-200">
                    {tile.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

import { Container } from '@/components/ui/Container';
import { GiftIcon, LeafIcon, ShieldIcon, SnowflakeIcon } from '@/components/ui/icons';

/**
 * Brand pillars, taken from the pitch deck's solution and infrastructure slides.
 *
 * Note what is absent: no delivery-time promise, no free-shipping threshold, no
 * return window. Those are business policies that have not been set, and a
 * storefront must not imply them.
 */
const props = [
  {
    icon: SnowflakeIcon,
    title: 'Cold-chain backbone',
    body: 'Pre-cooling, cold storage and insulated handling from procurement to pack.',
  },
  {
    icon: ShieldIcon,
    title: 'Quality checked',
    body: 'Sourced and inspected before packing, with hygiene built into every step.',
  },
  {
    icon: LeafIcon,
    title: 'Everyday wellness',
    body: 'Ready-to-eat and ready-to-cook staples designed for busy, health-first homes.',
  },
  {
    icon: GiftIcon,
    title: 'Premium gifting',
    body: 'Festive and corporate date boxes that build occasions, not just baskets.',
  },
];

export function ValueProps() {
  return (
    <section className="border-y border-brand-100 bg-white">
      <Container className="py-12 sm:py-14">
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {props.map(({ icon: PropIcon, title, body }) => (
            <li key={title} className="flex gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent-50 text-accent-600">
                <PropIcon className="size-5" />
              </span>
              <div>
                <h3 className="font-semibold text-brand-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-brand-400">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

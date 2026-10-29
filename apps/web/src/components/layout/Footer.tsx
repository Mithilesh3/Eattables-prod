import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Logo } from '@/components/layout/Logo';

/**
 * Site footer.
 *
 * Legal links point at routes that do not exist yet: the policy TEXT is an open
 * business question (Q5), and writing a returns or shipping policy on the
 * owner's behalf is not something engineering should do. The links are present
 * so the information architecture is right; the pages land with real copy.
 */

const shopLinks = [
  { href: '/products', label: 'All products' },
  { href: '/categories', label: 'Categories' },
  { href: '/products?tag=gifting', label: 'Premium gifting' },
  { href: '/products?tag=bestseller', label: 'Bestsellers' },
];

const companyLinks = [
  { href: '/about', label: 'About Eattables' },
  { href: '/contact', label: 'Contact us' },
];

const legalLinks = [
  { href: '/terms', label: 'Terms of service' },
  { href: '/privacy', label: 'Privacy policy' },
  { href: '/shipping', label: 'Shipping policy' },
  { href: '/returns', label: 'Returns & refunds' },
];

function LinkColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-brand-200 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 bg-brand-900 text-white">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo tone="light" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-brand-200">
              Premium healthy food, dry fruits, dates and gourmet groceries — hygienically
              packed and cold-chain handled for everyday wellness.
            </p>
            <p className="mt-6 text-xs text-brand-300">
              A brand by Entais Retail Pvt. Ltd.
              <br />
              CIN: U46301UP2025PTC223845
            </p>
          </div>

          <LinkColumn title="Shop" links={shopLinks} />
          <LinkColumn title="Company" links={companyLinks} />
          <LinkColumn title="Legal" links={legalLinks} />
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-brand-700 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-brand-300">
            © {new Date().getFullYear()} Entais Retail Pvt. Ltd. All rights reserved.
          </p>
          {/* FSSAI licence number, GST details and the grievance officer contact
              are mandatory for Indian food e-commerce and are pending from the
              business owner (docs/OPEN_QUESTIONS.md Q5). */}
          <p className="text-xs text-brand-400">
            FSSAI licence details to be displayed here.
          </p>
        </div>
      </Container>
    </footer>
  );
}

import { Container } from '@/components/ui/Container';

/**
 * Three-step explainer for someone ordering online for the first time.
 *
 * Carefully worded: it describes the MECHANICS of ordering, not any promise.
 * There is no delivery time, no shipping charge, no return window and no
 * payment-method claim here, because none of those has been decided by the
 * business owner. Saying "pay using the options shown at checkout" is true
 * whatever is configured later; "delivered in 2 days" would not be.
 */
const steps = [
  {
    n: '1',
    title: 'Find what you need',
    body: 'Search by name or browse the categories.',
  },
  {
    n: '2',
    title: 'Add to your cart',
    body: 'Pick the size you want and tap Add. Change the quantity any time.',
  },
  {
    n: '3',
    title: 'Place your order',
    body: 'Enter your delivery address and pay using the options shown at checkout.',
  },
];

export function HowItWorks() {
  return (
    <section className="border-y border-brand-100 bg-white">
      <Container className="py-10 sm:py-12">
        <h2 className="text-center text-xl font-semibold text-brand-900 sm:text-2xl">
          Ordering is simple
        </h2>

        <ol className="mt-7 grid gap-5 sm:grid-cols-3 sm:gap-8">
          {steps.map((step) => (
            <li key={step.n} className="flex items-start gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-500 text-base font-bold text-white">
                {step.n}
              </span>
              <div>
                <h3 className="font-semibold text-brand-900">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-brand-500">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

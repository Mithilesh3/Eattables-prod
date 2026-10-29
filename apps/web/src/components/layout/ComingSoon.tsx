import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

/**
 * Honest placeholder for routes that exist in the navigation but are scheduled
 * for a later phase. Better than a 404: the information architecture is real,
 * and the page says plainly what is coming rather than pretending to be broken.
 */
export function ComingSoon({
  title,
  phase,
  description,
}: {
  title: string;
  phase: string;
  description: string;
}) {
  return (
    <Container className="flex min-h-[55vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-600">
        {phase}
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 max-w-md text-brand-400">{description}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/">Back to home</ButtonLink>
      </div>
    </Container>
  );
}

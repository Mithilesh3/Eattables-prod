import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

/**
 * Wordmark rendered as text.
 *
 * The real logo files are an open question with the business owner (Q4 in
 * docs/OPEN_QUESTIONS.md). This is a faithful typographic stand-in — lowercase
 * serif wordmark over a letter-spaced HEALTH · WEALTH · CARE strapline, as the
 * deck uses — and is swapped for the supplied asset in one place when it lands.
 */
export function Logo({
  className,
  tone = 'dark',
}: {
  className?: string;
  tone?: 'dark' | 'light';
}) {
  return (
    <Link
      href="/"
      className={cn('group inline-flex flex-col leading-none', className)}
      aria-label="Eattables — home"
    >
      <span
        className={cn(
          'font-wordmark text-2xl font-bold tracking-tight sm:text-[1.75rem]',
          tone === 'dark' ? 'text-brand-900' : 'text-white'
        )}
      >
        eattables
      </span>
      <span
        className={cn(
          'mt-1 text-[0.625rem] font-semibold uppercase tracking-[0.3em]',
          tone === 'dark' ? 'text-accent-600' : 'text-accent-300'
        )}
      >
        Health · Wealth · Care
      </span>
    </Link>
  );
}

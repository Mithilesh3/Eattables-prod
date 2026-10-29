import type { Metadata } from 'next';
import { ComingSoon } from '@/components/layout/ComingSoon';

export const metadata: Metadata = { title: 'Shop' };

export default function Page() {
  return (
    <ComingSoon
      title="Shop"
      phase="Next up — step 3"
      description="The product catalogue, with search, category filters and sorting, is the next phase of work."
    />
  );
}

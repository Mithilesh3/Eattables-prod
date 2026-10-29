import type { Metadata } from 'next';
import { ComingSoon } from '@/components/layout/ComingSoon';

export const metadata: Metadata = { title: 'Categories' };

export default function Page() {
  return (
    <ComingSoon
      title="Categories"
      phase="Next up — step 3"
      description="Category browsing lands with the product catalogue in the next phase."
    />
  );
}

import type { Metadata } from 'next';
import { ComingSoon } from '@/components/layout/ComingSoon';

export const metadata: Metadata = { title: 'Your cart' };

export default function Page() {
  return (
    <ComingSoon
      title="Your cart"
      phase="Step 4"
      description="The cart and checkout flow are built after the catalogue, so prices can be computed server-side from real products."
    />
  );
}

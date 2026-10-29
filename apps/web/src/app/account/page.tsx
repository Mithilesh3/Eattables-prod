import type { Metadata } from 'next';
import { ComingSoon } from '@/components/layout/ComingSoon';

export const metadata: Metadata = { title: 'Account' };

export default function Page() {
  return (
    <ComingSoon
      title="Account"
      phase="Step 5"
      description="Customer login and signup use the existing Firebase Authentication setup and arrive after checkout."
    />
  );
}

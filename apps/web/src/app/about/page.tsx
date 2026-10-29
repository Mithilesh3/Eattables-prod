import type { Metadata } from 'next';
import { ComingSoon } from '@/components/layout/ComingSoon';

export const metadata: Metadata = { title: 'About' };

export default function Page() {
  return (
    <ComingSoon
      title="About"
      phase="Content pending"
      description="Brand copy for this page is pending from the business owner."
    />
  );
}

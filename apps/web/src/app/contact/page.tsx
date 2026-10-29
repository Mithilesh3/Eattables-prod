import type { Metadata } from 'next';
import { ComingSoon } from '@/components/layout/ComingSoon';

export const metadata: Metadata = { title: 'Contact' };

export default function Page() {
  return (
    <ComingSoon
      title="Contact"
      phase="Content pending"
      description="Contact details and the grievance officer information are pending from the business owner."
    />
  );
}

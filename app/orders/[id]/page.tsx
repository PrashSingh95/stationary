import type { Metadata } from 'next';

import { OrderDetailView } from '@/components/commerce/OrderDetailView';
import { SiteShell } from '@/components/SiteShell';

export const metadata: Metadata = {
  title: 'Order Tracking',
  description: 'Track order status and delivery details.',
};

export default function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <SiteShell>
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <OrderDetailView orderId={params.id} />
      </main>
    </SiteShell>
  );
}

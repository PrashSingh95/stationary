import type { Metadata } from 'next';

import { OrdersView } from '@/components/commerce/OrdersView';
import { SiteShell } from '@/components/SiteShell';

export const metadata: Metadata = {
  title: 'Orders',
  description: 'View order history and tracking status.',
};

export default function OrdersPage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase text-teal-700">
            Orders
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Order history
          </h1>
        </div>
        <OrdersView />
      </main>
    </SiteShell>
  );
}

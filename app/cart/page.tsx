import type { Metadata } from 'next';

import { CartView } from '@/components/commerce/CartView';
import { SiteShell } from '@/components/SiteShell';

export const metadata: Metadata = {
  title: 'Cart',
  description: 'Review cart items and continue to checkout.',
};

export default function CartPage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase text-teal-700">Cart</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Review your order
          </h1>
        </div>
        <CartView />
      </main>
    </SiteShell>
  );
}

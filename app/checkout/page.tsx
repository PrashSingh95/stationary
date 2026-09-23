import type { Metadata } from 'next';

import { CheckoutForm } from '@/components/commerce/CheckoutForm';
import { SiteShell } from '@/components/SiteShell';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Enter address, choose payment method, and place your order.',
};

export default function CheckoutPage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase text-teal-700">
            Checkout
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Address and payment
          </h1>
        </div>
        <CheckoutForm />
      </main>
    </SiteShell>
  );
}

import type { Metadata } from 'next';

import { LoginForm } from '@/components/commerce/LoginForm';
import { SiteShell } from '@/components/SiteShell';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login or create a customer account for BABA PUSTAK BHANDAR.',
};

export default function LoginPage() {
  return (
    <SiteShell>
      <main className="mx-auto grid max-w-5xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1fr_420px] lg:px-8">
        <section>
          <p className="text-sm font-semibold uppercase text-teal-700">
            Account
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Login, register, and continue shopping.
          </h1>
          <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
            Use a customer account to place orders, view order history, and track
            delivery status. Admin demo access is available with an email that
            contains “admin”.
          </p>
        </section>
        <LoginForm />
      </main>
    </SiteShell>
  );
}

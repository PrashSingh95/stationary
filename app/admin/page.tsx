import type { Metadata } from 'next';

import { AdminDashboard } from '@/components/commerce/AdminDashboard';
import { SiteShell } from '@/components/SiteShell';

export const metadata: Metadata = {
  title: 'Admin',
  description: 'Manage orders and inventory for BABA PUSTAK BHANDAR.',
};

export default function AdminPage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase text-teal-700">Admin</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Store operations
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            View orders, update status, and scan current inventory.
          </p>
        </div>
        <AdminDashboard />
      </main>
    </SiteShell>
  );
}

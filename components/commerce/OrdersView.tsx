'use client';

import Link from 'next/link';
import { PackageCheck } from 'lucide-react';

import { useCommerce } from '@/components/commerce/CommerceProvider';

export function OrdersView() {
  const { orders, user, logout } = useCommerce();

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="h-fit rounded-lg border border-border bg-card p-5 shadow-sm">
        <p className="text-sm text-muted-foreground">Signed in as</p>
        <p className="mt-1 font-semibold">{user?.email ?? 'Guest'}</p>
        <div className="mt-4 grid gap-2">
          <Link className="rounded-lg bg-muted px-3 py-2 text-sm font-semibold" href="/cart">
            Cart
          </Link>
          {user?.role === 'admin' ? (
            <Link className="rounded-lg bg-muted px-3 py-2 text-sm font-semibold" href="/admin">
              Admin
            </Link>
          ) : null}
          <button
            className="rounded-lg border border-border px-3 py-2 text-left text-sm font-semibold"
            onClick={logout}
            type="button"
          >
            Logout
          </button>
        </div>
      </aside>
      <section className="space-y-3">
        {orders.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
            <PackageCheck className="mx-auto size-8 text-teal-700" />
            <h2 className="mt-3 text-xl font-bold">No orders yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your order history will appear after checkout.
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <Link
              className="block rounded-lg border border-border bg-card p-5 shadow-sm transition hover:border-teal-300"
              href={`/orders/${order.id}`}
              key={order.id}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Order</p>
                  <h2 className="font-bold">{order.id}</h2>
                </div>
                <span className="rounded-full bg-teal-100 px-3 py-1 text-sm font-semibold text-teal-900">
                  {order.status.replaceAll('_', ' ')}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {order.items.length} item(s) • ₹{order.total}
              </p>
            </Link>
          ))
        )}
      </section>
    </div>
  );
}

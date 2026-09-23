'use client';

import { useMemo } from 'react';
import { Boxes, IndianRupee, PackageCheck, Users } from 'lucide-react';

import { products } from '@/data/products';
import { useCommerce } from '@/components/commerce/CommerceProvider';
import type { OrderStatus } from '@/types/commerce';

const statuses: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PACKED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
];

export function AdminDashboard() {
  const { orders, updateOrderStatus } = useCommerce();
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const lowStock = products.filter((product) => !product.inStock).length;
  const customers = useMemo(
    () => new Set(orders.map((order) => order.user.email)).size,
    [orders],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { Icon: PackageCheck, label: 'Orders', value: orders.length },
          { Icon: IndianRupee, label: 'Revenue', value: `₹${revenue}` },
          { Icon: Boxes, label: 'Out of stock', value: lowStock },
          { Icon: Users, label: 'Customers', value: customers },
        ].map(({ Icon, label, value }) => (
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm" key={label}>
            <Icon className="size-6 text-teal-700" />
            <p className="mt-4 text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-bold">Orders</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border text-muted-foreground">
              <tr>
                <th className="py-3">Order</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td className="py-5 text-muted-foreground" colSpan={5}>
                    No orders yet. Place a checkout order to see it here.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr className="border-b border-border" key={order.id}>
                    <td className="py-3 font-semibold">{order.id}</td>
                    <td>{order.user.email}</td>
                    <td>₹{order.total}</td>
                    <td>{order.paymentMethod}</td>
                    <td>
                      <select
                        className="h-9 rounded-lg border border-input bg-background px-2"
                        onChange={(event) =>
                          updateOrderStatus(order.id, event.target.value as OrderStatus)
                        }
                        value={order.status}
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status.replaceAll('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-bold">Inventory</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div className="rounded-lg border border-border p-4" key={product.id}>
              <p className="font-semibold">{product.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {product.category} • ₹{product.price}
              </p>
              <span
                className={`mt-3 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                  product.inStock
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {product.inStock ? 'Available' : 'Out of stock'}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

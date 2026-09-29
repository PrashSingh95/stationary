'use client';

import Link from 'next/link';

import { useCommerce } from '@/components/commerce/CommerceProvider';

const steps = ['PENDING', 'CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

export function OrderDetailView({ orderId }: { orderId: string }) {
  const { orders } = useCommerce();
  const order = orders.find((item) => item.id === orderId);

  if (!order) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
        <h2 className="text-xl font-bold">Order not found</h2>
        <Link className="mt-4 inline-flex rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white" href="/orders">
          Back to orders
        </Link>
      </div>
    );
  }

  const activeIndex = steps.indexOf(order.status);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Order</p>
            <h1 className="text-2xl font-bold">{order.id}</h1>
          </div>
          <span className="rounded-full bg-teal-100 px-3 py-1 text-sm font-semibold text-teal-900">
            {order.status.replaceAll('_', ' ')}
          </span>
        </div>
        <div className="mt-6 grid gap-3">
          {steps.map((step, index) => (
            <div className="flex items-center gap-3" key={step}>
              <span
                className={`grid size-8 place-items-center rounded-full text-sm font-bold ${
                  index <= activeIndex ? 'bg-teal-700 text-white' : 'bg-muted text-muted-foreground'
                }`}
              >
                {index + 1}
              </span>
              <span className="font-medium">{step.replaceAll('_', ' ')}</span>
            </div>
          ))}
        </div>
        <div className="mt-8 space-y-3">
          {order.items.map((item) => (
            <p className="flex justify-between text-sm" key={item.product.id}>
              <span>
                {item.product.name} × {item.quantity}
                {item.discountPercent > 0 ? (
                  <span className="ml-1 text-emerald-700">
                    ({item.discountPercent}% off)
                  </span>
                ) : null}
              </span>
              <span>₹{item.total ?? item.subtotal}</span>
            </p>
          ))}
        </div>
      </section>
      <aside className="h-fit rounded-lg border border-border bg-card p-5 shadow-sm">
        <h2 className="font-bold">Delivery</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {order.address.recipientName}
          <br />
          {order.address.line1}
          {order.address.line2 ? `, ${order.address.line2}` : ''}
          <br />
          {order.address.city}, {order.address.state} {order.address.postalCode}
          <br />
          {order.address.phone}
        </p>
        <div className="mt-5 border-t border-border pt-4 text-sm">
          <p className="flex justify-between">
            <span>Payment</span>
            <span>{order.paymentMethod}</span>
          </p>
          <p className="mt-2 flex justify-between">
            <span>Subtotal</span>
            <span>₹{order.subtotal ?? order.total}</span>
          </p>
          {order.discountAmount ? (
            <p className="mt-2 flex justify-between text-emerald-700">
              <span>Product discounts</span>
              <span>-₹{order.discountAmount}</span>
            </p>
          ) : null}
          <p className="mt-2 flex justify-between font-bold">
            <span>Total</span>
            <span>₹{order.total}</span>
          </p>
        </div>
      </aside>
    </div>
  );
}

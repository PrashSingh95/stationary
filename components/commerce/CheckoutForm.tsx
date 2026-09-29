'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, IndianRupee, MapPin } from 'lucide-react';

import { useCommerce } from '@/components/commerce/CommerceProvider';
import type { PaymentMethod } from '@/types/commerce';

export function CheckoutForm() {
  const router = useRouter();
  const {
    cartDiscountAmount,
    cartGrandTotal,
    cartItems,
    cartTotal,
    placeOrder,
  } = useCommerce();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [form, setForm] = useState({
    recipientName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
  });

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event: { preventDefault: () => void }) {
    event.preventDefault();
    const order = placeOrder({ address: form, paymentMethod });
    router.push(`/orders/${order.id}`);
  }

  if (cartItems.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
        <h2 className="text-xl font-bold">Cart is empty</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Add items before checkout.
        </p>
      </div>
    );
  }

  return (
    <form className="grid gap-6 lg:grid-cols-[1fr_340px]" onSubmit={submit}>
      <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <MapPin className="size-5 text-teal-700" />
          Delivery address
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {[
            ['recipientName', 'Recipient name'],
            ['phone', 'Phone'],
            ['line1', 'Address line 1'],
            ['line2', 'Address line 2'],
            ['city', 'City'],
            ['state', 'State'],
            ['postalCode', 'Postal code'],
          ].map(([field, label]) => (
            <label className={field === 'line1' || field === 'line2' ? 'sm:col-span-2' : ''} key={field}>
              <span className="text-sm font-medium">{label}</span>
              <input
                className="mt-1 h-11 w-full rounded-lg border border-input bg-background px-3 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                onChange={(event) => update(field as keyof typeof form, event.target.value)}
                required={field !== 'line2'}
                value={form[field as keyof typeof form]}
              />
            </label>
          ))}
        </div>

        <h2 className="mt-8 flex items-center gap-2 text-lg font-bold">
          <CreditCard className="size-5 text-teal-700" />
          Payment method
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            ['COD', 'Cash on delivery', 'Pay when the shop confirms delivery or pickup.'],
            ['ONLINE', 'Online payment', 'Sandbox-ready placeholder for Razorpay integration.'],
          ].map(([value, title, text]) => (
            <label
              className={`cursor-pointer rounded-lg border p-4 ${
                paymentMethod === value ? 'border-teal-500 bg-teal-50' : 'border-border'
              }`}
              key={value}
            >
              <input
                className="sr-only"
                checked={paymentMethod === value}
                onChange={() => setPaymentMethod(value as PaymentMethod)}
                type="radio"
              />
              <span className="font-semibold">{title}</span>
              <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                {text}
              </span>
            </label>
          ))}
        </div>
      </section>

      <aside className="h-fit rounded-lg border border-border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-bold">Review order</h2>
        <div className="mt-4 space-y-3">
          {cartItems.map((item) => (
            <p className="flex justify-between gap-3 text-sm" key={item.product.id}>
              <span>
                {item.product.name} × {item.quantity}
                {item.discountPercent > 0 ? (
                  <span className="ml-1 text-emerald-700">
                    ({item.discountPercent}% off)
                  </span>
                ) : null}
              </span>
              <span>₹{item.total}</span>
            </p>
          ))}
          <p className="flex justify-between border-t border-border pt-3 text-sm">
            <span>Subtotal</span>
            <span>₹{cartTotal}</span>
          </p>
          {cartDiscountAmount > 0 ? (
            <p className="flex justify-between text-sm text-emerald-700">
              <span>Product discounts</span>
              <span>-₹{cartDiscountAmount}</span>
            </p>
          ) : null}
          <p className="flex justify-between font-bold">
            <span>Total</span>
            <span>₹{cartGrandTotal}</span>
          </p>
        </div>
        <button className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-teal-700 font-semibold text-white hover:bg-teal-800">
          <IndianRupee className="size-4" />
          Place order
        </button>
      </aside>
    </form>
  );
}

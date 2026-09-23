'use client';

import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';

import { ProductVisual } from '@/components/ProductVisual';
import { useCommerce } from '@/components/commerce/CommerceProvider';

export function CartView() {
  const { cartItems, cartTotal, updateQuantity, removeFromCart } = useCommerce();

  if (cartItems.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
        <h2 className="text-xl font-bold">Your cart is empty</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Add notebooks, pens, school supplies, or printing services to checkout.
        </p>
        <Link
          className="mt-6 inline-flex rounded-lg bg-teal-700 px-5 py-2 font-semibold text-white"
          href="/products"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-3">
        {cartItems.map((item) => (
          <article
            className="grid gap-4 rounded-lg border border-border bg-card p-4 shadow-sm sm:grid-cols-[120px_1fr_auto]"
            key={item.product.id}
          >
            <ProductVisual type={item.product.images[0]} label={item.product.name} />
            <div>
              <p className="text-xs font-semibold uppercase text-teal-700">
                {item.product.brand}
              </p>
              <h2 className="mt-1 font-semibold">{item.product.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                ₹{item.product.price} each
              </p>
              <button
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-rose-700"
                onClick={() => removeFromCart(item.product.id)}
                type="button"
              >
                <Trash2 className="size-4" />
                Remove
              </button>
            </div>
            <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
              <div className="inline-flex items-center overflow-hidden rounded-lg border border-border">
                <button
                  aria-label="Decrease quantity"
                  className="grid size-9 place-items-center hover:bg-muted"
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  type="button"
                >
                  <Minus className="size-4" />
                </button>
                <span className="grid h-9 min-w-10 place-items-center text-sm font-semibold">
                  {item.quantity}
                </span>
                <button
                  aria-label="Increase quantity"
                  className="grid size-9 place-items-center hover:bg-muted"
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  type="button"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <p className="text-lg font-bold">₹{item.subtotal}</p>
            </div>
          </article>
        ))}
      </div>
      <aside className="h-fit rounded-lg border border-border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-bold">Order summary</h2>
        <div className="mt-4 space-y-3 text-sm">
          <p className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{cartTotal}</span>
          </p>
          <p className="flex justify-between">
            <span>Delivery</span>
            <span>Shop confirmation</span>
          </p>
          <p className="flex justify-between border-t border-border pt-3 text-base font-bold">
            <span>Total</span>
            <span>₹{cartTotal}</span>
          </p>
        </div>
        <Link
          className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-lg bg-teal-700 font-semibold text-white hover:bg-teal-800"
          href="/checkout"
        >
          Checkout
        </Link>
      </aside>
    </div>
  );
}

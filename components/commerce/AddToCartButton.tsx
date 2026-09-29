'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';

import { useCommerce } from '@/components/commerce/CommerceProvider';
import type { Product } from '@/types/product';

export function AddToCartButton({
  product,
  className = '',
  label = 'Add to cart',
}: {
  product: Product;
  className?: string;
  label?: string;
}) {
  const { addToCart } = useCommerce();
  const [added, setAdded] = useState(false);

  return (
    <button
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white shadow-sm shadow-emerald-900/15 transition hover:bg-emerald-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600 disabled:shadow-none ${className}`}
      disabled={!product.inStock}
      onClick={() => {
        addToCart(product);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1400);
      }}
      type="button"
    >
      <ShoppingCart className="size-4" />
      {product.inStock ? (added ? 'Added' : label) : 'Out of stock'}
    </button>
  );
}

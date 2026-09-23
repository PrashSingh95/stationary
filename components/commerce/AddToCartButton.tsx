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
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-zinc-300 ${className}`}
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

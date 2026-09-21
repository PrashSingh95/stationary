import Link from 'next/link';
import { MessageCircle, PackageCheck } from 'lucide-react';

import { makeWhatsAppUrl } from '@/data/products';
import type { Product } from '@/types/product';
import { ProductVisual } from '@/components/ProductVisual';

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/products/${product.slug}`} className="block p-3">
        <ProductVisual type={product.images[0]} label={product.name} />
      </Link>
      <div className="space-y-3 px-4 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase text-teal-700">
            {product.brand}
          </p>
          <Link
            href={`/products/${product.slug}`}
            className="mt-1 block text-base font-semibold transition hover:text-teal-700"
          >
            {product.name}
          </Link>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold">₹{product.price}</span>
            {product.originalPrice ? (
              <span className="text-sm text-muted-foreground line-through">
                ₹{product.originalPrice}
              </span>
            ) : null}
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
              product.inStock
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            <PackageCheck className="size-3" />
            {product.inStock ? 'In stock' : 'Ask shop'}
          </span>
        </div>
        <a
          className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-3 text-sm font-semibold text-white transition hover:bg-teal-800"
          href={makeWhatsAppUrl(product)}
          target="_blank"
          rel="noreferrer"
        >
          <MessageCircle className="size-4" />
          WhatsApp to order
        </a>
      </div>
    </article>
  );
}

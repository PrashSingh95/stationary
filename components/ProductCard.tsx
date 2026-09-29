import Link from 'next/link';
import { MessageCircle, PackageCheck } from 'lucide-react';

import { AddToCartButton } from '@/components/commerce/AddToCartButton';
import { makeWhatsAppUrl } from '@/data/products';
import type { Product } from '@/types/product';
import { ProductVisual } from '@/components/ProductVisual';

export function ProductCard({ product }: { product: Product }) {
  const discountPercent = product.discountPercent ?? 0;
  const discountedPrice = Math.max(
    0,
    Math.round(product.price - (product.price * discountPercent) / 100),
  );
  const hasDiscount = discountPercent > 0;

  return (
    <article className="group overflow-hidden rounded-lg border border-emerald-900/10 bg-card shadow-sm shadow-emerald-950/5 transition duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-950/10">
      <Link href={`/products/${product.slug}`} className="block p-3 pb-2">
        <ProductVisual type={product.images[0]} label={product.name} />
      </Link>
      <div className="space-y-3 px-4 pb-4">
        <div>
          <p className="text-xs font-bold uppercase text-emerald-700">
            {product.brand}
          </p>
          <Link
            href={`/products/${product.slug}`}
            className="mt-1 block min-h-12 text-base font-bold leading-6 transition hover:text-emerald-700"
          >
            {product.name}
          </Link>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black tabular-nums text-emerald-950">
              ₹{hasDiscount ? discountedPrice : product.price}
            </span>
            {hasDiscount || product.originalPrice ? (
              <span className="text-sm text-muted-foreground line-through">
                ₹{product.originalPrice ?? product.price}
              </span>
            ) : null}
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
              product.inStock
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            <PackageCheck className="size-3" />
            {product.inStock ? 'In stock' : 'Ask shop'}
          </span>
        </div>
        {hasDiscount ? (
          <p className="inline-flex rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-800">
            {discountPercent}% product discount
          </p>
        ) : null}
        <div className="grid gap-2">
          <AddToCartButton product={product} className="h-10 w-full" />
          <a
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-emerald-900/10 bg-white px-3 text-sm font-bold transition hover:border-emerald-300 hover:bg-emerald-50"
            href={makeWhatsAppUrl(product)}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle className="size-4" />
            WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}

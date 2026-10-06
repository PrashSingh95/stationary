import Link from 'next/link';
import { PackageCheck } from 'lucide-react';

import { AddToCartButton } from '@/components/commerce/AddToCartButton';
import { getProductPricing } from '@/lib/commerce/pricing';
import type { Product } from '@/types/product';
import { ProductVisual } from '@/components/ProductVisual';

export function ProductCard({ product }: { product: Product }) {
  const pricing = getProductPricing(product);
  const showMrp = pricing.mrp > pricing.sellingPrice;

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
              ₹{pricing.sellingPrice}
            </span>
            {showMrp ? (
              <span className="text-sm text-muted-foreground line-through">
                ₹{pricing.mrp}
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
        {pricing.hasDiscount ? (
          <p className="inline-flex rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-800">
            {pricing.discountPercent}% product discount
          </p>
        ) : null}
        <div className="grid gap-2">
          <AddToCartButton product={product} className="h-10 w-full" />
        </div>
      </div>
    </article>
  );
}

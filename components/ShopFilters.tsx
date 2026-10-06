'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal } from 'lucide-react';

import type { Product } from '@/types/product';
import { ProductCard } from '@/components/ProductCard';
import { useCommerce } from '@/components/commerce/CommerceProvider';
import { getProductPricing } from '@/lib/commerce/pricing';

type SortMode = 'popular' | 'low' | 'high';

export function ShopFilters({
  products,
  initialCategory = 'all',
}: {
  products: Product[];
  initialCategory?: string;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState<SortMode>('popular');
  const { categories, products: managedProducts } = useCommerce();
  const displayProducts = managedProducts.length ? managedProducts : products;

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return displayProducts
      .filter((product) => {
        const matchesCategory =
          category === 'all' || product.category === category;
        const text = [
          product.name,
          product.brand,
          product.description,
          product.category,
          ...product.specs,
        ]
          .join(' ')
          .toLowerCase();

        return matchesCategory && text.includes(normalizedQuery);
      })
      .sort((a, b) => {
        const aPrice = getProductPricing(a).sellingPrice;
        const bPrice = getProductPricing(b).sellingPrice;
        if (sort === 'low') return aPrice - bPrice;
        if (sort === 'high') return bPrice - aPrice;
        return (
          Number(b.popular || b.featured) - Number(a.popular || a.featured)
        );
      });
  }, [category, displayProducts, query, sort]);

  return (
    <section className="space-y-6">
      <div className="grid gap-3 rounded-lg border border-border bg-card p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_210px]">
        <label className="relative block">
          <span className="sr-only">Search products</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products..."
            value={query}
          />
        </label>
        <label className="relative block">
          <span className="sr-only">Sort products</span>
          <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <select
            className="h-11 w-full appearance-none rounded-lg border border-input bg-background pl-10 pr-8 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            onChange={(event) => setSort(event.target.value as SortMode)}
            value={sort}
          >
            <option value="popular">Popular</option>
            <option value="low">Price low to high</option>
            <option value="high">Price high to low</option>
          </select>
        </label>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
            category === 'all'
              ? 'border-teal-700 bg-teal-700 text-white'
              : 'border-border bg-card hover:border-teal-300'
          }`}
          onClick={() => setCategory('all')}
          type="button"
        >
          All
        </button>
        {categories.map((item) => (
          <button
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
              category === item.slug
                ? 'border-teal-700 bg-teal-700 text-white'
                : 'border-border bg-card hover:border-teal-300'
            }`}
            key={item.slug}
            onClick={() => setCategory(item.slug)}
            type="button"
          >
            {item.name}
          </button>
        ))}
      </div>

      {visibleProducts.length ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
          <p className="font-semibold">No matching products found</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try a different search term or browse all categories.
          </p>
          <Link
            className="mt-5 inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
            href="/contact"
          >
            Ask on WhatsApp
          </Link>
        </div>
      )}
    </section>
  );
}

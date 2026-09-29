import type { Metadata } from 'next';

import { ShopFilters } from '@/components/ShopFilters';
import { SiteShell } from '@/components/SiteShell';
import { listProducts } from '@/lib/api/products';

export const metadata: Metadata = {
  title: 'Products',
  description:
    'Search and browse stationery products with price, stock status, and WhatsApp ordering.',
};

export default async function ProductsPage() {
  const products = await listProducts();

  return (
    <SiteShell>
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <h1 className="text-4xl font-black tracking-tight text-emerald-950 md:text-5xl">
            All products
          </h1>
          <p className="mt-3 text-lg font-bold text-emerald-700">
            Search the stationery shelf
          </p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
            Filter by category, sort by price, and open any product to check
            details.
          </p>
        </div>
        <ShopFilters products={products} />
      </main>
    </SiteShell>
  );
}

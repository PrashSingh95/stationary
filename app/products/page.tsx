import type { Metadata } from 'next';

import { SectionHeader } from '@/components/SectionHeader';
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
        <SectionHeader
          eyebrow="All products"
          title="Search the stationery shelf"
          text="Filter by category, sort by price, and open any product to check details."
        />
        <ShopFilters products={products} />
      </main>
    </SiteShell>
  );
}

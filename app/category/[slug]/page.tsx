import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SectionHeader } from '@/components/SectionHeader';
import { ShopFilters } from '@/components/ShopFilters';
import { SiteShell } from '@/components/SiteShell';
import { categories } from '@/data/categories';
import {
  getCategory,
  listProducts,
} from '@/lib/api/products';

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const category = await getCategory(params.slug);

  if (!category) return {};

  return {
    title: category.name,
    description: category.description,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const category = await getCategory(params.slug);

  if (!category) notFound();

  const products = await listProducts();

  return (
    <SiteShell>
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Category"
          title={category.name}
          text={category.description}
        />
        <ShopFilters products={products} initialCategory={category.slug} />
      </main>
    </SiteShell>
  );
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SectionHeader } from '@/components/SectionHeader';
import { ShopFilters } from '@/components/ShopFilters';
import { SiteShell } from '@/components/SiteShell';
import { categories, getCategory } from '@/data/categories';
import { products } from '@/data/products';

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const category = getCategory(params.slug);

  if (!category) return {};

  return {
    title: category.name,
    description: category.description,
  };
}

export default function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const category = getCategory(params.slug);

  if (!category) notFound();

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

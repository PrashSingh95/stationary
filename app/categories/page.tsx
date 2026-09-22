import type { Metadata } from 'next';

import { CategoryCard } from '@/components/CategoryCard';
import { SectionHeader } from '@/components/SectionHeader';
import { SiteShell } from '@/components/SiteShell';
import { listCategories } from '@/lib/api/products';

export const metadata: Metadata = {
  title: 'Categories',
  description: 'Browse stationery categories for school, office, art, and printing needs.',
};

export default async function CategoriesPage() {
  const categories = await listCategories();

  return (
    <SiteShell>
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Categories"
          title="Shop by what you need"
          text="Every category leads to a focused product shelf with the same quick search and ordering flow."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard category={category} key={category.slug} />
          ))}
        </div>
      </main>
    </SiteShell>
  );
}

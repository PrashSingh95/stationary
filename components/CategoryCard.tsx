import Link from 'next/link';
import {
  BookOpen,
  BriefcaseBusiness,
  Brush,
  FileText,
  FolderOpen,
  PenTool,
  Printer,
  Ruler,
} from 'lucide-react';

import type { Category } from '@/types/product';

const icons = {
  'pens-pencils': PenTool,
  notebooks: BookOpen,
  'school-supplies': BriefcaseBusiness,
  'office-supplies': FileText,
  'art-craft': Brush,
  'files-folders': FolderOpen,
  'geometry-supplies': Ruler,
  'printing-services': Printer,
};

export function CategoryCard({ category }: { category: Category }) {
  const Icon = icons[category.slug as keyof typeof icons] ?? FileText;

  return (
    <Link
      className="group rounded-lg border border-border bg-card p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-teal-300 hover:shadow-xl"
      href={`/category/${category.slug}`}
    >
      <span
        className={`mb-5 inline-grid size-12 place-items-center rounded-lg ${category.color}`}
      >
        <Icon className="size-5" />
      </span>
      <h3 className="text-base font-semibold">{category.name}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {category.description}
      </p>
    </Link>
  );
}

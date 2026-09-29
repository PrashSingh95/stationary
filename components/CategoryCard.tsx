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
      className="group rounded-lg border border-emerald-900/10 bg-card p-5 shadow-sm shadow-emerald-950/5 transition duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-950/10"
      href={`/category/${category.slug}`}
    >
      <span
        className={`mb-5 inline-grid size-12 place-items-center rounded-lg shadow-inner ${category.color}`}
      >
        <Icon className="size-5" />
      </span>
      <h3 className="text-base font-bold text-emerald-950 transition group-hover:text-emerald-700">
        {category.name}
      </h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {category.description}
      </p>
    </Link>
  );
}

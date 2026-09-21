import type { Category } from '@/types/product';

export const categories: Category[] = [
  {
    name: 'Pens & Pencils',
    slug: 'pens-pencils',
    description: 'Ball pens, gel pens, pencils, erasers, and everyday writing tools.',
    color: 'bg-teal-100 text-teal-900',
  },
  {
    name: 'Notebooks',
    slug: 'notebooks',
    description: 'School notebooks, registers, spiral pads, and practical writing books.',
    color: 'bg-rose-100 text-rose-900',
  },
  {
    name: 'School Supplies',
    slug: 'school-supplies',
    description: 'Daily classroom essentials for students, parents, and teachers.',
    color: 'bg-sky-100 text-sky-900',
  },
  {
    name: 'Office Supplies',
    slug: 'office-supplies',
    description: 'Files, clips, sticky notes, markers, diaries, and desk basics.',
    color: 'bg-zinc-100 text-zinc-900',
  },
  {
    name: 'Art & Craft',
    slug: 'art-craft',
    description: 'Colors, brushes, craft paper, glue, scissors, and creative materials.',
    color: 'bg-amber-100 text-amber-950',
  },
  {
    name: 'Files & Folders',
    slug: 'files-folders',
    description: 'Document files, clear folders, report covers, and project storage.',
    color: 'bg-indigo-100 text-indigo-950',
  },
  {
    name: 'Geometry Supplies',
    slug: 'geometry-supplies',
    description: 'Geometry boxes, rulers, compasses, protractors, and exam tools.',
    color: 'bg-emerald-100 text-emerald-950',
  },
  {
    name: 'Printing Services',
    slug: 'printing-services',
    description: 'Quick black-and-white prints, color prints, photocopy, and lamination.',
    color: 'bg-orange-100 text-orange-950',
  },
];

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}

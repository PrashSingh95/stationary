import {
  BookOpen,
  BriefcaseBusiness,
  ClipboardList,
  Copy,
  FileText,
  FolderOpen,
  Highlighter,
  NotebookPen,
  Paintbrush,
  Paperclip,
  Pencil,
  PenLine,
  Printer,
  Ruler,
} from 'lucide-react';

const iconMap = {
  notebook: NotebookPen,
  pen: PenLine,
  colors: Paintbrush,
  pencil: Pencil,
  sticky: ClipboardList,
  folder: FolderOpen,
  geometry: Ruler,
  print: Printer,
  glue: Highlighter,
  register: BookOpen,
  clips: Paperclip,
  exam: BriefcaseBusiness,
  default: FileText,
};

const paletteMap = {
  notebook: 'from-teal-100 via-white to-coral-100 text-teal-800',
  pen: 'from-sky-100 via-white to-teal-100 text-sky-800',
  colors: 'from-amber-100 via-white to-rose-100 text-rose-800',
  pencil: 'from-yellow-100 via-white to-orange-100 text-orange-800',
  sticky: 'from-lime-100 via-white to-cyan-100 text-lime-900',
  folder: 'from-indigo-100 via-white to-sky-100 text-indigo-800',
  geometry: 'from-emerald-100 via-white to-stone-100 text-emerald-800',
  print: 'from-zinc-100 via-white to-sky-100 text-zinc-800',
  glue: 'from-orange-100 via-white to-amber-100 text-orange-800',
  register: 'from-blue-100 via-white to-teal-100 text-blue-800',
  clips: 'from-rose-100 via-white to-amber-100 text-rose-800',
  exam: 'from-teal-100 via-white to-indigo-100 text-teal-800',
  default: 'from-stone-100 via-white to-slate-100 text-slate-800',
};

export function ProductVisual({
  type,
  label,
  large = false,
}: {
  type: string;
  label: string;
  large?: boolean;
}) {
  const Icon = iconMap[type as keyof typeof iconMap] ?? iconMap.default;
  const palette =
    paletteMap[type as keyof typeof paletteMap] ?? paletteMap.default;

  return (
    <div
      aria-label={label}
      className={`relative grid overflow-hidden rounded-lg bg-gradient-to-br ${palette} ${
        large ? 'min-h-[360px]' : 'aspect-[4/3]'
      } place-items-center border border-white/70 shadow-inner`}
    >
      <div className="absolute left-4 top-4 h-14 w-14 rounded-full bg-white/55 blur-sm" />
      <div className="absolute bottom-5 right-5 h-24 w-24 rounded-full bg-white/45 blur-md" />
      <Icon className={large ? 'size-28' : 'size-16'} strokeWidth={1.45} />
      <Copy className="absolute bottom-5 left-5 size-6 opacity-25" />
    </div>
  );
}

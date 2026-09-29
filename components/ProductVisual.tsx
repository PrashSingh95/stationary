import Image from 'next/image';
import { Copy, FileText } from 'lucide-react';

import { getProductImageSrc } from '@/lib/product-images';

const iconMap = {
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
  const imageSrc = getProductImageSrc(type);
  const Icon = iconMap.default;
  const palette =
    paletteMap[type as keyof typeof paletteMap] ?? paletteMap.default;

  if (imageSrc) {
    return (
      <div
        aria-label={label}
        className={`relative overflow-hidden rounded-lg border border-emerald-900/10 bg-[#f7f1e8] ${
          large ? 'min-h-[360px]' : 'aspect-[4/3]'
        } shadow-inner shadow-emerald-950/10`}
      >
        <Image
          alt={label}
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          fill
          sizes={
            large
              ? '(min-width: 1024px) 54vw, 100vw'
              : '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw'
          }
          src={imageSrc}
          unoptimized={imageSrc.startsWith('data:image/')}
        />
      </div>
    );
  }

  return (
    <div
      aria-label={label}
      className={`relative grid overflow-hidden rounded-lg bg-gradient-to-br ${palette} ${
        large ? 'min-h-[360px]' : 'aspect-[4/3]'
      } place-items-center border border-white/70 shadow-inner shadow-emerald-950/10`}
    >
      <div className="absolute left-4 top-4 h-14 w-14 rounded-full bg-white/55 blur-sm" />
      <div className="absolute bottom-5 right-5 h-24 w-24 rounded-full bg-white/45 blur-md" />
      <Icon className={large ? 'size-28' : 'size-16'} strokeWidth={1.45} />
      <Copy className="absolute bottom-5 left-5 size-6 opacity-25" />
    </div>
  );
}

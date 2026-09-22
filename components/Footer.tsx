import Link from 'next/link';
import { MapPin, MessageCircle, Phone, Timer } from 'lucide-react';

import { shop } from '@/data/products';

export function Footer() {
  return (
    <footer className="border-t border-border bg-zinc-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
        <div>
          <p className="text-lg font-bold">BABA PUSTAK BHANDAR</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-zinc-300">
            A friendly local shop for school, office, art, printing, and
            everyday stationery essentials.
          </p>
        </div>
        <div>
          <p className="font-semibold">Shop</p>
          <div className="mt-3 grid gap-2 text-sm text-zinc-300">
            <Link href="/products">Products</Link>
            <Link href="/categories">Categories</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
        <div className="space-y-3 text-sm text-zinc-300">
          <p className="flex gap-2">
            <MapPin className="mt-0.5 size-4 text-teal-300" />
            {shop.address}
          </p>
          <p className="flex gap-2">
            <Timer className="mt-0.5 size-4 text-teal-300" />
            {shop.hours}
          </p>
          <p className="flex gap-2">
            <Phone className="mt-0.5 size-4 text-teal-300" />
            {shop.displayPhone}
          </p>
          <a
            className="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2 font-semibold text-zinc-950"
            href={`https://wa.me/${shop.phone}`}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle className="size-4" />
            Open WhatsApp
          </a>
        </div>
      </div>
    </footer>
  );
}

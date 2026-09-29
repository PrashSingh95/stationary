import Link from 'next/link';
import { MapPin, MessageCircle, Phone, Timer } from 'lucide-react';

import { shop } from '@/data/products';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card text-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
        <div>
          <p className="text-lg font-bold">Baba Pustak Bhandar</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            A friendly local shop for school, office, art, printing, and
            everyday stationery essentials.
          </p>
        </div>
        <div>
          <p className="font-semibold">Shop</p>
          <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
            <Link href="/products">Products</Link>
            <Link href="/categories">Categories</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p className="flex gap-2">
            <MapPin className="mt-0.5 size-4 text-teal-700" />
            {shop.address}
          </p>
          <p className="flex gap-2">
            <Timer className="mt-0.5 size-4 text-teal-700" />
            {shop.hours}
          </p>
          <p className="flex gap-2">
            <Phone className="mt-0.5 size-4 text-teal-700" />
            {shop.displayPhone}
          </p>
          <a
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 font-semibold text-foreground transition hover:border-teal-300 hover:bg-muted"
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

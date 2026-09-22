import type { Metadata } from 'next';
import { Clock, MapPin, MessageCircle, Phone } from 'lucide-react';

import { SiteShell } from '@/components/SiteShell';
import { makeWhatsAppUrl, shop } from '@/data/products';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact BABA PUSTAK BHANDAR by phone, WhatsApp, or visiting the store.',
};

export default function ContactPage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase text-teal-700">
            Contact
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Ask about products, prints, or school lists.
          </h1>
          <p className="mt-4 leading-7 text-muted-foreground">
            Send a WhatsApp message for availability and order requests, or
            visit the store during business hours.
          </p>
        </div>

        <section className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            { Icon: MapPin, label: 'Address', value: shop.address },
            { Icon: Clock, label: 'Timings', value: shop.hours },
            { Icon: Phone, label: 'Phone', value: shop.displayPhone },
          ].map(({ Icon, label, value }) => (
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm" key={label}>
              <Icon className="size-7 text-teal-700" />
              <h2 className="mt-4 font-semibold">{label}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {value}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-lg border border-teal-200 bg-teal-50 p-6 text-center md:p-10">
          <MessageCircle className="mx-auto size-10 text-teal-700" />
          <h2 className="mt-4 text-2xl font-bold">
            Order or enquire through WhatsApp
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            The product detail pages create a ready-to-send order message. You
            can also use the general contact button for custom requests.
          </p>
          <a
            className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-teal-700 px-6 font-semibold text-white transition hover:bg-teal-800"
            href={makeWhatsAppUrl()}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle className="size-5" />
            Open WhatsApp
          </a>
        </section>
      </main>
    </SiteShell>
  );
}

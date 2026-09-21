import type { Metadata } from 'next';
import Image from 'next/image';
import { BadgeCheck, HeartHandshake, PackageSearch } from 'lucide-react';

import { SiteShell } from '@/components/SiteShell';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about PaperNest Stationery and the shop experience.',
};

export default function AboutPage() {
  return (
    <SiteShell>
      <main>
        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase text-teal-700">
              About the shop
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">
              A practical stationery store for daily school and office needs.
            </h1>
            <p className="mt-5 leading-7 text-muted-foreground">
              PaperNest Stationery helps students, parents, teachers, artists,
              and offices quickly find the essentials they need. Phase 1 keeps
              the experience simple: browse, search, check details, and contact
              the shop on WhatsApp.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { Icon: BadgeCheck, label: 'Reliable stock' },
                { Icon: PackageSearch, label: 'Easy browsing' },
                { Icon: HeartHandshake, label: 'Friendly help' },
              ].map(({ Icon, label }) => (
                <div className="rounded-lg border border-border bg-card p-4" key={label}>
                  <Icon className="size-6 text-teal-700" />
                  <p className="mt-3 text-sm font-semibold">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <Image
            alt="Stationery shop counter with notebooks and pens"
            className="aspect-[4/3] rounded-lg object-cover shadow-xl"
            height={960}
            src="/images/stationery-hero.png"
            width={1536}
          />
        </section>
      </main>
    </SiteShell>
  );
}

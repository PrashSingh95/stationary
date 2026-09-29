import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  MessageCircle,
  PackageCheck,
  Truck,
} from 'lucide-react';

import { CategoryCard } from '@/components/CategoryCard';
import { ProductCard } from '@/components/ProductCard';
import { SectionHeader } from '@/components/SectionHeader';
import { SiteShell } from '@/components/SiteShell';
import { makeWhatsAppUrl, shop } from '@/data/products';
import { listCategories, listProducts } from '@/lib/api/products';

export default async function Home() {
  const categories = await listCategories();
  const products = await listProducts();
  const featuredProducts = products.filter((product) => product.featured).slice(0, 4);
  const popularProducts = products.filter((product) => product.popular).slice(0, 4);

  return (
    <SiteShell>
      <main>
        <section className="relative overflow-hidden bg-emerald-50/60">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-600 via-orange-500 to-amber-400" />
          <div className="absolute -left-24 top-24 h-64 w-64 rounded-full bg-emerald-200/45 blur-3xl" />
          <div className="absolute -right-24 bottom-16 h-72 w-72 rounded-full bg-orange-200/45 blur-3xl" />
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 md:grid-cols-[0.92fr_1.08fr] md:py-16 lg:px-8">
            <div className="relative z-10 animate-fade-up">
              <p className="inline-flex rounded-full border border-emerald-200 bg-white px-3 py-1 text-sm font-bold text-emerald-800 shadow-sm">
                School • Office • Art • Printing
              </p>
              <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-emerald-950 sm:text-5xl lg:text-6xl">
                Everyday stationery, ready for school and office runs.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-zinc-600 sm:text-lg">
                Browse notebooks, pens, school supplies, office essentials, art
                materials, and quick print services from your neighborhood
                stationery shop.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800"
                  href="/products"
                >
                  Shop products
                  <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                </Link>
                <a
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-700"
                  href={makeWhatsAppUrl()}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="size-4" />
                  WhatsApp us
                </a>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-3 text-sm">
                {[
                  ['500+', 'Items'],
                  ['8', 'Categories'],
                  ['Same day', 'Pickup'],
                ].map(([value, label]) => (
                  <div
                    className="rounded-lg border border-emerald-900/10 bg-white p-3 shadow-sm shadow-emerald-950/5"
                    key={label}
                  >
                    <p className="font-black text-emerald-950">{value}</p>
                    <p className="text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <Image
                alt="Stationery products arranged in a bright shop"
                className="aspect-[4/3] rounded-lg border border-white/70 object-cover shadow-2xl shadow-emerald-950/15"
                height={960}
                priority
                src="/images/stationery-hero.png"
                width={1536}
              />
              <div className="absolute -bottom-5 left-5 right-5 rounded-lg border border-white/70 bg-white/95 p-4 shadow-xl shadow-emerald-950/10 backdrop-blur">
                <p className="text-sm font-black text-emerald-950">
                  Today&apos;s offer
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  Save on notebooks, files, and exam kits this week.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Shop by category"
            title="Find the right supplies faster"
            text="Start with a category, then filter or search products instantly."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <CategoryCard category={category} key={category.slug} />
            ))}
          </div>
        </section>

        <section className="bg-white/80 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="Featured products"
              title="Popular essentials ready now"
              text="Check price and availability, then send an order request through WhatsApp."
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard product={product} key={product.id} />
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-6 overflow-hidden rounded-lg bg-emerald-950 p-6 text-white shadow-2xl shadow-emerald-950/15 md:grid-cols-[1fr_auto] md:items-center md:p-8">
            <div>
              <p className="text-sm font-black uppercase text-orange-300">
                Special offer
              </p>
              <h2 className="mt-2 text-3xl font-bold">
                Exam season combo kits are available now.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300">
                Pens, pencils, eraser, sharpener, ruler, pouch, and notebook
                add-ons packed for quick pickup.
              </p>
            </div>
            <Link
              className="inline-flex h-11 items-center justify-center rounded-lg bg-orange-500 px-5 font-bold text-white transition hover:bg-orange-600"
              href="/products"
            >
              Browse offers
            </Link>
          </div>
        </section>

        <section className="bg-emerald-50/70 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="Why shop with us"
              title="Built for quick local shopping"
            />
            <div className="grid gap-4 md:grid-cols-4">
              {[
                {
                  Icon: PackageCheck,
                  title: 'Live availability',
                  text: 'Products show whether they are ready for pickup.',
                },
                {
                  Icon: MessageCircle,
                  title: 'WhatsApp orders',
                  text: 'Ask questions or place a quick request without checkout.',
                },
                {
                  Icon: Truck,
                  title: 'Local pickup',
                  text: 'Reserve items and collect them from the shop.',
                },
                {
                  Icon: Clock,
                  title: 'Practical hours',
                  text: `${shop.hours} for school and office needs.`,
                },
              ].map(({ Icon, title, text }) => (
                <div
                  className="rounded-lg border border-emerald-900/10 bg-white p-5 shadow-sm shadow-emerald-950/5"
                  key={title}
                >
                  <Icon className="size-7 text-emerald-700" />
                  <h3 className="mt-4 font-bold text-emerald-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Popular products"
            title="Frequently requested items"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {popularProducts.map((product) => (
              <ProductCard product={product} key={product.id} />
            ))}
          </div>
        </section>

        <section className="bg-white/80 py-16">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
            <div className="rounded-lg border border-emerald-900/10 bg-white p-6 shadow-sm shadow-emerald-950/5">
              <BadgeCheck className="size-8 text-emerald-700" />
              <h2 className="mt-4 text-2xl font-black text-emerald-950">
                Store information
              </h2>
              <dl className="mt-5 grid gap-4 text-sm">
                <div>
                  <dt className="font-semibold">Address</dt>
                  <dd className="mt-1 text-muted-foreground">{shop.address}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Timings</dt>
                  <dd className="mt-1 text-muted-foreground">{shop.hours}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Phone</dt>
                  <dd className="mt-1 text-muted-foreground">{shop.displayPhone}</dd>
                </div>
              </dl>
            </div>
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-6 shadow-sm shadow-orange-950/5">
              <MessageCircle className="size-8 text-emerald-700" />
              <h2 className="mt-4 text-2xl font-black text-emerald-950">
                Need something specific?
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Send a product name, school list, or print requirement on
                WhatsApp and the shop can confirm price and availability.
              </p>
              <a
                className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-emerald-600 px-5 font-bold text-white transition hover:bg-emerald-700"
                href={makeWhatsAppUrl()}
                target="_blank"
                rel="noreferrer"
              >
                Contact on WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}

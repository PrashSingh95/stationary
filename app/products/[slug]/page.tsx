import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MessageCircle, PackageCheck, Star } from 'lucide-react';

import { AddToCartButton } from '@/components/commerce/AddToCartButton';
import { ProductVisual } from '@/components/ProductVisual';
import { SiteShell } from '@/components/SiteShell';
import { makeWhatsAppUrl, products } from '@/data/products';
import { getCategory, getProduct } from '@/lib/api/products';

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProduct(params.slug);

  if (!product) return {};

  return {
    title: product.name,
    description: `${product.name} from ${product.brand}. Price Rs. ${product.price}. ${product.inStock ? 'In stock' : 'Ask the shop for availability'}.`,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProduct(params.slug);

  if (!product) notFound();

  const category = await getCategory(product.category);

  return (
    <SiteShell>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-900"
          href="/products"
        >
          <ArrowLeft className="size-4" />
          Back to products
        </Link>

        <section className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <ProductVisual
            type={product.images[0]}
            label={product.name}
            large
          />

          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap gap-2">
              {product.popular ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                  <Star className="size-3" />
                  Popular
                </span>
              ) : null}
              <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-900">
                {category?.name ?? product.category}
              </span>
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight md:text-4xl">
              {product.name}
            </h1>
            <p className="mt-3 text-sm font-semibold uppercase text-muted-foreground">
              {product.brand}
            </p>
            <p className="mt-4 leading-7 text-muted-foreground">
              {product.description}
            </p>

            <div className="mt-6 flex items-end gap-3">
              <span className="text-4xl font-black">₹{product.price}</span>
              {product.originalPrice ? (
                <span className="pb-1 text-lg text-muted-foreground line-through">
                  ₹{product.originalPrice}
                </span>
              ) : null}
            </div>

            <p
              className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${
                product.inStock
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              <PackageCheck className="size-4" />
              {product.inStock ? 'In stock' : 'Ask shop for availability'}
            </p>

            <div className="mt-6 rounded-lg bg-muted p-4">
              <p className="font-semibold">Product details</p>
              <ul className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                {product.specs.map((spec) => (
                  <li className="flex gap-2" key={spec}>
                    <span className="mt-2 size-1.5 rounded-full bg-teal-600" />
                    {spec}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <AddToCartButton product={product} className="h-12" />
              <a
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-border px-5 font-semibold transition hover:border-teal-300"
                href={makeWhatsAppUrl(product)}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="size-5" />
                WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}

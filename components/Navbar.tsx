'use client';

import Link from 'next/link';
import { Menu, Search, ShoppingBag } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { CartNavButton } from '@/components/commerce/CartNavButton';

export function Navbar() {
  const pathname = usePathname();
  const links = [
    ['Categories', '/categories'],
    ['Products', '/products'],
    ['Orders', '/orders'],
    ['Admin', '/admin'],
    ['About', '/about'],
    ['Contact', '/contact'],
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-900/10 bg-white/90 shadow-sm shadow-emerald-950/5 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link className="flex min-w-0 items-center gap-3 font-bold" href="/">
          <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-emerald-700 text-white shadow-lg shadow-emerald-900/15">
            <ShoppingBag className="size-5" />
          </span>
          <span className="leading-tight tracking-tight">
            BABA PUSTAK
            <span className="block text-xs font-medium text-muted-foreground">
              BHANDAR
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map(([label, href]) => {
            const isActive =
              pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));

            return (
              <Link
                aria-current={isActive ? 'page' : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition hover:bg-emerald-50 hover:text-emerald-900 ${
                  isActive
                    ? 'bg-emerald-100 text-emerald-950 shadow-inner'
                    : 'text-muted-foreground'
                }`}
                href={href}
                key={href}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            aria-label="Search products"
            className="grid size-10 place-items-center rounded-lg border border-emerald-900/10 bg-white transition hover:border-emerald-300 hover:bg-emerald-50"
            href="/products"
          >
            <Search className="size-4" />
          </Link>
          <CartNavButton />
          <Link
            className="hidden h-10 items-center rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white shadow-sm shadow-orange-900/10 transition hover:bg-orange-700 sm:inline-flex"
            href="/contact"
          >
            WhatsApp us
          </Link>
          <details className="relative md:hidden">
            <summary className="grid size-10 cursor-pointer list-none place-items-center rounded-lg border border-emerald-900/10 bg-white">
              <Menu className="size-4" />
            </summary>
            <div className="absolute right-0 top-12 w-52 rounded-lg border border-emerald-900/10 bg-card p-2 shadow-xl shadow-emerald-950/10">
              {links.map(([label, href]) => {
                const isActive =
                  pathname === href ||
                  (href !== '/' && pathname.startsWith(`${href}/`));

                return (
                  <Link
                    aria-current={isActive ? 'page' : undefined}
                    className={`block rounded-md px-3 py-2 text-sm font-semibold hover:bg-emerald-50 ${
                      isActive ? 'bg-emerald-100 text-emerald-950' : ''
                    }`}
                    href={href}
                    key={href}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}

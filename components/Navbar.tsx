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
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-2 font-bold" href="/">
          <span className="grid size-10 place-items-center rounded-lg bg-teal-700 text-white">
            <ShoppingBag className="size-5" />
          </span>
          <span className="leading-tight">
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
                className={`rounded-lg border-b-2 px-3 py-2 text-sm font-medium transition hover:bg-muted hover:text-foreground ${
                  isActive
                    ? 'border-teal-700 text-foreground'
                    : 'border-transparent text-muted-foreground'
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
            className="grid size-9 place-items-center rounded-lg border border-border transition hover:border-teal-300 hover:bg-muted"
            href="/products"
          >
            <Search className="size-4" />
          </Link>
          <CartNavButton />
          <Link
            className="hidden rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:border-teal-300 hover:bg-muted sm:inline-flex"
            href="/contact"
          >
            WhatsApp us
          </Link>
          <details className="relative md:hidden">
            <summary className="grid size-9 cursor-pointer list-none place-items-center rounded-lg border border-border">
              <Menu className="size-4" />
            </summary>
            <div className="absolute right-0 top-12 w-48 rounded-lg border border-border bg-card p-2 shadow-xl">
              {links.map(([label, href]) => {
                const isActive =
                  pathname === href ||
                  (href !== '/' && pathname.startsWith(`${href}/`));

                return (
                  <Link
                    aria-current={isActive ? 'page' : undefined}
                    className={`block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted ${
                      isActive ? 'bg-muted text-foreground' : ''
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

'use client';

import Link from 'next/link';
import { ShoppingCart, UserRound } from 'lucide-react';

import { useCommerce } from '@/components/commerce/CommerceProvider';

export function CartNavButton() {
  const { cartCount, user } = useCommerce();

  return (
    <>
      <Link
        aria-label="Open cart"
        className="relative grid size-9 place-items-center rounded-lg border border-border transition hover:border-teal-300 hover:bg-muted"
        href="/cart"
      >
        <ShoppingCart className="size-4" />
        {cartCount > 0 ? (
          <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[11px] font-bold text-white">
            {cartCount}
          </span>
        ) : null}
      </Link>
      <Link
        aria-label={user ? 'Open account' : 'Login'}
        className="grid size-9 place-items-center rounded-lg border border-border transition hover:border-teal-300 hover:bg-muted"
        href={user ? '/orders' : '/login'}
      >
        <UserRound className="size-4" />
      </Link>
    </>
  );
}

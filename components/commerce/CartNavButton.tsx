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
        className="relative grid size-10 place-items-center rounded-lg border border-emerald-900/10 bg-white transition hover:border-emerald-300 hover:bg-emerald-50"
        href="/cart"
      >
        <ShoppingCart className="size-4" />
        {cartCount > 0 ? (
          <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-orange-600 px-1 text-[11px] font-bold text-white">
            {cartCount}
          </span>
        ) : null}
      </Link>
      <Link
        aria-label={user ? 'Open account' : 'Login'}
        className="grid size-10 place-items-center rounded-lg border border-emerald-900/10 bg-white transition hover:border-emerald-300 hover:bg-emerald-50"
        href={user ? '/orders' : '/login'}
      >
        <UserRound className="size-4" />
      </Link>
    </>
  );
}

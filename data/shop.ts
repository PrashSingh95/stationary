import type { Product } from '@/types/product';

export const shop = {
  name: process.env.NEXT_PUBLIC_SHOP_NAME || 'BABA PUSTAK BHANDAR',
  phone: process.env.NEXT_PUBLIC_SHOP_PHONE || '919876543210',
  displayPhone:
    process.env.NEXT_PUBLIC_SHOP_DISPLAY_PHONE || '+91 98765 43210',
  address:
    process.env.NEXT_PUBLIC_SHOP_ADDRESS || 'MG Road, Near City School, Pune',
  hours: process.env.NEXT_PUBLIC_SHOP_HOURS || 'Mon-Sat, 9:00 AM-8:30 PM',
};

export function makeWhatsAppUrl(product?: Product) {
  const discountPercent = product?.discountPercent ?? 0;
  const price =
    product && discountPercent > 0
      ? Math.max(
          0,
          Math.round(product.price - (product.price * discountPercent) / 100),
        )
      : product?.price;
  const message = product
    ? `Hi,\n\nI would like to order:\n\n${product.name}\nQuantity: 1\nPrice: Rs. ${price}${discountPercent > 0 ? ` (${discountPercent}% discount)` : ''}`
    : 'Hi, I would like to ask about stationery products.';

  return `https://wa.me/${shop.phone}?text=${encodeURIComponent(message)}`;
}

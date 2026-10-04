import type { Product } from '@/types/product';

export type ProductPricing = {
  mrp: number;
  sellingPrice: number;
  discountPercent: number;
  discountAmount: number;
  hasDiscount: boolean;
};

export function getProductPricing(product: Product): ProductPricing {
  const discountPercent = normalizeDiscountPercent(product.discountPercent);
  const mrp = Math.max(0, product.originalPrice ?? product.price);
  const sellingPrice =
    discountPercent > 0
      ? Math.max(0, Math.round(mrp - (mrp * discountPercent) / 100))
      : Math.max(0, product.price);

  return {
    mrp,
    sellingPrice,
    discountPercent,
    discountAmount: Math.max(0, mrp - sellingPrice),
    hasDiscount: discountPercent > 0,
  };
}

export function normalizeDiscountPercent(value: number | undefined) {
  return Math.max(0, Math.min(100, Number(value) || 0));
}

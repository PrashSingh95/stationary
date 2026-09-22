import { categories as fallbackCategories, getCategory as getFallbackCategory } from '@/data/categories';
import { getProduct as getFallbackProduct, products as fallbackProducts } from '@/data/products';
import type { Category, Product } from '@/types/product';
import { apiGet } from '@/lib/api/client';

export async function listProducts(): Promise<Product[]> {
  return (await apiGet<Product[]>('/api/v1/products')) ?? fallbackProducts;
}

export async function listFeaturedProducts(): Promise<Product[]> {
  const products = await apiGet<Product[]>('/api/v1/products?featured=true');
  return products ?? fallbackProducts.filter((product) => product.featured);
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  return (await apiGet<Product>(`/api/v1/products/${slug}`)) ?? getFallbackProduct(slug);
}

export async function listCategories(): Promise<Category[]> {
  return (await apiGet<Category[]>('/api/v1/categories')) ?? fallbackCategories;
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  return (await apiGet<Category>(`/api/v1/categories/${slug}`)) ?? getFallbackCategory(slug);
}

export async function listCategoryProducts(slug: string): Promise<Product[]> {
  return (
    (await apiGet<Product[]>(`/api/v1/categories/${slug}/products`)) ??
    fallbackProducts.filter((product) => product.category === slug)
  );
}

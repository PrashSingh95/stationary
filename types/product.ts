export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  images: string[];
  inStock: boolean;
  featured: boolean;
  popular?: boolean;
  specs: string[];
  stockQuantity?: number;
};

export type Category = {
  name: string;
  slug: string;
  description: string;
  color: string;
};

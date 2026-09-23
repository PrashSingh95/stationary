import type { Product } from '@/types/product';

export type CommerceUser = {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
};

export type CartLine = {
  productId: string;
  quantity: number;
};

export type Address = {
  id: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
};

export type PaymentMethod = 'COD' | 'ONLINE';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PACKED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type OrderLine = {
  product: Product;
  quantity: number;
  subtotal: number;
};

export type Order = {
  id: string;
  user: CommerceUser;
  items: OrderLine[];
  address: Address;
  paymentMethod: PaymentMethod;
  paymentStatus: 'PENDING' | 'PAID';
  status: OrderStatus;
  total: number;
  createdAt: string;
};

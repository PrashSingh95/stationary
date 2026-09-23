'use client';

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { products } from '@/data/products';
import type {
  Address,
  CartLine,
  CommerceUser,
  Order,
  OrderStatus,
  PaymentMethod,
} from '@/types/commerce';
import type { Product } from '@/types/product';

type CheckoutInput = {
  address: Omit<Address, 'id'>;
  paymentMethod: PaymentMethod;
};

type CommerceContextValue = {
  user: CommerceUser | null;
  cart: CartLine[];
  orders: Order[];
  productsById: Map<string, Product>;
  cartItems: Array<{ product: Product; quantity: number; subtotal: number }>;
  cartCount: number;
  cartTotal: number;
  login: (email: string, password: string) => CommerceUser;
  register: (name: string, email: string, password: string) => CommerceUser;
  logout: () => void;
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  placeOrder: (input: CheckoutInput) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
};

const storageKey = 'bpb-commerce-v1';
const CommerceContext = createContext<CommerceContextValue | null>(null);

type StoredState = {
  user: CommerceUser | null;
  cart: CartLine[];
  orders: Order[];
};

const initialState: StoredState = {
  user: null,
  cart: [],
  orders: [],
};

export function CommerceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredState>(() => {
    if (typeof window === 'undefined') return initialState;

    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return initialState;

    try {
      return JSON.parse(stored) as StoredState;
    } catch {
      return initialState;
    }
  });
  const productsById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [],
  );

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state]);

  const cartItems = useMemo(
    () =>
      state.cart
        .map((line) => {
          const product = productsById.get(line.productId);
          if (!product) return null;
          return {
            product,
            quantity: line.quantity,
            subtotal: product.price * line.quantity,
          };
        })
        .filter(Boolean) as Array<{
        product: Product;
        quantity: number;
        subtotal: number;
      }>,
    [productsById, state.cart],
  );

  const cartTotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const cartCount = state.cart.reduce((sum, line) => sum + line.quantity, 0);

  function upsertUser(name: string, email: string, role: CommerceUser['role']) {
    const user = {
      id: `user-${email.toLowerCase()}`,
      name,
      email: email.toLowerCase(),
      role,
    };
    setState((current) => ({ ...current, user }));
    return user;
  }

  const value: CommerceContextValue = {
    user: state.user,
    cart: state.cart,
    orders: state.orders,
    productsById,
    cartItems,
    cartCount,
    cartTotal,
    login(email) {
      const role = email.toLowerCase().includes('admin') ? 'admin' : 'customer';
      return upsertUser(role === 'admin' ? 'Shop Admin' : 'Customer', email, role);
    },
    register(name, email) {
      return upsertUser(name, email, 'customer');
    },
    logout() {
      setState((current) => ({ ...current, user: null }));
    },
    addToCart(product, quantity = 1) {
      setState((current) => {
        const existing = current.cart.find((line) => line.productId === product.id);
        const cart = existing
          ? current.cart.map((line) =>
              line.productId === product.id
                ? { ...line, quantity: Math.min(line.quantity + quantity, 99) }
                : line,
            )
          : [...current.cart, { productId: product.id, quantity }];
        return { ...current, cart };
      });
    },
    updateQuantity(productId, quantity) {
      setState((current) => ({
        ...current,
        cart: current.cart
          .map((line) =>
            line.productId === productId
              ? { ...line, quantity: Math.max(1, Math.min(quantity, 99)) }
              : line,
          )
          .filter((line) => line.quantity > 0),
      }));
    },
    removeFromCart(productId) {
      setState((current) => ({
        ...current,
        cart: current.cart.filter((line) => line.productId !== productId),
      }));
    },
    clearCart() {
      setState((current) => ({ ...current, cart: [] }));
    },
    placeOrder(input) {
      const user =
        state.user ??
        upsertUser('Guest Customer', 'guest@bpb.local', 'customer');
      const address = { ...input.address, id: `addr-${Date.now()}` };
      const order: Order = {
        id: `BPB-${Date.now().toString().slice(-8)}`,
        user,
        items: cartItems,
        address,
        paymentMethod: input.paymentMethod,
        paymentStatus: input.paymentMethod === 'COD' ? 'PENDING' : 'PAID',
        status: 'PENDING',
        total: cartTotal,
        createdAt: new Date().toISOString(),
      };

      setState((current) => ({
        ...current,
        user,
        cart: [],
        orders: [order, ...current.orders],
      }));
      return order;
    },
    updateOrderStatus(orderId, status) {
      setState((current) => ({
        ...current,
        orders: current.orders.map((order) =>
          order.id === orderId ? { ...order, status } : order,
        ),
      }));
    },
  };

  return (
    <CommerceContext.Provider value={value}>
      {children}
    </CommerceContext.Provider>
  );
}

export function useCommerce() {
  const context = useContext(CommerceContext);
  if (!context) {
    throw new Error('useCommerce must be used inside CommerceProvider');
  }
  return context;
}

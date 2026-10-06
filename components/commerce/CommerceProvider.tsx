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
import { categories } from '@/data/categories';
import { getProductPricing } from '@/lib/commerce/pricing';
import type {
  Address,
  CartLine,
  CommerceUser,
  Order,
  OrderStatus,
  PaymentMethod,
} from '@/types/commerce';
import type { Category, Product } from '@/types/product';

type CheckoutInput = {
  address: Omit<Address, 'id'>;
  paymentMethod: PaymentMethod;
};

type CommerceContextValue = {
  user: CommerceUser | null;
  cart: CartLine[];
  orders: Order[];
  products: Product[];
  categories: Category[];
  productsById: Map<string, Product>;
  cartItems: Array<{
    product: Product;
    quantity: number;
    subtotal: number;
    discountPercent: number;
    discountAmount: number;
    total: number;
  }>;
  cartCount: number;
  cartTotal: number;
  cartDiscountAmount: number;
  cartGrandTotal: number;
  login: (email: string, password: string) => CommerceUser;
  register: (name: string, email: string, password: string) => CommerceUser;
  logout: () => void;
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  placeOrder: (input: CheckoutInput) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  createProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  updateProductStock: (productId: string, stockQuantity: number) => void;
  createCategory: (category: Category) => void;
};

const storageKey = 'bpb-commerce-v2';
const CommerceContext = createContext<CommerceContextValue | null>(null);

type StoredState = {
  user: CommerceUser | null;
  cart: CartLine[];
  orders: Order[];
  products: Product[];
  categories: Category[];
};

const initialState: StoredState = {
  user: null,
  cart: [],
  orders: [],
  products: products.map((product) => ({
    ...product,
    stockQuantity: product.stockQuantity ?? (product.inStock ? 20 : 0),
  })),
  categories,
};

export function CommerceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredState>(initialState);
  const [hasLoadedStoredState, setHasLoadedStoredState] = useState(false);
  const productsById = useMemo(
    () => new Map(state.products.map((product) => [product.id, product])),
    [state.products],
  );

  useEffect(() => {
    queueMicrotask(() => {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Partial<StoredState>;
          setState({
            user: parsed.user ?? null,
            cart: parsed.cart ?? [],
            orders: parsed.orders ?? [],
            products: parsed.products?.length
              ? parsed.products
              : initialState.products,
            categories: parsed.categories?.length
              ? parsed.categories
              : initialState.categories,
          });
        } catch {
          setState(initialState);
        }
      }

      setHasLoadedStoredState(true);
    });
  }, []);

  useEffect(() => {
    if (!hasLoadedStoredState) return;
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [hasLoadedStoredState, state]);

  const cartItems = useMemo(
    () =>
      state.cart
        .map((line) => {
          const product = productsById.get(line.productId);
          if (!product) return null;
          const pricing = getProductPricing(product);
          const subtotal = pricing.mrp * line.quantity;
          const discountAmount = pricing.discountAmount * line.quantity;
          return {
            product,
            quantity: line.quantity,
            subtotal,
            discountPercent: pricing.discountPercent,
            discountAmount,
            total: pricing.sellingPrice * line.quantity,
          };
        })
        .filter(Boolean) as Array<{
        product: Product;
        quantity: number;
        subtotal: number;
        discountPercent: number;
        discountAmount: number;
        total: number;
      }>,
    [productsById, state.cart],
  );

  const cartTotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const cartDiscountAmount = cartItems.reduce(
    (sum, item) => sum + item.discountAmount,
    0,
  );
  const cartGrandTotal = cartItems.reduce((sum, item) => sum + item.total, 0);
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
    products: state.products,
    categories: state.categories,
    productsById,
    cartItems,
    cartCount,
    cartTotal,
    cartDiscountAmount,
    cartGrandTotal,
    login(email) {
      const role = email.toLowerCase().includes('admin') ? 'admin' : 'customer';
      return upsertUser(
        role === 'admin' ? 'Shop Admin' : 'Customer',
        email,
        role,
      );
    },
    register(name, email) {
      return upsertUser(name, email, 'customer');
    },
    logout() {
      setState((current) => ({ ...current, user: null }));
    },
    addToCart(product, quantity = 1) {
      setState((current) => {
        const existing = current.cart.find(
          (line) => line.productId === product.id,
        );
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
      const user = state.user ?? {
        id: 'guest',
        name: 'Guest Customer',
        email: 'guest@bpb.local',
        role: 'customer',
      };
      const address = { ...input.address, id: `addr-${Date.now()}` };
      const order: Order = {
        id: `BPB-${Date.now().toString().slice(-8)}`,
        user,
        items: cartItems,
        address,
        paymentMethod: input.paymentMethod,
        paymentStatus: input.paymentMethod === 'COD' ? 'PENDING' : 'PAID',
        status: 'PENDING',
        subtotal: cartTotal,
        discountAmount: cartDiscountAmount,
        total: cartGrandTotal,
        createdAt: new Date().toISOString(),
      };

      setState((current) => ({
        ...current,
        user,
        cart: [],
        orders: [order, ...current.orders],
        products: current.products.map((product) => {
          const ordered = cartItems.find(
            (item) => item.product.id === product.id,
          );
          if (!ordered) return product;
          const nextStock = Math.max(
            0,
            (product.stockQuantity ?? (product.inStock ? 20 : 0)) -
              ordered.quantity,
          );
          return {
            ...product,
            stockQuantity: nextStock,
            inStock: nextStock > 0,
          };
        }),
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
    createProduct(product) {
      setState((current) => ({
        ...current,
        products: [
          {
            ...product,
            stockQuantity: product.stockQuantity ?? (product.inStock ? 1 : 0),
            inStock: (product.stockQuantity ?? (product.inStock ? 1 : 0)) > 0,
          },
          ...current.products.filter((item) => item.id !== product.id),
        ],
      }));
    },
    updateProduct(product) {
      setState((current) => ({
        ...current,
        products: current.products.map((item) =>
          item.id === product.id
            ? {
                ...product,
                stockQuantity:
                  product.stockQuantity ?? (product.inStock ? 1 : 0),
                inStock:
                  (product.stockQuantity ?? (product.inStock ? 1 : 0)) > 0,
              }
            : item,
        ),
      }));
    },
    deleteProduct(productId) {
      setState((current) => ({
        ...current,
        products: current.products.filter(
          (product) => product.id !== productId,
        ),
        cart: current.cart.filter((line) => line.productId !== productId),
      }));
    },
    updateProductStock(productId, stockQuantity) {
      const nextStock = Math.max(0, stockQuantity);
      setState((current) => ({
        ...current,
        products: current.products.map((product) =>
          product.id === productId
            ? {
                ...product,
                stockQuantity: nextStock,
                inStock: nextStock > 0,
              }
            : product,
        ),
      }));
    },
    createCategory(category) {
      setState((current) => ({
        ...current,
        categories: [
          category,
          ...current.categories.filter((item) => item.slug !== category.slug),
        ],
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

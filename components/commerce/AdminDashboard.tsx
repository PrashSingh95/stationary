'use client';

import { useMemo, useState } from 'react';
import {
  Boxes,
  IndianRupee,
  PackageCheck,
  Pencil,
  Plus,
  Save,
  Trash2,
  Users,
} from 'lucide-react';

import { categories } from '@/data/categories';
import { useCommerce } from '@/components/commerce/CommerceProvider';
import type { OrderStatus } from '@/types/commerce';
import type { Product } from '@/types/product';

const statuses: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PACKED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
];

type ProductForm = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  brand: string;
  price: string;
  originalPrice: string;
  image: string;
  specs: string;
  stockQuantity: string;
  featured: boolean;
  popular: boolean;
};

const emptyForm: ProductForm = {
  id: '',
  name: '',
  slug: '',
  description: '',
  category: 'notebooks',
  brand: '',
  price: '',
  originalPrice: '',
  image: 'notebook',
  specs: '',
  stockQuantity: '10',
  featured: false,
  popular: false,
};

export function AdminDashboard() {
  const {
    orders,
    products,
    updateOrderStatus,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductStock,
  } = useCommerce();
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const lowStock = products.filter(
    (product) => (product.stockQuantity ?? (product.inStock ? 20 : 0)) <= 3,
  ).length;
  const customers = useMemo(
    () => new Set(orders.map((order) => order.user.email)).size,
    [orders],
  );
  const categoryCounts = categories.map((category) => ({
    ...category,
    count: products.filter((product) => product.category === category.slug).length,
  }));

  function updateForm(field: keyof ProductForm, value: string | boolean) {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === 'name' && !editingId) {
        next.slug = slugify(String(value));
      }
      return next;
    });
  }

  function editProduct(product: Product) {
    setEditingId(product.id);
    setForm({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      category: product.category,
      brand: product.brand,
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : '',
      image: product.images[0] ?? 'notebook',
      specs: product.specs.join(', '),
      stockQuantity: String(product.stockQuantity ?? (product.inStock ? 20 : 0)),
      featured: product.featured,
      popular: Boolean(product.popular),
    });
  }

  function submitProduct(event: { preventDefault: () => void }) {
    event.preventDefault();
    const product = formToProduct(form, editingId);
    if (editingId) {
      updateProduct(product);
    } else {
      createProduct(product);
    }
    setEditingId(null);
    setForm(emptyForm);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { Icon: PackageCheck, label: 'Orders', value: orders.length },
          { Icon: IndianRupee, label: 'Revenue', value: `₹${revenue}` },
          { Icon: Boxes, label: 'Low stock', value: lowStock },
          { Icon: Users, label: 'Customers', value: customers },
        ].map(({ Icon, label, value }) => (
          <div
            className="rounded-lg border border-border bg-card p-5 shadow-sm"
            key={label}
          >
            <Icon className="size-6 text-teal-700" />
            <p className="mt-4 text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-bold">Orders</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border text-muted-foreground">
              <tr>
                <th className="py-3">Order</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td className="py-5 text-muted-foreground" colSpan={5}>
                    No orders yet. Place a checkout order to see it here.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr className="border-b border-border" key={order.id}>
                    <td className="py-3 font-semibold">{order.id}</td>
                    <td>{order.user.email}</td>
                    <td>₹{order.total}</td>
                    <td>{order.paymentMethod}</td>
                    <td>
                      <select
                        className="h-9 rounded-lg border border-input bg-background px-2"
                        onChange={(event) =>
                          updateOrderStatus(
                            order.id,
                            event.target.value as OrderStatus,
                          )
                        }
                        value={order.status}
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status.replaceAll('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[390px_1fr]">
        <form
          className="h-fit rounded-lg border border-border bg-card p-5 shadow-sm"
          onSubmit={submitProduct}
        >
          <h2 className="flex items-center gap-2 text-lg font-bold">
            {editingId ? <Pencil className="size-5" /> : <Plus className="size-5" />}
            {editingId ? 'Edit product' : 'Add product'}
          </h2>
          <div className="mt-4 grid gap-3">
            <AdminInput
              label="Name"
              onChange={(value) => updateForm('name', value)}
              required
              value={form.name}
            />
            <AdminInput
              label="Slug"
              onChange={(value) => updateForm('slug', slugify(value))}
              required
              value={form.slug}
            />
            <label>
              <span className="text-sm font-medium">Category</span>
              <select
                className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                onChange={(event) => updateForm('category', event.target.value)}
                value={form.category}
              >
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <AdminInput
              label="Brand"
              onChange={(value) => updateForm('brand', value)}
              required
              value={form.brand}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <AdminInput
                label="Price"
                onChange={(value) => updateForm('price', value)}
                required
                type="number"
                value={form.price}
              />
              <AdminInput
                label="Stock"
                onChange={(value) => updateForm('stockQuantity', value)}
                required
                type="number"
                value={form.stockQuantity}
              />
            </div>
            <AdminInput
              label="Original price"
              onChange={(value) => updateForm('originalPrice', value)}
              type="number"
              value={form.originalPrice}
            />
            <AdminInput
              label="Product visual key"
              onChange={(value) => updateForm('image', value)}
              value={form.image}
            />
            <label>
              <span className="text-sm font-medium">Description</span>
              <textarea
                className="mt-1 min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                onChange={(event) =>
                  updateForm('description', event.target.value)
                }
                required
                value={form.description}
              />
            </label>
            <AdminInput
              label="Specs"
              onChange={(value) => updateForm('specs', value)}
              placeholder="Comma separated"
              value={form.specs}
            />
            <div className="grid gap-2 text-sm">
              <label className="flex items-center gap-2">
                <input
                  checked={form.featured}
                  onChange={(event) =>
                    updateForm('featured', event.target.checked)
                  }
                  type="checkbox"
                />
                Featured
              </label>
              <label className="flex items-center gap-2">
                <input
                  checked={form.popular}
                  onChange={(event) =>
                    updateForm('popular', event.target.checked)
                  }
                  type="checkbox"
                />
                Popular
              </label>
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            <button className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800">
              <Save className="size-4" />
              {editingId ? 'Save' : 'Create'}
            </button>
            {editingId ? (
              <button
                className="h-10 rounded-lg border border-border px-4 text-sm font-semibold"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
                type="button"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-bold">Products and inventory</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-border text-muted-foreground">
                <tr>
                  <th className="py-3">Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const stock =
                    product.stockQuantity ?? (product.inStock ? 20 : 0);
                  return (
                    <tr className="border-b border-border" key={product.id}>
                      <td className="py-3">
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.brand}
                        </p>
                      </td>
                      <td>{categoryName(product.category)}</td>
                      <td>₹{product.price}</td>
                      <td>
                        <input
                          aria-label={`Stock quantity for ${product.name}`}
                          className="h-9 w-20 rounded-lg border border-input bg-background px-2"
                          min={0}
                          onChange={(event) =>
                            updateProductStock(
                              product.id,
                              Number(event.target.value),
                            )
                          }
                          type="number"
                          value={stock}
                        />
                      </td>
                      <td>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            stock > 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {stock > 0 ? 'Available' : 'Out of stock'}
                        </span>
                      </td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <button
                            aria-label={`Edit ${product.name}`}
                            className="grid size-9 place-items-center rounded-lg border border-border hover:bg-muted"
                            onClick={() => editProduct(product)}
                            type="button"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            aria-label={`Delete ${product.name}`}
                            className="grid size-9 place-items-center rounded-lg border border-border text-rose-700 hover:bg-rose-50"
                            onClick={() => deleteProduct(product.id)}
                            type="button"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-bold">Categories</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {categoryCounts.map((category) => (
            <div className="rounded-lg border border-border p-4" key={category.slug}>
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${category.color}`}
              >
                {category.count} products
              </span>
              <p className="mt-3 font-semibold">{category.name}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {category.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function AdminInput({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label>
      <span className="text-sm font-medium">{label}</span>
      <input
        className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
    </label>
  );
}

function formToProduct(form: ProductForm, editingId: string | null): Product {
  const stockQuantity = Math.max(0, Number(form.stockQuantity) || 0);
  const price = Math.max(0, Number(form.price) || 0);
  const originalPrice = Number(form.originalPrice) || undefined;
  const slug = slugify(form.slug || form.name);

  return {
    id: editingId ?? `p-${slug}-${Date.now().toString().slice(-4)}`,
    name: form.name.trim(),
    slug,
    description: form.description.trim(),
    category: form.category,
    brand: form.brand.trim(),
    price,
    originalPrice,
    images: [form.image.trim() || 'notebook'],
    inStock: stockQuantity > 0,
    featured: form.featured,
    popular: form.popular,
    specs: form.specs
      .split(',')
      .map((spec) => spec.trim())
      .filter(Boolean),
    stockQuantity,
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function categoryName(slug: string) {
  return categories.find((category) => category.slug === slug)?.name ?? slug;
}

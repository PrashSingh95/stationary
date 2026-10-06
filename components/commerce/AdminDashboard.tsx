'use client';

import { type ChangeEvent, useMemo, useState } from 'react';
import Link from 'next/link';
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

import { ProductVisual } from '@/components/ProductVisual';
import { useCommerce } from '@/components/commerce/CommerceProvider';
import {
  getProductPricing,
  normalizeDiscountPercent,
} from '@/lib/commerce/pricing';
import { productImageMap } from '@/lib/product-images';
import type { OrderStatus } from '@/types/commerce';
import type { Category, Product } from '@/types/product';

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
  discountPercent: string;
  image: string;
  specs: string;
  stockQuantity: string;
  featured: boolean;
  popular: boolean;
};

type CategoryForm = {
  name: string;
  slug: string;
  description: string;
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
  discountPercent: '',
  image: 'notebook',
  specs: '',
  stockQuantity: '10',
  featured: false,
  popular: false,
};

const emptyCategoryForm: CategoryForm = {
  name: '',
  slug: '',
  description: '',
};

export function AdminDashboard() {
  const {
    user,
    orders,
    products,
    categories,
    updateOrderStatus,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductStock,
    createCategory,
  } = useCommerce();
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [categoryForm, setCategoryForm] =
    useState<CategoryForm>(emptyCategoryForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [imageError, setImageError] = useState('');
  const pricingPreview = getFormPricing(form);

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
    count: products.filter((product) => product.category === category.slug)
      .length,
  }));

  if (!user) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
        <h2 className="text-xl font-bold">Admin login required</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          For this demo, sign in with any email that contains “admin”.
        </p>
        <Link
          className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800"
          href="/login"
        >
          Login as admin
        </Link>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
        <h2 className="text-xl font-bold">Admin access required</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account is signed in as a customer. Log in again with an email
          containing “admin”.
        </p>
        <Link
          className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800"
          href="/login"
        >
          Switch account
        </Link>
      </div>
    );
  }

  function updateForm(field: keyof ProductForm, value: string | boolean) {
    if (field === 'image') setImageError('');
    setFormError('');
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === 'name' && !editingId) {
        next.slug = slugify(String(value));
      }
      return next;
    });
  }

  function updateCategoryForm(field: keyof CategoryForm, value: string) {
    setCategoryForm((current) => {
      const next = { ...current, [field]: value };
      if (field === 'name') {
        next.slug = slugify(value);
      }
      return next;
    });
  }

  function editProduct(product: Product) {
    setEditingId(product.id);
    setImageError('');
    setForm({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      category: product.category,
      brand: product.brand,
      price: String(getProductPricing(product).sellingPrice),
      originalPrice: String(product.originalPrice ?? product.price),
      discountPercent: product.discountPercent
        ? String(product.discountPercent)
        : '',
      image: product.images[0] ?? 'notebook',
      specs: product.specs.join(', '),
      stockQuantity: String(
        product.stockQuantity ?? (product.inStock ? 20 : 0),
      ),
      featured: product.featured,
      popular: Boolean(product.popular),
    });
  }

  function submitProduct(event: { preventDefault: () => void }) {
    event.preventDefault();
    const error = validateProductForm(form);
    if (error) {
      setFormError(error);
      return;
    }
    const product = formToProduct(form, editingId);
    if (editingId) {
      updateProduct(product);
    } else {
      createProduct(product);
    }
    setEditingId(null);
    setFormError('');
    setImageError('');
    setForm(emptyForm);
  }

  function submitCategory(event: { preventDefault: () => void }) {
    event.preventDefault();
    createCategory(formToCategory(categoryForm));
    setCategoryForm(emptyCategoryForm);
  }

  async function uploadProductImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('Please choose an image file.');
      return;
    }

    try {
      const image = await resizeImage(file);
      updateForm('image', image);
    } catch {
      setImageError('Image could not be loaded. Try another file.');
    }
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

      {orders.length > 0 ? (
        <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-bold">Orders</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-border text-muted-foreground">
                <tr>
                  <th className="py-3">Order</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Discount</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr className="border-b border-border" key={order.id}>
                    <td className="py-3 font-semibold">{order.id}</td>
                    <td>{order.user.email}</td>
                    <td>₹{order.total}</td>
                    <td>
                      {order.discountAmount
                        ? `-₹${order.discountAmount}`
                        : 'None'}
                    </td>
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
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[390px_1fr]">
        <form
          className="h-fit rounded-lg border border-border bg-card p-5 shadow-sm"
          onSubmit={submitProduct}
        >
          <h2 className="flex items-center gap-2 text-lg font-bold">
            {editingId ? (
              <Pencil className="size-5" />
            ) : (
              <Plus className="size-5" />
            )}
            {editingId ? 'Edit product' : 'Add product'}
          </h2>
          <div className="mt-4 grid gap-3">
            {formError ? (
              <p
                className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700"
                role="alert"
              >
                {formError}
              </p>
            ) : null}
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
                label="Original price"
                onChange={(value) => updateForm('originalPrice', value)}
                required
                type="number"
                min={0}
                value={form.originalPrice}
              />
              <AdminInput
                disabled
                label="Selling price"
                onChange={() => undefined}
                type="number"
                value={String(pricingPreview.sellingPrice)}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <AdminInput
                label="Stock"
                onChange={(value) => updateForm('stockQuantity', value)}
                required
                type="number"
                min={0}
                value={form.stockQuantity}
              />
              <AdminInput
                label="Discount %"
                onChange={(value) => updateForm('discountPercent', value)}
                type="number"
                min={0}
                max={100}
                value={form.discountPercent}
              />
            </div>
            <div className="grid gap-4 rounded-lg border border-border p-4">
              <p className="text-sm font-semibold">Product image</p>
              <div className="grid gap-4 sm:grid-cols-[110px_1fr]">
                <ProductVisual
                  label={form.name || 'Product image'}
                  type={form.image}
                />
                <div className="grid gap-4">
                  <label>
                    <span className="text-sm font-medium">Upload image</span>
                    <input
                      accept="image/*"
                      className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      onChange={uploadProductImage}
                      type="file"
                    />
                  </label>
                  <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
                    <span className="h-px flex-1 bg-border" />
                    OR
                    <span className="h-px flex-1 bg-border" />
                  </div>
                  <label>
                    <span className="text-sm font-medium">Choose preset</span>
                    <select
                      className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                      onChange={(event) =>
                        updateForm('image', event.target.value)
                      }
                      value={form.image in productImageMap ? form.image : ''}
                    >
                      <option value="">Uploaded/custom image</option>
                      {Object.keys(productImageMap).map((key) => (
                        <option key={key} value={key}>
                          {key}
                        </option>
                      ))}
                    </select>
                  </label>
                  {imageError ? (
                    <p className="text-xs font-medium text-rose-700">
                      {imageError}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
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
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <AdminCheckbox
                checked={form.featured}
                label="Featured"
                onChange={(checked) => updateForm('featured', checked)}
              />
              <AdminCheckbox
                checked={form.popular}
                label="Popular"
                onChange={(checked) => updateForm('popular', checked)}
              />
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
                  setFormError('');
                  setImageError('');
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
                  <th>Discount</th>
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
                        <div className="grid grid-cols-[56px_1fr] items-center gap-3">
                          <ProductVisual
                            label={product.name}
                            type={product.images[0]}
                          />
                          <div>
                            <p className="font-semibold">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {product.brand}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>{categoryName(categories, product.category)}</td>
                      <td>
                        <div className="font-semibold">
                          ₹{getProductPricing(product).sellingPrice}
                        </div>
                        {product.originalPrice &&
                        product.originalPrice >
                          getProductPricing(product).sellingPrice ? (
                          <div className="text-xs text-muted-foreground">
                            MRP ₹{product.originalPrice}
                          </div>
                        ) : null}
                      </td>
                      <td>
                        {product.discountPercent
                          ? `${product.discountPercent}%`
                          : 'None'}
                      </td>
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
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Delete ${product.name}? This removes it from the storefront.`,
                                )
                              ) {
                                deleteProduct(product.id);
                              }
                            }}
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

      {orders.length === 0 ? (
        <section
          aria-labelledby="orders-empty-heading"
          className="rounded-lg border border-dashed border-border bg-card p-4 shadow-sm"
        >
          <h2 className="text-base font-bold" id="orders-empty-heading">
            Orders
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            No orders yet. Product and inventory tools are shown first until
            customer orders arrive.
          </p>
        </section>
      ) : null}

      <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
          <form
            className="rounded-lg border border-border p-4"
            onSubmit={submitCategory}
          >
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Plus className="size-5" />
              Create category
            </h2>
            <div className="mt-4 grid gap-3">
              <AdminInput
                label="Name"
                onChange={(value) => updateCategoryForm('name', value)}
                required
                value={categoryForm.name}
              />
              <AdminInput
                label="Slug"
                onChange={(value) => updateCategoryForm('slug', slugify(value))}
                required
                value={categoryForm.slug}
              />
              <label>
                <span className="text-sm font-medium">Description</span>
                <textarea
                  className="mt-1 min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  onChange={(event) =>
                    updateCategoryForm('description', event.target.value)
                  }
                  required
                  value={categoryForm.description}
                />
              </label>
            </div>
            <button className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800">
              <Save className="size-4" />
              Create category
            </button>
          </form>

          <div>
            <h2 className="text-lg font-bold">Categories</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {categoryCounts.map((category) => (
                <div
                  className="rounded-lg border border-border p-4"
                  key={category.slug}
                >
                  <span className="inline-flex rounded-full bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
                    {category.count} products
                  </span>
                  <p className="mt-3 font-semibold">{category.name}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {category.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function AdminInput({
  label,
  value,
  onChange,
  disabled,
  max,
  min,
  placeholder,
  required,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  max?: number;
  min?: number;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label>
      <span className="text-sm font-medium">{label}</span>
      <input
        className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
        disabled={disabled}
        max={max}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
    </label>
  );
}

function AdminCheckbox({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2 transition hover:bg-muted">
      <input
        checked={checked}
        className="peer sr-only"
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      <span
        aria-hidden="true"
        className="grid size-5 place-items-center rounded border border-input bg-background text-transparent transition peer-checked:border-teal-700 peer-checked:bg-teal-700 peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-teal-700"
      >
        <svg
          className="size-3"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
          viewBox="0 0 24 24"
        >
          <path d="m5 12 4 4L19 6" />
        </svg>
      </span>
      <span className="text-sm font-medium">{label}</span>
    </label>
  );
}

function formToProduct(form: ProductForm, editingId: string | null): Product {
  const stockQuantity = Math.max(0, Number(form.stockQuantity) || 0);
  const pricing = getFormPricing(form);
  const slug = slugify(form.slug || form.name);

  return {
    id: editingId ?? `p-${slug}-${Date.now().toString().slice(-4)}`,
    name: form.name.trim(),
    slug,
    description: form.description.trim(),
    category: form.category,
    brand: form.brand.trim(),
    price: pricing.sellingPrice,
    originalPrice: pricing.discountPercent > 0 ? pricing.mrp : undefined,
    discountPercent: pricing.discountPercent,
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

function validateProductForm(form: ProductForm) {
  const mrp = Number(form.originalPrice) || Number(form.price) || 0;
  const discountPercent = Number(form.discountPercent) || 0;
  const stockQuantity = Number(form.stockQuantity) || 0;

  if (mrp <= 0) return 'Original price must be greater than 0.';
  if (discountPercent < 0 || discountPercent > 100) {
    return 'Discount must be between 0 and 100%.';
  }
  if (discountPercent > 0 && !form.originalPrice) {
    return 'Original price is required when adding a discount.';
  }
  if (stockQuantity < 0) return 'Stock cannot be negative.';

  return '';
}

function getFormPricing(form: ProductForm) {
  const mrp = Math.max(
    0,
    Number(form.originalPrice) || Number(form.price) || 0,
  );
  const discountPercent = normalizeDiscountPercent(
    Number(form.discountPercent) || 0,
  );
  const sellingPrice =
    discountPercent > 0
      ? Math.max(0, Math.round(mrp - (mrp * discountPercent) / 100))
      : mrp;

  return {
    mrp,
    sellingPrice,
    discountPercent,
  };
}

function formToCategory(form: CategoryForm): Category {
  const slug = slugify(form.slug || form.name);

  return {
    name: form.name.trim(),
    slug,
    description: form.description.trim(),
    color: 'bg-muted text-muted-foreground',
  };
}

function resizeImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read image.'));
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Could not read image.'));
        return;
      }

      const image = new Image();
      image.onerror = () => reject(new Error('Could not load image.'));
      image.onload = () => {
        const maxSize = 900;
        const scale = Math.min(
          1,
          maxSize / Math.max(image.width, image.height),
        );
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Could not prepare image.'));
          return;
        }

        context.fillStyle = '#f7f1e8';
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.86));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function categoryName(categories: Category[], slug: string) {
  return categories.find((category) => category.slug === slug)?.name ?? slug;
}

"use client";

import Image from "next/image";

import { useState } from "react";
import type { Product } from "@/app/types/products";
import { useSearchParams } from "next/navigation";

type Props = {
  products: Product[];
};

export default function AdminProductsClient({ products: initialProducts }: Props) {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState(initialProducts);
  const [editingId, setEditingId] = useState<string | null>(() => {
    const editId = searchParams.get("edit");

    return initialProducts.some((product) => product.id === editId)
      ? editId
      : null;
  });
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 0,
    description: "",
    category: "",
    image: "",
    stock: 0,
    active: true,
    theme: "",
    badge: "",
    featured: false,
  });

  const editingProduct =
    products.find((product) => product.id === editingId) ?? null;

  function updateEditing(field: keyof Product, value: string | number | boolean) {
    if (!editingId) return;

    setProducts((current) =>
      current.map((product) =>
        product.id === editingId
          ? { ...product, [field]: value }
          : product
      )
    );
  }

  async function saveProduct() {
    if (!editingProduct) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingProduct.id,
          name: editingProduct.name,
          price: editingProduct.price,
          description: editingProduct.description,
          category: editingProduct.category,
          image: editingProduct.image,
          stock: editingProduct.stock,
          active: editingProduct.active,
          theme: editingProduct.theme,
          badge: editingProduct.badge,
          featured: editingProduct.featured,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to update product.");
      }

      setProducts((current) =>
        current.map((product) =>
          product.id === data.product.id ? data.product : product
        )
      );

      setEditingId(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update product."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-3 border-b border-zinc-200 p-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Product Catalog
          </h2>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {products.length} product{products.length === 1 ? "" : "s"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError("");
            setNewProduct({
              name: "",
              price: 0,
              description: "",
              category: "",
              image: "",
              stock: 0,
              active: true,
              theme: "",
              badge: "",
              featured: false,
            });
            setAdding(true);
          }}
          className="min-h-11 w-full rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-yellow-300 sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          + Add Product
        </button>
      </div>

      {error && (
        <div className="border-b border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {products.length === 0 ? (
        <div className="p-10 text-center sm:p-12">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            No products found
          </h3>

          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Add your first product to start building the catalog.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto overscroll-x-contain">
          <table className="w-full min-w-[900px] text-left">
            <thead className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
              <tr>
                <th className="px-5 py-4 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                  Product
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                  Category
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                  Theme
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                  Badge
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                  Featured
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                  Price
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                  Stock
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                  Status
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                >
                  <td className="px-4 py-3.5 sm:px-5 sm:py-4">
                    <div className="flex items-center gap-4">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={64}
                          height={64}
                          className="h-14 w-14 rounded-xl object-cover sm:h-16 sm:w-16"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-400">
                          No image
                        </div>
                      )}

                      <div>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {product.name}
                        </p>

                        <p className="mt-1 max-w-md text-xs text-zinc-500 dark:text-zinc-400">
                          {product.description ?? "No description"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                    {product.category ?? "Uncategorized"}
                  </td>

                  <td className="px-5 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                    {product.theme ?? "Default"}
                  </td>

                  <td className="px-4 py-3.5 sm:px-5 sm:py-4">
                    {product.badge ? (
                      <span className="rounded-full bg-yellow-100 px-4 min-h-10 py-1 text-xs font-semibold text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
                        {product.badge.replace("_", " ")}
                      </span>
                    ) : (
                      <span className="text-sm text-zinc-400">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 sm:px-5 sm:py-4">
                    {product.featured ? (
                      <span className="rounded-full bg-green-100 px-4 min-h-10 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-300">
                        ⭐ Yes
                      </span>
                    ) : (
                      <span className="text-sm text-zinc-400">—</span>
                    )}
                  </td>

                  <td className="px-5 py-4 font-semibold text-zinc-900 dark:text-zinc-100">
                    ₹{product.price.toLocaleString("en-IN")}
                  </td>

                  <td className="px-4 py-3.5 sm:px-5 sm:py-4">
                    <span
                      className={
                        product.stock === 0
                          ? "font-semibold text-red-600"
                          : product.stock <= 5
                            ? "font-semibold text-orange-600"
                            : "text-zinc-700 dark:text-zinc-300"
                      }
                    >
                      {product.stock}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 sm:px-5 sm:py-4">
                    <span
                      className={
                        product.active
                          ? "rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                          : "rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400"
                      }
                    >
                      {product.active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 sm:px-5 sm:py-4">
                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setEditingId(product.id);
                      }}
                      className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-4 min-h-10 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {adding && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center sm:p-6">
          <div className="my-4 w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl dark:bg-zinc-900 sm:my-6 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Add Product
                </h2>

                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Create a new product for the MineNote catalog.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAdding(false)}
                disabled={saving}
                className="rounded-lg px-4 min-h-10 py-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Product Name
                </label>

                <input
                  value={newProduct.name}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      name: event.target.value,
                    })
                  }
                  placeholder="e.g. Sakura Anime"
                  className="min-h-12 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-yellow-400 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Price
                </label>

                <input
                  type="number"
                  min="0"
                  value={newProduct.price}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      price: Number(event.target.value),
                    })
                  }
                  className="min-h-12 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-yellow-400 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Stock
                </label>

                <input
                  type="number"
                  min="0"
                  value={newProduct.stock}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      stock: Number(event.target.value),
                    })
                  }
                  className="min-h-12 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-yellow-400 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Category
                </label>

                <input
                  value={newProduct.category}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      category: event.target.value,
                    })
                  }
                  placeholder="e.g. Anime"
                  className="min-h-12 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-yellow-400 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Image Path
                </label>

                <input
                  value={newProduct.image}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      image: event.target.value,
                    })
                  }
                  placeholder="/images/product.jpg"
                  className="min-h-12 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-yellow-400 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Description
                </label>

                <textarea
                  rows={4}
                  value={newProduct.description}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      description: event.target.value,
                    })
                  }
                  placeholder="Describe the product..."
                  className="min-h-12 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-yellow-400 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Theme
                </label>

                <select
                  value={newProduct.theme}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      theme: event.target.value,
                    })
                  }
                  className="min-h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-yellow-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  <option value="">Default</option>
                  <option value="anime">Anime</option>
                  <option value="fantasy">Fantasy</option>
                  <option value="superhero">Superhero</option>
                  <option value="nature">Nature</option>
                  <option value="minimal">Minimal</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Badge
                </label>

                <select
                  value={newProduct.badge}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      badge: event.target.value,
                    })
                  }
                  className="min-h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-yellow-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  <option value="">No badge</option>
                  <option value="best_seller">Best Seller</option>
                  <option value="new">New</option>
                  <option value="limited">Limited</option>
                  <option value="featured">Featured</option>
                </select>
              </div>

              <label className="flex min-h-11 items-center gap-3 md:col-span-2">
                <input
                  type="checkbox"
                  checked={newProduct.featured}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      featured: event.target.checked,
                    })
                  }
                  className="h-5 w-5 shrink-0"
                />

                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Featured product
                </span>
              </label>

              <label className="flex min-h-11 items-center gap-3 md:col-span-2">
                <input
                  type="checkbox"
                  checked={newProduct.active}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      active: event.target.checked,
                    })
                  }
                  className="h-5 w-5 shrink-0"
                />

                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Product is active and visible to customers
                </span>
              </label>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800 sm:flex-row sm:justify-end sm:pt-5">
              <button
                type="button"
                onClick={() => setAdding(false)}
                disabled={saving}
                className="min-h-12 w-full rounded-xl border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={async () => {
                  setSaving(true);
                  setError("");

                  try {
                    const response = await fetch("/api/admin/products", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(newProduct),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                      throw new Error(
                        data.error ?? "Unable to create product."
                      );
                    }

                    setProducts((current) => [
                      data.product,
                      ...current,
                    ]);

                    setAdding(false);
                  } catch (err) {
                    setError(
                      err instanceof Error
                        ? err.message
                        : "Unable to create product."
                    );
                  } finally {
                    setSaving(false);
                  }
                }}
                className="min-h-12 w-full rounded-xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {saving ? "Creating..." : "Create Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center sm:p-6">
          <div className="my-4 w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl dark:bg-zinc-900 sm:my-6 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Edit Product
                </h2>

                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Update catalog information, pricing, stock, or availability.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="rounded-lg px-4 min-h-10 py-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Product Name
                </label>

                <input
                  value={editingProduct.name}
                  onChange={(event) =>
                    updateEditing("name", event.target.value)
                  }
                  className="min-h-12 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-yellow-400 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Price
                </label>

                <input
                  type="number"
                  min="0"
                  value={editingProduct.price}
                  onChange={(event) =>
                    updateEditing("price", Number(event.target.value))
                  }
                  className="min-h-12 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-yellow-400 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Stock
                </label>

                <input
                  type="number"
                  min="0"
                  value={editingProduct.stock}
                  onChange={(event) =>
                    updateEditing("stock", Number(event.target.value))
                  }
                  className="min-h-12 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-yellow-400 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Category
                </label>

                <input
                  value={editingProduct.category ?? ""}
                  onChange={(event) =>
                    updateEditing("category", event.target.value)
                  }
                  className="min-h-12 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-yellow-400 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Image Path
                </label>

                <input
                  value={editingProduct.image ?? ""}
                  onChange={(event) =>
                    updateEditing("image", event.target.value)
                  }
                  className="min-h-12 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-yellow-400 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Description
                </label>

                <textarea
                  rows={4}
                  value={editingProduct.description ?? ""}
                  onChange={(event) =>
                    updateEditing("description", event.target.value)
                  }
                  className="min-h-12 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-yellow-400 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Theme
                </label>

                <select
                  value={editingProduct.theme ?? ""}
                  onChange={(event) =>
                    updateEditing("theme", event.target.value)
                  }
                  className="min-h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-yellow-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  <option value="">Default</option>
                  <option value="anime">Anime</option>
                  <option value="fantasy">Fantasy</option>
                  <option value="superhero">Superhero</option>
                  <option value="nature">Nature</option>
                  <option value="minimal">Minimal</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Badge
                </label>

                <select
                  value={editingProduct.badge ?? ""}
                  onChange={(event) =>
                    updateEditing("badge", event.target.value)
                  }
                  className="min-h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-yellow-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  <option value="">No badge</option>
                  <option value="best_seller">Best Seller</option>
                  <option value="new">New</option>
                  <option value="limited">Limited</option>
                  <option value="featured">Featured</option>
                </select>
              </div>

              <label className="flex min-h-11 items-center gap-3 md:col-span-2">
                <input
                  type="checkbox"
                  checked={editingProduct.featured}
                  onChange={(event) =>
                    updateEditing("featured", event.target.checked)
                  }
                  className="h-5 w-5 shrink-0"
                />

                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Featured product
                </span>
              </label>

              <label className="flex min-h-11 items-center gap-3 md:col-span-2">
                <input
                  type="checkbox"
                  checked={editingProduct.active}
                  onChange={(event) =>
                    updateEditing("active", event.target.checked)
                  }
                  className="h-5 w-5 shrink-0"
                />

                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Product is active and visible to customers
                </span>
              </label>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800 sm:flex-row sm:justify-end sm:pt-5">
              <button
                type="button"
                onClick={() => setEditingId(null)}
                disabled={saving}
                className="min-h-12 w-full rounded-xl border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveProduct}
                disabled={saving}
                className="min-h-12 w-full rounded-xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

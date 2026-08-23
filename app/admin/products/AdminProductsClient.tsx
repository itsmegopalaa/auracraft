"use client";

import { useState } from "react";

type Product = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  category: string | null;
  image: string | null;
  stock: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

type Props = {
  products: Product[];
};

export default function AdminProductsClient({ products: initialProducts }: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
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
        body: JSON.stringify(editingProduct),
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
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-200 p-5">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">
            Product Catalog
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
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
            });
            setAdding(true);
          }}
          className="rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-yellow-300"
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
        <div className="p-12 text-center">
          <h3 className="font-semibold text-zinc-900">
            No products found
          </h3>

          <p className="mt-2 text-sm text-zinc-500">
            Add your first product to start building the catalog.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead className="border-b border-zinc-100 bg-zinc-50">
              <tr>
                <th className="px-5 py-4 text-xs font-semibold uppercase text-zinc-500">
                  Product
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase text-zinc-500">
                  Category
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase text-zinc-500">
                  Price
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase text-zinc-500">
                  Stock
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase text-zinc-500">
                  Status
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase text-zinc-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-zinc-100 last:border-0"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-4">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-16 w-16 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-zinc-100 text-xs text-zinc-400">
                          No image
                        </div>
                      )}

                      <div>
                        <p className="font-semibold text-zinc-900">
                          {product.name}
                        </p>

                        <p className="mt-1 max-w-md text-xs text-zinc-500">
                          {product.description ?? "No description"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm text-zinc-700">
                    {product.category ?? "Uncategorized"}
                  </td>

                  <td className="px-5 py-4 font-semibold text-zinc-900">
                    ₹{product.price.toLocaleString("en-IN")}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={
                        product.stock === 0
                          ? "font-semibold text-red-600"
                          : product.stock <= 5
                            ? "font-semibold text-orange-600"
                            : "text-zinc-700"
                      }
                    >
                      {product.stock}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={
                        product.active
                          ? "rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                          : "rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600"
                      }
                    >
                      {product.active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setEditingId(product.id);
                      }}
                      className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">
                  Add Product
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Create a new product for the MineNote catalog.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAdding(false)}
                disabled={saving}
                className="rounded-lg px-3 py-2 text-zinc-500 hover:bg-zinc-100"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-zinc-700">
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
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
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
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
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
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
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
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
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
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-yellow-400"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-zinc-700">
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
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-yellow-400"
                />
              </div>

              <label className="flex items-center gap-3 md:col-span-2">
                <input
                  type="checkbox"
                  checked={newProduct.active}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      active: event.target.checked,
                    })
                  }
                  className="h-4 w-4"
                />

                <span className="text-sm font-medium text-zinc-700">
                  Product is active and visible to customers
                </span>
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-zinc-200 pt-5">
              <button
                type="button"
                onClick={() => setAdding(false)}
                disabled={saving}
                className="rounded-xl border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50"
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
                className="rounded-xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Creating..." : "Create Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">
                  Edit Product
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Update catalog information, pricing, stock, or availability.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="rounded-lg px-3 py-2 text-zinc-500 hover:bg-zinc-100"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Product Name
                </label>

                <input
                  value={editingProduct.name}
                  onChange={(event) =>
                    updateEditing("name", event.target.value)
                  }
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Price
                </label>

                <input
                  type="number"
                  min="0"
                  value={editingProduct.price}
                  onChange={(event) =>
                    updateEditing("price", Number(event.target.value))
                  }
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Stock
                </label>

                <input
                  type="number"
                  min="0"
                  value={editingProduct.stock}
                  onChange={(event) =>
                    updateEditing("stock", Number(event.target.value))
                  }
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Category
                </label>

                <input
                  value={editingProduct.category ?? ""}
                  onChange={(event) =>
                    updateEditing("category", event.target.value)
                  }
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Image Path
                </label>

                <input
                  value={editingProduct.image ?? ""}
                  onChange={(event) =>
                    updateEditing("image", event.target.value)
                  }
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-yellow-400"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Description
                </label>

                <textarea
                  rows={4}
                  value={editingProduct.description ?? ""}
                  onChange={(event) =>
                    updateEditing("description", event.target.value)
                  }
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-yellow-400"
                />
              </div>

              <label className="flex items-center gap-3 md:col-span-2">
                <input
                  type="checkbox"
                  checked={editingProduct.active}
                  onChange={(event) =>
                    updateEditing("active", event.target.checked)
                  }
                  className="h-4 w-4"
                />

                <span className="text-sm font-medium text-zinc-700">
                  Product is active and visible to customers
                </span>
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-zinc-200 pt-5">
              <button
                type="button"
                onClick={() => setEditingId(null)}
                disabled={saving}
                className="rounded-xl border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveProduct}
                disabled={saving}
                className="rounded-xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
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

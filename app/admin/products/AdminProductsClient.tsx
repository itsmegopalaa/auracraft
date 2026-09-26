"use client";

import Image from "next/image";
import MineNoteProductionTemplateManager from "./MineNoteProductionTemplateManager";
import NotebookPageFlip from "@/app/components/notebook/NotebookPageFlip";

import { useState } from "react";
import type { Product } from "@/app/types/products";
import { useSearchParams } from "next/navigation";
import {
  getProductProductionAsset,
  normalizeProductProductionAssets,
  PRODUCT_PRODUCTION_SIDES,
} from "@/app/lib/product-production-assets";
import {
  getNotebookSheetForSide,
  getNotebookSheetSide,
} from "@/app/lib/notebook-physical-model";

type ProductPagePrice = {
  product_id: string;
  pages: 100 | 150 | 200;
  price: number;
};

type Props = {
  products: Product[];
  pagePrices: ProductPagePrice[];
};

export default function AdminProductsClient({
  products: initialProducts,
  pagePrices: initialPagePrices,
}: Props) {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState(initialProducts);
  const [pagePrices, setPagePrices] = useState(initialPagePrices);
  const [editingId, setEditingId] = useState<string | null>(() => {
    const editId = searchParams.get("edit");

    return initialProducts.some((product) => product.id === editId)
      ? editId
      : null;
  });
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [shippingWeight, setShippingWeight] = useState("");
  const [packageLength, setPackageLength] = useState("");
  const [packageWidth, setPackageWidth] = useState("");
  const [packageHeight, setPackageHeight] = useState("");
  const [shippingSaving, setShippingSaving] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
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

  const editingProductionAssets = editingProduct
    ? normalizeProductProductionAssets(editingProduct.production_assets)
    : [];

  const [productionDraft, setProductionDraft] = useState<
    Record<
      string,
      {
        url: string;
        storagePath: string | null;
        mimeType: string | null;
      }
    >
  >({});

  const [productionSaving, setProductionSaving] = useState(false);
  const [productionUploading, setProductionUploading] =
    useState<string | null>(null);

  const productionPreviewPages = PRODUCT_PRODUCTION_SIDES.map((side) => {
    const asset =
      editingProductionAssets.find((item) => item.side === side);

    const label =
      side === "insideFront"
        ? "Inside Front"
        : side === "insideBack"
          ? "Inside Back"
          : side === "front"
            ? "Front Cover"
            : "Back Cover";

    return {
      id: side,
      label,
      imageUrl:
        productionDraft[side]?.url ??
        asset?.url ??
        "",
    };
  });

  function updateProductionDraft(
    side: string,
    value: string,
  ) {
    setProductionDraft((current) => ({
      ...current,
      [side]: {
        url: value,
        storagePath: current[side]?.storagePath ?? null,
        mimeType: current[side]?.mimeType ?? null,
      },
    }));
  }

  async function uploadProductionArtwork(
    side: (typeof PRODUCT_PRODUCTION_SIDES)[number],
    file: File,
  ) {
    if (!editingProduct) return;

    setProductionUploading(side);
    setError("");

    try {
      const formData = new FormData();
      formData.append("side", side);
      formData.append("file", file);

      const response = await fetch(
        `/api/admin/products/${editingProduct.id}/production/assets/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Unable to upload production artwork.",
        );
      }

      setProductionDraft((current) => ({
        ...current,
        [side]: {
          url: result.url,
          storagePath: result.storagePath ?? null,
          mimeType: result.mimeType ?? null,
        },
      }));
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload production artwork.",
      );
    } finally {
      setProductionUploading(null);
    }
  }

  async function saveProductionAssets() {
    if (!editingProduct) return;

    const assets = PRODUCT_PRODUCTION_SIDES.map((side) => {
      const existing = editingProductionAssets.find(
        (asset) => asset.side === side,
      );

      const url =
        productionDraft[side]?.url ??
        existing?.url ??
        "";

      const storagePath =
        productionDraft[side]?.storagePath ??
        existing?.storagePath ??
        null;

      const mimeType =
        productionDraft[side]?.mimeType ??
        existing?.mimeType ??
        null;

      const sheet =
        getNotebookSheetForSide(side);

      const sheetSide =
        getNotebookSheetSide(side);

      return {
        side,
        sheetId: sheet.id,
        sheetSide,
        url: url.trim(),
        storagePath,
        width: existing?.width ?? null,
        height: existing?.height ?? null,
        mimeType,

        source: existing?.source ?? "product_artwork",
        templateVersion:
          existing?.templateVersion ?? "minenote-v1",
      };
    });

    if (assets.some((asset) => !asset.url)) {
      setError(
        "Add artwork for all four production sides before saving.",
      );
      return;
    }

    setProductionSaving(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/products/${editingProduct.id}/production/assets`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ assets }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Unable to save production assets.",
        );
      }

      setProducts((current) =>
        current.map((product) =>
          product.id === editingProduct.id
            ? {
                ...product,
                production_assets:
                  result.production.assets,
                production_template_version:
                  result.production.templateVersion,
              }
            : product,
        ),
      );

      setProductionDraft({});
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save production assets.",
      );
    } finally {
      setProductionSaving(false);
    }
  }

  function getProductPagePrices(productId: string) {
    const prices = pagePrices.filter(
      (item) => item.product_id === productId
    );

    return [100, 150, 200].map((pages) => ({
      pages: pages as 100 | 150 | 200,
      price:
        prices.find((item) => item.pages === pages)?.price ??
        null,
    }));
  }

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

  function toggleProductSelection(id: string) {
    setSelectedProductIds((current) =>
      current.includes(id)
        ? current.filter((productId) => productId !== id)
        : [...current, id]
    );
  }

  function toggleAllProducts() {
    setSelectedProductIds((current) =>
      current.length === products.length
        ? []
        : products.map((product) => product.id)
    );
  }

  async function applyBulkShipping() {
    if (selectedProductIds.length === 0) {
      setError("Select at least one product.");
      return;
    }

    const weight = Number(shippingWeight);
    const length = Number(packageLength);
    const width = Number(packageWidth);
    const height = Number(packageHeight);

    if (![weight, length, width, height].every((value) => Number.isFinite(value) && value > 0)) {
      setError("Enter positive shipping weight and package dimensions.");
      return;
    }

    setShippingSaving(true);
    setError("");

    try {
      const response = await fetch("/api/admin/products/shipping", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productIds: selectedProductIds,
          shipping: {
            shipping_weight_grams: weight,
            package_length_cm: length,
            package_width_cm: width,
            package_height_cm: height,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to update shipping details.");
      }

      setProducts((current) =>
        current.map((product) => {
          const updated = data.products?.find(
            (item: Product) => item.id === product.id
          );

          return updated ?? product;
        })
      );

      setSelectedProductIds([]);
      setShippingWeight("");
      setPackageLength("");
      setPackageWidth("");
      setPackageHeight("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update shipping details."
      );
    } finally {
      setShippingSaving(false);
    }
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

      {products.length > 0 && (
        <div className="border-b border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-5">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Bulk Shipping Setup
            </h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Select products and apply their physical shipping weight and package dimensions together.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Weight (grams)
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={shippingWeight}
                onChange={(event) => setShippingWeight(event.target.value)}
                placeholder="e.g. 500"
                className="min-h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Length (cm)
              </span>
              <input
                type="number"
                min="0"
                step="0.1"
                value={packageLength}
                onChange={(event) => setPackageLength(event.target.value)}
                placeholder="e.g. 32"
                className="min-h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Width (cm)
              </span>
              <input
                type="number"
                min="0"
                step="0.1"
                value={packageWidth}
                onChange={(event) => setPackageWidth(event.target.value)}
                placeholder="e.g. 24"
                className="min-h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Height (cm)
              </span>
              <input
                type="number"
                min="0"
                step="0.1"
                value={packageHeight}
                onChange={(event) => setPackageHeight(event.target.value)}
                placeholder="e.g. 5"
                className="min-h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {selectedProductIds.length} product{selectedProductIds.length === 1 ? "" : "s"} selected
            </p>

            <button
              type="button"
              onClick={applyBulkShipping}
              disabled={shippingSaving || selectedProductIds.length === 0}
              className="min-h-11 rounded-xl bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {shippingSaving ? "Applying..." : "Apply to Selected"}
            </button>
          </div>
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
                <th className="w-12 px-5 py-4">
                  <input
                    type="checkbox"
                    checked={
                      products.length > 0 &&
                      selectedProductIds.length === products.length
                    }
                    onChange={toggleAllProducts}
                    aria-label="Select all products"
                    className="h-4 w-4 rounded border-zinc-300 accent-yellow-400"
                  />
                </th>
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
                  <td className="w-12 px-5 py-3.5 sm:py-4">
                    <input
                      type="checkbox"
                      checked={selectedProductIds.includes(product.id)}
                      onChange={() => toggleProductSelection(product.id)}
                      aria-label={`Select ${product.name}`}
                      className="h-4 w-4 rounded border-zinc-300 accent-yellow-400"
                    />
                  </td>

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

                  <td className="px-5 py-4">
                    <div className="space-y-1.5 text-sm">
                      {getProductPagePrices(product.id).map(
                        ({ pages, price }) => (
                          <div
                            key={pages}
                            className="flex items-center justify-between gap-4"
                          >
                            <span className="text-zinc-500 dark:text-zinc-400">
                              {pages}p
                            </span>
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                              {price === null
                                ? "—"
                                : `₹${price.toLocaleString("en-IN")}`}
                            </span>
                          </div>
                        )
                      )}
                    </div>
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

              <MineNoteProductionTemplateManager />

              <section className="md:col-span-2 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Production Studio
                    </h3>
                    <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                      Store the permanent four-side production artwork for this
                      catalog product. Customer preview order is Front → Inside
                      Front → Inside Back → Back.
                    </p>
                  </div>

                  <span
                    className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      PRODUCT_PRODUCTION_SIDES.every((side) =>
                        Boolean(
                          productionDraft[side]?.url ||
                            editingProductionAssets.find(
                              (asset) => asset.side === side,
                            )?.url,
                        ),
                      )
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                    }`}
                  >
                    {
                      PRODUCT_PRODUCTION_SIDES.filter((side) =>
                        Boolean(
                          productionDraft[side]?.url ||
                            editingProductionAssets.find(
                              (asset) => asset.side === side,
                            )?.url,
                        ),
                      ).length
                    } / 4 ready
                  </span>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                  <div className="space-y-3">
                    {PRODUCT_PRODUCTION_SIDES.map((side) => {
                      const asset =
                        editingProductionAssets.find(
                          (item) => item.side === side,
                        );

                      const label =
                        side === "insideFront"
                          ? "Inside Front"
                          : side === "insideBack"
                            ? "Inside Back"
                            : side === "front"
                              ? "Front Cover"
                              : "Back Cover";

                      const value =
                        productionDraft[side] ??
                        asset?.url ??
                        "";

                      return (
                        <div
                          key={side}
                          className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                {label}
                              </div>
                              <div className="mt-0.5 text-[10px] text-zinc-400">
                                {side}
                              </div>
                            </div>

                            <span className="text-[10px] text-zinc-400">
                              {asset ? "Saved" : "New"}
                            </span>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <label className="inline-flex min-h-10 cursor-pointer items-center rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800">
                              {productionUploading === side
                                ? "Uploading…"
                                : value
                                  ? "Replace Artwork"
                                  : "Choose Artwork"}
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                className="sr-only"
                                disabled={
                                  productionUploading !== null
                                }
                                onChange={(event) => {
                                  const file =
                                    event.target.files?.[0];

                                  event.currentTarget.value = "";

                                  if (file) {
                                    void uploadProductionArtwork(
                                      side,
                                      file,
                                    );
                                  }
                                }}
                              />
                            </label>

                            {value && (
                              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                Artwork uploaded
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={saveProductionAssets}
                      disabled={
                        productionSaving ||
                        !editingProduct
                      }
                      className="min-h-11 w-full rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                      {productionSaving
                        ? "Saving Production Assets…"
                        : "Save 4 Production Sides"}
                    </button>
                  </div>

                  <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                          Production Preview
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          4-page physical sequence
                        </div>
                      </div>
                    </div>

                    {productionPreviewPages.some(
                      (page) => page.imageUrl,
                    ) ? (
                      <NotebookPageFlip
                        pages={productionPreviewPages.map(
                          (page) => ({
                            id: page.id,
                            label: page.label,
                            imageUrl:
                              page.imageUrl || undefined,
                            content: page.imageUrl ? (
                              <div className="relative h-full w-full overflow-hidden rounded-lg bg-white">
                                <Image
                                  src={page.imageUrl}
                                  alt={page.label}
                                  fill
                                  sizes="(max-width: 1024px) 100vw, 50vw"
                                  className="object-contain"
                                />
                              </div>
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                                No artwork
                              </div>
                            ),
                          }),
                        )}
                      />
                    ) : (
                      <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed border-zinc-300 text-center text-xs text-zinc-400 dark:border-zinc-700">
                        Add production artwork to preview the
                        notebook.
                      </div>
                    )}
                  </div>
                </div>
              </section>

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

                    if (Array.isArray(data.pagePrices)) {
                      setPagePrices((current) => [
                        ...current.filter(
                          (item) => item.product_id !== data.product.id
                        ),
                        ...data.pagePrices,
                      ]);
                    }

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

              <div className="md:col-span-2">
                <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-950/20">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Canonical Catalog Pricing
                      </p>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Fixed MineNote page-count pricing. Customer pricing uses these values.
                      </p>
                    </div>
                    <span className="rounded-full bg-yellow-200 px-2.5 py-1 text-[11px] font-semibold text-yellow-900 dark:bg-yellow-900/50 dark:text-yellow-200">
                      Locked
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    {getProductPagePrices(editingProduct.id).map(
                      ({ pages, price }) => (
                        <div
                          key={pages}
                          className="rounded-xl border border-yellow-200 bg-white px-3 py-2.5 dark:border-yellow-900/40 dark:bg-zinc-900"
                        >
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {pages} pages
                          </p>
                          <p className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100">
                            {price === null
                              ? "Not configured"
                              : `₹${price.toLocaleString("en-IN")}`}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
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

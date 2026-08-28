"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import AdminThemeSwitcher from "./AdminThemeSwitcher";

type AdminNavProps = {
  unreadInboxCount: number;
  userEmail: string;
};

export default function AdminNav({
  unreadInboxCount,
  userEmail,
}: AdminNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState<
    "all" | "products" | "orders" | "inbox"
  >("all");

  const [searchResults, setSearchResults] = useState<{
    orders: Array<{ id: string; order_id: string; name: string; email: string }>;
    products: Array<{ id: string; name: string; price: number; stock: number }>;
    inbox: Array<{ id: string; name: string; email: string; message: string }>;
  }>({
    orders: [],
    products: [],
    inbox: [],
  });

  const [searching, setSearching] = useState(false);

  async function handleSignOut() {
    setLoading(true);

    await supabase.auth.signOut();

    router.replace("/admin/login");
    router.refresh();
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  useEffect(() => {
    const query = searchQuery.trim();

    if (!query) {
      setSearchResults({
        orders: [],
        products: [],
        inbox: [],
      });
      setSearching(false);
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        setSearching(true);

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error("Admin session not available");
        }

        const response = await fetch(
          `/api/admin/search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(searchCategory)}`,
          {
            signal: controller.signal,
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const data = await response.json();
        setSearchResults({
          orders: data.orders ?? [],
          products: data.products ?? [],
          inbox: data.inbox ?? [],
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Admin search failed:", error);
          setSearchResults({
            orders: [],
            products: [],
            inbox: [],
          });
        }
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, searchCategory]);

  const links = [
    {
      href: "/admin",
      label: "Dashboard",
      active: pathname === "/admin",
    },
    {
      href: "/admin/orders",
      label: "Orders",
      active: pathname.startsWith("/admin/orders"),
    },
    {
      href: "/admin/products",
      label: "Products",
      active: pathname.startsWith("/admin/products"),
    },
    {
      href: "/admin/inbox",
      label: "Inbox",
      active: pathname.startsWith("/admin/inbox"),
      badge: unreadInboxCount,
    },
  ];

  return (
    <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="flex min-h-16 items-center justify-between gap-4">
          <Link
            href="/admin"
            onClick={closeMenu}
            className="shrink-0 text-lg font-bold text-zinc-900 dark:text-zinc-100"
          >
            MineNote Admin
          </Link>

          <div className="hidden items-center gap-5 sm:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 text-sm font-medium transition ${
                  link.active
                    ? "text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-zinc-100"
                }`}
              >
                <span>{link.label}</span>

                {link.badge && link.badge > 0 ? (
                  <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[11px] font-bold leading-none text-white">
                    {link.badge > 99 ? "99+" : link.badge}
                  </span>
                ) : null}
              </Link>
            ))}
          </div>

          <div className="flex flex-1 items-center justify-end gap-3">
            <div className="relative w-full max-w-lg md:block">
              <div className="flex overflow-hidden rounded-xl border border-zinc-300 bg-white transition focus-within:border-yellow-500 focus-within:ring-2 focus-within:ring-yellow-100 dark:border-zinc-700 dark:bg-zinc-800 dark:focus-within:ring-yellow-900/30">
                <select
                  value={searchCategory}
                  onChange={(event) =>
                    setSearchCategory(
                      event.target.value as
                        | "all"
                        | "products"
                        | "orders"
                        | "inbox"
                    )
                  }
                  aria-label="Search category"
                  className="border-r border-zinc-200 bg-transparent px-3 py-2.5 text-xs font-medium text-zinc-700 outline-none dark:border-zinc-700 dark:text-zinc-300"
                >
                  <option value="all">All</option>
                  <option value="products">Products</option>
                  <option value="orders">Orders</option>
                  <option value="inbox">Inbox</option>
                </select>

                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={
                    searchCategory === "products"
                      ? "Search products..."
                      : searchCategory === "orders"
                        ? "Search orders..."
                        : searchCategory === "inbox"
                          ? "Search inbox..."
                          : "Search orders, products, inbox..."
                  }
                  className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                />

                {searching ? (
                  <span className="flex items-center px-3 text-xs text-zinc-400">
                    …
                  </span>
                ) : (
                  <span className="pointer-events-none flex items-center px-3 text-zinc-400">
                    🔎
                  </span>
                )}
              </div>

              {searchQuery.trim() && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
                  {searchResults.orders.length === 0 &&
                  searchResults.products.length === 0 &&
                  searchResults.inbox.length === 0 &&
                  !searching ? (
                    <p className="px-3 py-4 text-sm text-zinc-500">
                      No results found.
                    </p>
                  ) : (
                    <>
                      {searchResults.orders.length > 0 && (
                        <div>
                          <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                            Orders
                          </p>

                          {searchResults.orders.map((order) => (
                            <Link
                              key={order.id}
                              href={`/admin/orders/${order.order_id}`}
                              onClick={() => setSearchQuery("")}
                              className="block rounded-xl px-3 py-2.5 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            >
                              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                {order.order_id}
                              </p>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {order.name} · {order.email}
                              </p>
                            </Link>
                          ))}
                        </div>
                      )}

                      {searchResults.products.length > 0 && (
                        <div className="mt-2 border-t border-zinc-100 pt-2 dark:border-zinc-800">
                          <p className="px-3 pb-1 pt-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                            Products
                          </p>

                          {searchResults.products.map((product) => (
                            <Link
                              key={product.id}
                              href={`/admin/products?edit=${product.id}`}
                              onClick={() => setSearchQuery("")}
                              className="block rounded-xl px-3 py-2.5 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            >
                              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                {product.name}
                              </p>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                ₹{product.price} · Stock: {product.stock}
                              </p>
                            </Link>
                          ))}
                        </div>
                      )}

                      {searchResults.inbox.length > 0 && (
                        <div className="mt-2 border-t border-zinc-100 pt-2 dark:border-zinc-800">
                          <p className="px-3 pb-1 pt-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                            Inbox
                          </p>

                          {searchResults.inbox.map((message) => (
                            <Link
                              key={message.id}
                              href="/admin/inbox"
                              onClick={() => setSearchQuery("")}
                              className="block rounded-xl px-3 py-2.5 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            >
                              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                {message.name}
                              </p>
                              <p className="line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
                                {message.message}
                              </p>
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            <AdminThemeSwitcher />

            <span className="hidden text-xs text-zinc-500 dark:text-zinc-400 lg:block">
              {userEmail}
            </span>

            <button
              type="button"
              onClick={handleSignOut}
              disabled={loading}
              className="hidden rounded-xl border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 sm:block"
            >
              {loading ? "Signing out..." : "Sign out"}
            </button>

            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((current) => !current)}
              className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800 sm:hidden"
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-zinc-100 dark:border-zinc-800 py-4 dark:border-zinc-800 sm:hidden">
            <div className="space-y-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition ${
                    link.active
                      ? "bg-yellow-50 text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:bg-zinc-950 hover:text-zinc-900 dark:text-zinc-100"
                  }`}
                >
                  <span>{link.label}</span>

                  {link.badge && link.badge > 0 ? (
                    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[11px] font-bold leading-none text-white">
                      {link.badge > 99 ? "99+" : link.badge}
                    </span>
                  ) : null}
                </Link>
              ))}
            </div>

            <div className="mt-4 border-t border-zinc-100 dark:border-zinc-800 pt-4 dark:border-zinc-800">
              <p className="mb-3 truncate px-4 text-xs text-zinc-500 dark:text-zinc-400">
                {userEmail}
              </p>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={loading}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Signing out..." : "Sign out"}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import AdminThemeSwitcher from "./AdminThemeSwitcher";

type SearchCategory =
  | "all"
  | "products"
  | "orders"
  | "inbox"
  | "customers"
  | "payments";

type SearchResult = {
  orders: Array<{
    id: string;
    order_id: string;
    name: string;
    email: string;
  }>;
  products: Array<{
    id: string;
    name: string;
    price: number;
    stock: number;
  }>;
  inbox: Array<{
    id: string;
    name: string;
    email: string;
    message: string;
  }>;
  customers: Array<{
    customer_id: string | null;
    name: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    pin: string;
    created_at: string;
  }>;
  payments: Array<{
    id: string;
    order_id: string;
    customer_id: string | null;
    name: string;
    email: string;
    total: number;
    payment_method: string | null;
    payment_status: string | null;
    razorpay_order_id: string | null;
    razorpay_payment_id: string | null;
    created_at: string;
  }>;
};

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/orders", label: "Orders", icon: "🛒" },
  { href: "/admin/production-batches", label: "Production", icon: "🎨" },
  { href: "/admin/custom-covers", label: "Custom Covers", icon: "🖼️" },
  { href: "/admin/shipping", label: "Shipping", icon: "🚚" },
  { href: "/admin/products", label: "Products", icon: "📚" },
  { href: "/admin/customers", label: "Customers", icon: "👥" },
  { href: "/admin/payments", label: "Payments", icon: "💳" },
  { href: "/admin/inbox", label: "Inbox", icon: "📩" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

const searchCategories: Array<{
  value: SearchCategory;
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "orders", label: "Orders" },
  { value: "products", label: "Products" },
  { value: "customers", label: "Customers" },
  { value: "payments", label: "Payments" },
  { value: "inbox", label: "Inbox" },
];

type AdminNavProps = {
  unreadInboxCount?: number;
  userEmail?: string;
};

export default function AdminNav({
  unreadInboxCount = 0,
  userEmail = "",
}: AdminNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchCategory, setSearchCategory] =
    useState<SearchCategory>("all");
  const [results, setResults] = useState<SearchResult>({
    orders: [],
    products: [],
    inbox: [],
    customers: [],
    payments: [],
  });
  const [loading, setLoading] = useState(false);

  const searchRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setResults({
        orders: [],
        products: [],
        inbox: [],
        customers: [],
        payments: [],
      });
      return;
    }

    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams({
          q: search.trim(),
          category: searchCategory,
        });

        const response = await fetch(`/api/admin/search?${params}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const data = await response.json();

        setResults({
          orders: data.orders ?? [],
          products: data.products ?? [],
          inbox: data.inbox ?? [],
          customers: data.customers ?? [],
          payments: data.payments ?? [],
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setResults({
            orders: [],
            products: [],
            inbox: [],
            customers: [],
            payments: [],
          });
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [search, searchCategory]);

  const totalResults =
    results.orders.length +
    results.products.length +
    results.inbox.length +
    results.customers.length +
    results.payments.length;

  function openSearch() {
    setSearchOpen(true);
    window.setTimeout(() => searchInputRef.current?.focus(), 0);
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();

    if (!search.trim()) return;

    const value = search.trim();

    if (searchCategory === "orders" && results.orders[0]) {
      router.push(`/admin/orders/${results.orders[0].id}`);
      return;
    }

    if (searchCategory === "products" && results.products[0]) {
      router.push("/admin/products");
      return;
    }

    if (searchCategory === "customers" && results.customers[0]) {
      router.push("/admin/customers");
      return;
    }

    if (searchCategory === "payments" && results.payments[0]) {
      router.push("/admin/payments");
      return;
    }

    if (searchCategory === "inbox" && results.inbox[0]) {
      router.push("/admin/inbox");
      return;
    }

    router.push(`/admin?search=${encodeURIComponent(value)}`);
    setSearchOpen(false);
  }

  async function signOut() {
    try {
      await fetch("/api/auth/signout", {
        method: "POST",
      });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  function handleNavbarTap() {
    if (window.innerWidth < 1024) {
      setMobileOpen((value) => !value);
    }
  }

  useEffect(() => {
    if (!mobileOpen) return;

    function handleOutsideNavbar(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;

      if (!document.querySelector(".admin-nav-shell")?.contains(target)) {
        setMobileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideNavbar);
    document.addEventListener("touchstart", handleOutsideNavbar);

    return () => {
      document.removeEventListener("mousedown", handleOutsideNavbar);
      document.removeEventListener("touchstart", handleOutsideNavbar);
    };
  }, [mobileOpen]);

  function goBack(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    router.back();
  }

  function goForward(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    router.forward();
  }

  return (
    <header
      onClick={handleNavbarTap}
      className="admin-nav-shell sticky top-0 z-50 border-b border-[var(--mn-border)] bg-[color:var(--mn-surface)]/92 backdrop-blur-xl"
    >
      <div className="admin-nav-inner mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center gap-2 lg:gap-4">
          <div className="flex shrink-0 items-center gap-1 lg:hidden">
            <button
              type="button"
              onClick={goBack}
              aria-label="Go back"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--mn-border)] bg-[var(--mn-control-bg)] text-[var(--mn-text-secondary)] transition hover:border-[var(--mn-border-strong)] hover:bg-[var(--mn-control-hover)] hover:text-[var(--mn-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-accent)]"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="m15 5-7 7 7 7" />
              </svg>
            </button>

            <button
              type="button"
              onClick={goForward}
              aria-label="Go forward"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--mn-border)] bg-[var(--mn-control-bg)] text-[var(--mn-text-secondary)] transition hover:border-[var(--mn-border-strong)] hover:bg-[var(--mn-control-hover)] hover:text-[var(--mn-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-accent)]"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="m9 5 7 7-7 7" />
              </svg>
            </button>
          </div>

          <Link
            href="/admin"
            onClick={(event) => {
              event.stopPropagation();
              setMobileOpen(false);
            }}
            className="admin-brand group flex shrink-0 items-center gap-2.5 rounded-[14px] px-1.5 py-1 transition-all duration-300 hover:bg-[var(--mn-control-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-accent)]"
            aria-label="MineNote Admin Dashboard"
          >
            <span
              aria-hidden="true"
              className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-[var(--mn-border-strong)] bg-[var(--mn-text)] text-[var(--mn-text-inverse)] shadow-[var(--mn-shadow-sm)] transition-transform duration-300 group-hover:-translate-y-0.5"
            >
              <span className="text-[12px] font-black tracking-[-0.08em]">
                MN
              </span>
              <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[var(--mn-accent)]" />
            </span>

            <span className="flex flex-col leading-none">
              <span className="text-[1.02rem] font-semibold tracking-[-0.035em] text-[var(--mn-text)]">
                MineNote
              </span>
              <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--mn-accent)]">
                Admin
              </span>
            </span>
          </Link>

          <nav
            className="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto lg:flex"
            aria-label="Admin navigation"
          >
            {navLinks.map((link) => {
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`admin-nav-link group relative flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-sm transition-all ${
                    active
                      ? "bg-[var(--mn-accent-soft)] font-semibold text-[var(--mn-text)]"
                      : "text-[var(--mn-text-secondary)] hover:bg-[var(--mn-control-bg)] hover:text-[var(--mn-text)]"
                  }`}
                >
                  <span aria-hidden="true">{link.icon}</span>
                  <span>{link.label}</span>

                  {link.href === "/admin/inbox" && unreadInboxCount > 0 && (
                    <span className="ml-0.5 min-w-4 rounded-full bg-neutral-950 px-1.5 py-0.5 text-center text-[10px] font-semibold leading-none text-white dark:bg-white dark:text-neutral-950">
                      {unreadInboxCount > 99 ? "99+" : unreadInboxCount}
                    </span>
                  )}

                  <span
                    className={`absolute inset-x-3 -bottom-0.5 h-[2px] origin-left rounded-full bg-[var(--mn-accent)] transition-transform duration-300 ${
                      active
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <div
              ref={searchRef}
              onClick={(event) => event.stopPropagation()}
              className="relative hidden md:block"
            >
              <form onSubmit={submitSearch}>
                <div
                  className={`admin-search flex items-center overflow-hidden rounded-full border transition-all duration-300 ${
                    searchOpen || search
                      ? "w-[360px] border-[var(--mn-border-strong)] bg-[var(--mn-surface)] shadow-[var(--mn-shadow-sm)]"
                      : "w-10 border-transparent bg-[var(--mn-control-bg)]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={openSearch}
                    aria-label="Open admin search"
                    className="flex h-10 w-10 shrink-0 items-center justify-center text-[var(--mn-text-secondary)] hover:text-[var(--mn-text)]"
                  >
                    🔎
                  </button>

                  {(searchOpen || search) && (
                    <>
                      <input
                        ref={searchInputRef}
                        value={search}
                        onChange={(event) => {
                          setSearch(event.target.value);
                          setSearchOpen(true);
                        }}
                        onFocus={() => setSearchOpen(true)}
                        placeholder="Search orders, products, customers..."
                        className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm outline-none placeholder:text-[var(--mn-text-muted)]"
                        aria-label="Search admin"
                      />

                      {search && (
                        <button
                          type="button"
                          onClick={() => setSearch("")}
                          className="px-2 text-[var(--mn-text-muted)] hover:text-[var(--mn-text)]"
                          aria-label="Clear search"
                        >
                          ×
                        </button>
                      )}
                    </>
                  )}
                </div>
              </form>

              {searchOpen && (search.trim() || loading) && (
                <div className="absolute right-0 top-[calc(100%+10px)] w-[min(420px,calc(100vw-2rem))] overflow-hidden rounded-[20px] border border-[var(--mn-border)] bg-[var(--mn-surface)] shadow-[var(--mn-shadow-lg)]">
                  <div className="flex gap-1 overflow-x-auto border-b border-[var(--mn-border)] p-2">
                    {searchCategories.map((category) => (
                      <button
                        key={category.value}
                        type="button"
                        onClick={() => setSearchCategory(category.value)}
                        className={`rounded-full px-3 py-1.5 text-xs transition ${
                          searchCategory === category.value
                            ? "bg-[var(--mn-text)] text-[var(--mn-text-inverse)]"
                            : "text-[var(--mn-text-secondary)] hover:bg-[var(--mn-control-bg)] hover:text-[var(--mn-text)]"
                        }`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>

                  <div className="max-h-[520px] overflow-y-auto p-2">
                    {loading ? (
                      <div className="px-3 py-8 text-center text-sm text-neutral-500">
                        Searching…
                      </div>
                    ) : totalResults === 0 ? (
                      <div className="px-3 py-8 text-center text-sm text-neutral-500">
                        No results found.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {results.orders.length > 0 && (
                          <SearchSection title="Orders">
                            {results.orders.map((order) => (
                              <button
                                key={order.id}
                                type="button"
                                onClick={() => {
                                  router.push(
                                    `/admin/orders/${order.id}`,
                                  );
                                  setSearchOpen(false);
                                }}
                                className="w-full rounded-xl px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-900"
                              >
                                <div className="text-sm font-medium">
                                  {order.order_id}
                                </div>
                                <div className="text-xs text-neutral-500">
                                  {order.name} · {order.email}
                                </div>
                              </button>
                            ))}
                          </SearchSection>
                        )}

                        {results.products.length > 0 && (
                          <SearchSection title="Products">
                            {results.products.map((product) => (
                              <button
                                key={product.id}
                                type="button"
                                onClick={() => {
                                  router.push("/admin/products");
                                  setSearchOpen(false);
                                }}
                                className="w-full rounded-xl px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-900"
                              >
                                <div className="text-sm font-medium">
                                  {product.name}
                                </div>
                                <div className="text-xs text-neutral-500">
                                  ₹{product.price} · Stock {product.stock}
                                </div>
                              </button>
                            ))}
                          </SearchSection>
                        )}

                        {results.customers.length > 0 && (
                          <SearchSection title="Customers">
                            {results.customers.map((customer) => (
                              <button
                                key={
                                  customer.customer_id ||
                                  `${customer.email}-${customer.phone}`
                                }
                                type="button"
                                onClick={() => {
                                  router.push("/admin/customers");
                                  setSearchOpen(false);
                                }}
                                className="w-full rounded-xl px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-900"
                              >
                                <div className="text-sm font-medium">
                                  {customer.name || "Customer"}
                                </div>
                                <div className="text-xs text-neutral-500">
                                  {customer.email}
                                  {customer.phone
                                    ? ` · ${customer.phone}`
                                    : ""}
                                </div>
                              </button>
                            ))}
                          </SearchSection>
                        )}

                        {results.payments.length > 0 && (
                          <SearchSection title="Payments">
                            {results.payments.map((payment) => (
                              <button
                                key={payment.id}
                                type="button"
                                onClick={() => {
                                  router.push("/admin/payments");
                                  setSearchOpen(false);
                                }}
                                className="w-full rounded-xl px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-900"
                              >
                                <div className="text-sm font-medium">
                                  {payment.order_id}
                                </div>
                                <div className="text-xs text-neutral-500">
                                  ₹{payment.total} ·{" "}
                                  {payment.payment_status || "unknown"}
                                </div>
                              </button>
                            ))}
                          </SearchSection>
                        )}

                        {results.inbox.length > 0 && (
                          <SearchSection title="Inbox">
                            {results.inbox.map((message) => (
                              <button
                                key={message.id}
                                type="button"
                                onClick={() => {
                                  router.push("/admin/inbox");
                                  setSearchOpen(false);
                                }}
                                className="w-full rounded-xl px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-900"
                              >
                                <div className="truncate text-sm font-medium">
                                  {message.name}
                                </div>
                                <div className="truncate text-xs text-neutral-500">
                                  {message.message}
                                </div>
                              </button>
                            ))}
                          </SearchSection>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <AdminThemeSwitcher />

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                signOut();
              }}
              title={userEmail ? `Sign out (${userEmail})` : "Sign out"}
              className="hidden rounded-full border border-neutral-200 px-3 py-2 text-sm text-neutral-600 transition hover:border-neutral-400 hover:text-neutral-950 sm:block dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:text-white"
            >
              Sign out
            </button>


          </div>
        </div>

        {mobileOpen && (
          <div className="admin-mobile-nav border-t border-[var(--mn-border)] py-4 lg:hidden">
            <nav className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {navLinks.map((link) => {
                const active = isActive(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={(event) => {
                      event.stopPropagation();
                      setMobileOpen(false);
                    }}
                    aria-current={active ? "page" : undefined}
                    className={`admin-mobile-nav-link relative flex items-center gap-2 rounded-[14px] border px-3 py-3 text-sm transition-all ${
                      active
                        ? "border-[var(--mn-border-strong)] bg-[var(--mn-accent-soft)] font-semibold text-[var(--mn-text)]"
                        : "border-transparent text-[var(--mn-text-secondary)] hover:border-[var(--mn-border)] hover:bg-[var(--mn-control-bg)] hover:text-[var(--mn-text)]"
                    }`}
                  >
                    <span aria-hidden="true">{link.icon}</span>
                    <span>{link.label}</span>

                    <span
                      className={`absolute bottom-2 left-3 right-3 h-[2px] rounded-full bg-[var(--mn-accent)] transition-transform ${
                        active ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                signOut();
              }}
              className="mt-4 w-full rounded-[14px] border border-[var(--mn-border)] bg-[var(--mn-control-bg)] px-4 py-3 text-left text-sm font-medium text-[var(--mn-text-secondary)] transition hover:border-[var(--mn-border-strong)] hover:text-[var(--mn-text)]"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

function SearchSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
        {title}
      </div>
      <div className="space-y-0.5">{children}</div>
    </section>
  );
}

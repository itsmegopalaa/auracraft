"use client";

import { useEffect, useState } from "react";

type Settings = {
  environment: string;
  payments: {
    provider: string;
    currency: string;
    cod_enabled: boolean;
    razorpay_configured: boolean;
  };
  shipping: {
    provider: string;
    pickup_requires_admin: boolean;
    tracking_sync_enabled: boolean;
  };
  automation: {
    final_authority: string;
    destructive_actions_auto_execute: boolean;
    custom_cover_admin_approval: boolean;
    production_release_admin_approval: boolean;
  };
};

export default function SettingsClient() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setSettings(data.settings ?? null))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const Row = ({
    label,
    value,
  }: {
    label: string;
    value: string;
  }) => (
    <div className="flex flex-col gap-2 border-b border-zinc-100 py-4 last:border-0 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {value}
      </span>
    </div>
  );

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 dark:bg-zinc-950 sm:px-6 sm:py-8 md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
            MineNote Admin
          </p>

          <h1 className="mt-3 text-3xl font-bold text-zinc-950 dark:text-white">
            Settings
          </h1>

          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Operational configuration and automation authority. Secrets are
            intentionally never exposed here.
          </p>

          {loading || !settings ? (
            <div className="mt-8 rounded-2xl border border-zinc-200 p-6 text-sm text-zinc-500 dark:border-zinc-800">
              Loading configuration…
            </div>
          ) : (
            <div className="mt-8 space-y-5">
              <section className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
                <h2 className="font-semibold text-zinc-950 dark:text-white">
                  Store
                </h2>
                <Row label="Environment" value={settings.environment} />
                <Row label="Currency" value={settings.payments.currency} />
              </section>

              <section className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
                <h2 className="font-semibold text-zinc-950 dark:text-white">
                  Payments
                </h2>
                <Row label="Provider" value={settings.payments.provider} />
                <Row
                  label="Razorpay credentials"
                  value={settings.payments.razorpay_configured ? "Configured" : "Not configured"}
                />
                <Row
                  label="Cash on Delivery"
                  value={settings.payments.cod_enabled ? "Enabled" : "Disabled"}
                />
              </section>

              <section className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
                <h2 className="font-semibold text-zinc-950 dark:text-white">
                  Shipping
                </h2>
                <Row label="Provider" value={settings.shipping.provider} />
                <Row
                  label="Pickup authority"
                  value={
                    settings.shipping.pickup_requires_admin
                      ? "Admin approval required"
                      : "Automated"
                  }
                />
                <Row
                  label="Tracking sync"
                  value={
                    settings.shipping.tracking_sync_enabled
                      ? "Enabled"
                      : "Disabled"
                  }
                />
              </section>

              <section className="rounded-2xl border border-yellow-200 bg-yellow-50/50 p-5 dark:border-yellow-900/50 dark:bg-yellow-950/20">
                <h2 className="font-semibold text-zinc-950 dark:text-white">
                  Automation Authority
                </h2>
                <Row
                  label="Final authority"
                  value={settings.automation.final_authority}
                />
                <Row
                  label="Destructive actions"
                  value={
                    settings.automation.destructive_actions_auto_execute
                      ? "Automated"
                      : "Admin only"
                  }
                />
                <Row
                  label="Custom cover approval"
                  value={
                    settings.automation.custom_cover_admin_approval
                      ? "Admin approval required"
                      : "Automated"
                  }
                />
                <Row
                  label="Production release"
                  value={
                    settings.automation.production_release_admin_approval
                      ? "Admin approval required"
                      : "Automated"
                  }
                />
              </section>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

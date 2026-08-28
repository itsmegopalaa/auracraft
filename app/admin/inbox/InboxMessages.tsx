"use client";

import { useState } from "react";

type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
};

type Props = {
  messages: Message[];
};

export default function InboxMessages({ messages }: Props) {
  const [items, setItems] = useState(messages);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function toggleRead(message: Message) {
    setLoadingId(message.id);

    try {
      const response = await fetch(
        `/api/admin/inbox/${message.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_read: !message.is_read,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to update message.");
      }

      setItems((current) =>
        current.map((item) =>
          item.id === message.id
            ? {
                ...item,
                is_read: result.message.is_read,
                read_at: result.message.read_at,
              }
            : item
        )
      );
    } catch (error) {
      console.error("INBOX TOGGLE ERROR:", error);
      alert("Unable to update this message right now.");
    } finally {
      setLoadingId(null);
    }
  }

  const unreadCount = items.filter((item) => !item.is_read).length;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {items.length} total
        </span>

        <span className="rounded-full bg-yellow-100 px-3 py-1.5 text-sm font-semibold text-yellow-800">
          {unreadCount} unread
        </span>
      </div>

      {items.length > 0 ? (
        <section className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <div className="divide-y divide-zinc-100">
            {items.map((item) => (
              <article
                key={item.id}
                className={`p-5 transition ${
                  item.is_read ? "bg-white dark:bg-zinc-900" : "bg-yellow-50/40"
                }`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {item.name}
                      </h2>

                      {!item.is_read && (
                        <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-800">
                          New
                        </span>
                      )}
                    </div>

                    <a
                      href={`mailto:${item.email}`}
                      className="mt-1 block text-sm text-yellow-600 hover:underline"
                    >
                      {item.email}
                    </a>
                  </div>

                  <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
                    <time
                      dateTime={item.created_at}
                      className="text-xs text-zinc-500 dark:text-zinc-400"
                    >
                      {new Date(item.created_at).toLocaleString("en-IN")}
                    </time>

                    <button
                      type="button"
                      onClick={() => toggleRead(item)}
                      disabled={loadingId === item.id}
                      className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loadingId === item.id
                        ? "Updating..."
                        : item.is_read
                          ? "Mark as unread"
                          : "Mark as read"}
                    </button>
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-zinc-50 dark:bg-zinc-950 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                    {item.message}
                  </p>
                </div>

                {item.read_at && (
                  <p className="mt-3 text-xs text-zinc-400">
                    Read {new Date(item.read_at).toLocaleString("en-IN")}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-12 text-center">
          <div className="text-4xl">📭</div>

          <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Inbox is empty
          </h2>

          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Customer contact messages will appear here.
          </p>
        </div>
      )}
    </>
  );
}

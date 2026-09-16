"use client";

import { FormEvent, useState } from "react";
import Footer from "@/app/components/Footer";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          message,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result?.error || "Unable to send your message."
        );
      }

      setSuccess(
        "Your message has been sent successfully. We’ll get back to you soon. ❤️"
      );

      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Unable to send your message right now.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>

      <main className="min-h-screen bg-[var(--mn-bg)] px-6 py-24 text-[var(--mn-text)]">
        <section className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="inline-flex rounded-full border border-[var(--mn-accent)] bg-[var(--mn-accent-soft)] px-4 py-2 text-sm font-semibold text-[var(--mn-accent)]">
              ✨ Contact MineNote
            </p>

            <p className="mt-2 text-[15px] text-[var(--mn-text-secondary)]">
              MineNote — a brand by AuraCraft
            </p>

            <h1 className="mt-8 text-5xl font-extrabold md:text-7xl">
              Let&apos;s Build
              <br />
              <span className="text-[var(--mn-accent)]">
                Your Next Idea
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--mn-text-muted)]">
              Have a custom notebook idea, collaboration request or any
              question? Our team would love to hear from you.
            </p>
          </div>

          <div className="mt-16 grid gap-10 md:grid-cols-2">
            <div className="rounded-3xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-10 transition hover:border-[var(--mn-accent)]">
              <h2 className="text-3xl font-bold">
                Connect With Us
              </h2>

              <div className="mt-8 space-y-5 text-lg text-[var(--mn-text-muted)]">
                <p>📧 orders@minenote.in</p>

                <p>📱 MineNote</p>

                <p>🇮🇳 Crafted with passion in India</p>
              </div>

              <div className="mt-10 rounded-[1.5rem] border border-[var(--mn-border-strong)] bg-[var(--mn-bg)] p-5">
                <p className="font-bold text-[var(--mn-accent)]">
                  MineNote Promise
                </p>

                <p className="mt-2 text-[var(--mn-text-muted)]">
                  Premium designs. Meaningful pages. Ideas that deserve a
                  beautiful home.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-10">
              <h2 className="mb-8 text-3xl font-bold">
                Send Message
              </h2>

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your Name"
                  autoComplete="name"
                  className="w-full rounded-xl border border-[var(--mn-border-strong)] bg-[var(--mn-bg)] p-4 outline-none transition focus:border-[var(--mn-accent)]"
                />

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Your Email"
                  autoComplete="email"
                  className="w-full rounded-xl border border-[var(--mn-border-strong)] bg-[var(--mn-bg)] p-4 outline-none transition focus:border-[var(--mn-accent)]"
                />

                <textarea
                  required
                  maxLength={5000}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Your Message"
                  rows={6}
                  className="w-full resize-y rounded-xl border border-[var(--mn-border-strong)] bg-[var(--mn-bg)] p-4 outline-none transition focus:border-[var(--mn-accent)]"
                />

                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-sm text-red-200"
                  >
                    {error}
                  </div>
                )}

                {success && (
                  <div
                    role="status"
                    className="rounded-xl border border-[var(--mn-accent)] bg-[var(--mn-accent-soft)] p-4 text-sm text-[var(--mn-accent)]"
                  >
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-[var(--mn-accent)] py-4 font-bold text-[var(--mn-accent-contrast)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Sending Message..." : "Send Message →"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

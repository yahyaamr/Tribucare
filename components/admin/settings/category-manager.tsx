"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Loader2,
  Pencil,
  Plus,
  Tag,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategoryUsage } from "@/lib/cms/categories";

/**
 * Category management.
 *
 * Rename rewrites every post carrying the old name in the same operation, so
 * the blog can never end up showing two filter tabs for what is one category.
 *
 * Delete is deliberately two-step. The first click asks the server what the
 * category is attached to and shows the answer — including, specifically, the
 * posts for which it is the *only* category and which would therefore be left
 * uncategorised. Nothing is removed until that warning is confirmed.
 */
export function CategoryManager({ initial }: { initial: string[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initial);
  const [adding, setAdding] = useState("");
  const [editing, setEditing] = useState<{ from: string; to: string } | null>(null);
  const [confirming, setConfirming] = useState<{
    name: string;
    usage: CategoryUsage;
  } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function call(
    input: RequestInfo,
    init: RequestInit | undefined,
    key: string,
  ) {
    setBusy(key);
    setError("");
    const response = await fetch(input, init).catch(() => null);
    const body = await response?.json().catch(() => null);
    setBusy(null);
    return { ok: Boolean(response?.ok), status: response?.status ?? 0, body };
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!adding.trim()) return;

    const { ok, body } = await call(
      "/api/admin/categories",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: adding }),
      },
      "add",
    );

    if (!ok) return setError(body?.error ?? "Could not add that category.");
    setCategories(body.categories);
    setAdding("");
    router.refresh();
  }

  async function rename() {
    if (!editing) return;

    const { ok, body } = await call(
      "/api/admin/categories",
      {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ from: editing.from, to: editing.to }),
      },
      editing.from,
    );

    if (!ok) return setError(body?.error ?? "Could not rename that category.");
    setCategories(body.categories);
    setEditing(null);
    router.refresh();
  }

  /** First click: ask what it is attached to. */
  async function requestDelete(name: string) {
    const { ok, status, body } = await call(
      `/api/admin/categories?name=${encodeURIComponent(name)}`,
      { method: "DELETE" },
      name,
    );

    if (ok) {
      setCategories(body.categories);
      router.refresh();
      return;
    }

    // 409 with a usage report means "in use, confirm first"; anything else is
    // a genuine failure.
    if (status === 409 && body?.usage) {
      setConfirming({ name, usage: body.usage });
      return;
    }
    setError(body?.error ?? "Could not delete that category.");
  }

  /** Second click: do it, stripping the category from the affected posts. */
  async function confirmDelete() {
    if (!confirming) return;

    const { ok, body } = await call(
      `/api/admin/categories?name=${encodeURIComponent(confirming.name)}&force=true`,
      { method: "DELETE" },
      confirming.name,
    );

    if (!ok) return setError(body?.error ?? "Could not delete that category.");
    setCategories(body.categories);
    setConfirming(null);
    router.refresh();
  }

  return (
    <section className="card-surface overflow-hidden">
      <div className="border-b border-brand-100 bg-brand-50/50 px-5 py-3.5">
        <h2 className="font-display text-base font-semibold text-ink">
          Categories
        </h2>
        <p className="mt-0.5 text-xs text-ink-soft">
          These are the filter tabs on the blog. Renaming one updates every post
          using it.
        </p>
      </div>

      {error && (
        <p role="alert" className="border-b border-red-100 bg-red-50 px-5 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      <ul className="divide-y divide-brand-50">
        {categories.map((category) => {
          const isEditing = editing?.from === category;

          return (
            <li
              key={category}
              className="group flex items-center gap-3 px-5 py-2.5"
            >
              {isEditing ? (
                <>
                  <Tag className="size-4 shrink-0 text-brand-400" aria-hidden="true" />
                  <input
                    autoFocus
                    value={editing.to}
                    onChange={(e) =>
                      setEditing({ ...editing, to: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void rename();
                      if (e.key === "Escape") setEditing(null);
                    }}
                    className="flex-1 rounded-lg border border-brand-300 bg-white px-2.5 py-1.5 text-sm text-ink focus:border-brand-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={rename}
                    disabled={busy === category}
                    className="inline-flex size-8 items-center justify-center rounded-lg bg-brand-700 text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
                  >
                    {busy === category ? (
                      <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                    ) : (
                      <Check className="size-4" aria-hidden="true" />
                    )}
                    <span className="sr-only">Save</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="inline-flex size-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-brand-50"
                  >
                    <X className="size-4" aria-hidden="true" />
                    <span className="sr-only">Cancel</span>
                  </button>
                </>
              ) : (
                <>
                  <Tag className="size-4 shrink-0 text-brand-400" aria-hidden="true" />
                  <span className="flex-1 text-sm font-medium text-ink">
                    {category}
                  </span>

                  <div className="flex items-center gap-0.5 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:focus-within:opacity-100">
                    <button
                      type="button"
                      onClick={() => setEditing({ from: category, to: category })}
                      className="inline-flex size-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-brand-100 hover:text-brand-800"
                    >
                      <Pencil className="size-3.5" aria-hidden="true" />
                      <span className="sr-only">Rename {category}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => requestDelete(category)}
                      disabled={busy === category}
                      title={`Delete ${category}`}
                      className="inline-flex size-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                    >
                      {busy === category ? (
                        <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                      ) : (
                        <Trash2 className="size-3.5" aria-hidden="true" />
                      )}
                      <span className="sr-only">Delete {category}</span>
                    </button>
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>

      <form onSubmit={add} className="flex gap-2 border-t border-brand-100 px-5 py-3.5">
        <input
          value={adding}
          onChange={(e) => setAdding(e.target.value)}
          placeholder="New category name"
          className="flex-1 rounded-xl border border-brand-200/80 bg-white px-3.5 py-2 text-sm text-ink shadow-sm transition-colors placeholder:text-ink-faint focus:border-brand-600 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!adding.trim() || busy === "add"}
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-50"
        >
          {busy === "add" ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Plus className="size-4" aria-hidden="true" />
          )}
          Add
        </button>
      </form>

      {confirming && (
        <DeleteWarning
          title={`Delete “${confirming.name}”?`}
          busy={busy === confirming.name}
          onCancel={() => setConfirming(null)}
          onConfirm={confirmDelete}
          lead={
            <>
              It is used by{" "}
              <strong className="font-semibold">
                {confirming.usage.posts.length} post
                {confirming.usage.posts.length === 1 ? "" : "s"}
              </strong>
              . Deleting removes it from{" "}
              {confirming.usage.posts.length === 1 ? "that post" : "them"} — the{" "}
              {confirming.usage.posts.length === 1 ? "post itself is" : "posts themselves are"}{" "}
              not deleted.
            </>
          }
          warning={
            confirming.usage.orphanCount > 0 ? (
              <>
                <strong className="font-semibold">
                  {confirming.usage.orphanCount} post
                  {confirming.usage.orphanCount === 1 ? "" : "s"} will be left
                  with no category at all
                </strong>{" "}
                — marked below. Uncategorised posts still appear under &ldquo;All
                Articles&rdquo;, but under no filter tab.
              </>
            ) : null
          }
          rows={confirming.usage.posts.map((post) => ({
            id: post.id,
            title: post.title,
            status: post.status,
            flagged: post.onlyCategory,
            flagLabel: "will have no category",
          }))}
        />
      )}
    </section>
  );
}

/**
 * The confirmation sheet shared by both managers.
 *
 * It lists the actual posts rather than just a count, because "3 posts will be
 * affected" is not enough information to decide with — and flags the ones that
 * lose something entirely.
 */
export function DeleteWarning({
  title,
  lead,
  warning,
  rows,
  busy,
  onCancel,
  onConfirm,
}: {
  title: string;
  lead: React.ReactNode;
  warning?: React.ReactNode;
  rows: {
    id: string;
    title: string;
    status: string;
    flagged: boolean;
    flagLabel: string;
  }[];
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cancel"
        onClick={onCancel}
        className="absolute inset-0 bg-brand-950/60 backdrop-blur-sm"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex max-h-[85vh] w-full max-w-lg flex-col rounded-3xl bg-white p-6 shadow-2xl"
      >
        <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{lead}</p>

        {warning && (
          <div className="mt-3 flex gap-2.5 rounded-xl border border-signal-500/40 bg-signal-500/10 p-3.5">
            <TriangleAlert
              className="mt-0.5 size-4 shrink-0 text-signal-600"
              aria-hidden="true"
            />
            <p className="text-sm leading-relaxed text-ink">{warning}</p>
          </div>
        )}

        <ul className="mt-4 min-h-0 flex-1 space-y-1 overflow-y-auto rounded-xl border border-brand-100 p-2">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "size-1.5 shrink-0 rounded-full",
                  row.flagged ? "bg-signal-500" : "bg-brand-300",
                )}
              />
              <span className="min-w-0 flex-1 truncate text-ink">
                {row.title}
              </span>
              {row.status === "draft" && (
                <span className="shrink-0 text-[0.625rem] font-semibold tracking-wide text-ink-faint uppercase">
                  Draft
                </span>
              )}
              {row.flagged && (
                <span className="shrink-0 text-[0.6875rem] font-medium text-signal-600">
                  {row.flagLabel}
                </span>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-brand-200 px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-brand-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            Delete anyway
          </button>
        </div>
      </div>
    </div>
  );
}

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
  X,
} from "lucide-react";
import type { NewsTagUsage } from "@/lib/cms/news-tags";
import { DeleteWarning } from "./category-manager";

/**
 * News tag management.
 *
 * `CategoryManager` for the news vocabulary, and deliberately its own component
 * rather than the same one pointed at a different endpoint: nothing in this
 * file can address `/api/admin/categories`, so a news tag edit has no path to
 * the blog's data even by mistake. That is the isolation the panel promises,
 * expressed as structure rather than as a runtime check.
 *
 * Rename rewrites every news item carrying the old name in the same operation,
 * so /news can never end up showing two filter tabs for one tag. Delete is
 * two-step for the same reason it is on categories — the first click asks the
 * server what the tag is attached to and shows the answer, including the items
 * that would be left untagged.
 *
 * The confirmation sheet is imported from the category manager rather than
 * copied: it is presentation with no knowledge of either content type, and one
 * of the two files has to own it.
 */
export function NewsTagManager({ initial }: { initial: string[] }) {
  const router = useRouter();
  const [tags, setTags] = useState(initial);
  const [adding, setAdding] = useState("");
  const [editing, setEditing] = useState<{ from: string; to: string } | null>(
    null,
  );
  const [confirming, setConfirming] = useState<{
    name: string;
    usage: NewsTagUsage;
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
      "/api/admin/news-tags",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: adding }),
      },
      "add",
    );

    if (!ok) return setError(body?.error ?? "Could not add that tag.");
    setTags(body.tags);
    setAdding("");
    router.refresh();
  }

  async function rename() {
    if (!editing) return;

    const { ok, body } = await call(
      "/api/admin/news-tags",
      {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ from: editing.from, to: editing.to }),
      },
      editing.from,
    );

    if (!ok) return setError(body?.error ?? "Could not rename that tag.");
    setTags(body.tags);
    setEditing(null);
    router.refresh();
  }

  /** First click: ask what it is attached to. */
  async function requestDelete(name: string) {
    const { ok, status, body } = await call(
      `/api/admin/news-tags?name=${encodeURIComponent(name)}`,
      { method: "DELETE" },
      name,
    );

    if (ok) {
      setTags(body.tags);
      router.refresh();
      return;
    }

    // 409 with a usage report means "in use, confirm first"; anything else is
    // a genuine failure.
    if (status === 409 && body?.usage) {
      setConfirming({ name, usage: body.usage });
      return;
    }
    setError(body?.error ?? "Could not delete that tag.");
  }

  /** Second click: do it, stripping the tag from the affected items. */
  async function confirmDelete() {
    if (!confirming) return;

    const { ok, body } = await call(
      `/api/admin/news-tags?name=${encodeURIComponent(confirming.name)}&force=true`,
      { method: "DELETE" },
      confirming.name,
    );

    if (!ok) return setError(body?.error ?? "Could not delete that tag.");
    setTags(body.tags);
    setConfirming(null);
    router.refresh();
  }

  return (
    <section className="card-surface overflow-hidden">
      <div className="border-b border-brand-100 bg-brand-50/50 px-5 py-3.5">
        <h2 className="font-display text-base font-semibold text-ink">
          News tags
        </h2>
        <p className="mt-0.5 text-xs text-ink-soft">
          The filter tabs on the news page. Renaming one updates every news item
          using it. These are separate from the blog&rsquo;s categories above —
          editing them affects the news page only.
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="border-b border-red-100 bg-red-50 px-5 py-2.5 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {tags.length === 0 ? (
        <p className="px-5 py-6 text-center text-sm text-ink-faint">
          No news tags yet. Add one below, or create tags as you write from the
          news editor.
        </p>
      ) : (
        <ul className="divide-y divide-brand-50">
          {tags.map((tag) => {
            const isEditing = editing?.from === tag;

            return (
              <li key={tag} className="group flex items-center gap-3 px-5 py-2.5">
                {isEditing ? (
                  <>
                    <Tag
                      className="size-4 shrink-0 text-brand-400"
                      aria-hidden="true"
                    />
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
                      disabled={busy === tag}
                      className="inline-flex size-8 items-center justify-center rounded-lg bg-brand-700 text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
                    >
                      {busy === tag ? (
                        <Loader2
                          className="size-3.5 animate-spin"
                          aria-hidden="true"
                        />
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
                    <Tag
                      className="size-4 shrink-0 text-brand-400"
                      aria-hidden="true"
                    />
                    <span className="flex-1 text-sm font-medium text-ink">
                      {tag}
                    </span>

                    <div className="flex items-center gap-0.5 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:focus-within:opacity-100">
                      <button
                        type="button"
                        onClick={() => setEditing({ from: tag, to: tag })}
                        className="inline-flex size-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-brand-100 hover:text-brand-800"
                      >
                        <Pencil className="size-3.5" aria-hidden="true" />
                        <span className="sr-only">Rename {tag}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => requestDelete(tag)}
                        disabled={busy === tag}
                        title={`Delete ${tag}`}
                        className="inline-flex size-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                      >
                        {busy === tag ? (
                          <Loader2
                            className="size-3.5 animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <Trash2 className="size-3.5" aria-hidden="true" />
                        )}
                        <span className="sr-only">Delete {tag}</span>
                      </button>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <form
        onSubmit={add}
        className="flex gap-2 border-t border-brand-100 px-5 py-3.5"
      >
        <input
          value={adding}
          onChange={(e) => setAdding(e.target.value)}
          placeholder="New tag name"
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
                {confirming.usage.items.length} news item
                {confirming.usage.items.length === 1 ? "" : "s"}
              </strong>
              . Deleting removes it from{" "}
              {confirming.usage.items.length === 1 ? "that item" : "them"} — the{" "}
              {confirming.usage.items.length === 1
                ? "item itself is"
                : "items themselves are"}{" "}
              not deleted.
            </>
          }
          warning={
            confirming.usage.orphanCount > 0 ? (
              <>
                <strong className="font-semibold">
                  {confirming.usage.orphanCount} item
                  {confirming.usage.orphanCount === 1 ? "" : "s"} will be left
                  with no tag at all
                </strong>{" "}
                — marked below. Untagged items still appear under &ldquo;All
                News&rdquo;, but under no filter tab.
              </>
            ) : null
          }
          rows={confirming.usage.items.map((item) => ({
            id: item.id,
            title: item.title,
            status: item.status,
            flagged: item.onlyTag,
            flagLabel: "will have no tag",
          }))}
        />
      )}
    </section>
  );
}

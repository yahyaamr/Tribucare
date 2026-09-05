"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, Loader2, Plus, Search, Tag, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Multi-select news tags, with inline creation.
 *
 * `components/admin/category-select.tsx` pointed at the news vocabulary: same
 * chips, same filter field, same inline "Create" row. It is a separate
 * component rather than a shared one parameterised by endpoint, for the same
 * reason `news-tags.ts` is a separate module from `categories.ts` — the one
 * thing this must never do is write to the blog's category list, and the way
 * to guarantee that is to give it no way to address it.
 *
 * The first selected tag is the primary one: it is what shows wherever there
 * is only room for a single badge, so the chip row labels it.
 */
export function NewsTagSelect({
  selected,
  available,
  onChange,
  onTagsChange,
}: {
  selected: string[];
  available: string[];
  onChange: (tags: string[]) => void;
  /** Lets the editor keep its own copy of the list in step after a create. */
  onTagsChange: (tags: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  // Clicking away closes the list. Pointerdown rather than click so it fires
  // before a focus change inside the panel re-opens it.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const trimmed = query.trim().replace(/\s+/g, " ");

  const matches = useMemo(() => {
    const q = trimmed.toLowerCase();
    return available.filter((t) => !q || t.toLowerCase().includes(q));
  }, [available, trimmed]);

  /** Only offer creation when the typed name isn't already a tag — matched
   *  case-insensitively, so "product launch" doesn't create a duplicate of
   *  "Product Launch". */
  const canCreate =
    trimmed.length > 0 &&
    !available.some((t) => t.toLowerCase() === trimmed.toLowerCase());

  function toggle(tag: string) {
    setError("");
    onChange(
      selected.includes(tag)
        ? selected.filter((t) => t !== tag)
        : [...selected, tag],
    );
  }

  async function create() {
    if (!canCreate || creating) return;
    setCreating(true);
    setError("");

    const response = await fetch("/api/admin/news-tags", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    }).catch(() => null);

    const body = await response?.json().catch(() => null);

    if (!response?.ok) {
      setError(body?.error ?? "Could not create that tag.");
      setCreating(false);
      return;
    }

    onTagsChange(body.tags as string[]);
    // The server returns the canonical spelling, which may differ in case from
    // what was typed if it already existed.
    if (!selected.includes(body.tag)) {
      onChange([...selected, body.tag as string]);
    }
    setQuery("");
    setCreating(false);
  }

  return (
    <div ref={rootRef} className="relative">
      {selected.length > 0 && (
        <ul className="mb-2.5 flex flex-wrap gap-1.5">
          {selected.map((tag, i) => (
            <li key={tag}>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg py-1 pe-1 ps-2.5 text-xs font-semibold",
                  i === 0
                    ? "bg-brand-700 text-white"
                    : "bg-brand-50 text-brand-800",
                )}
              >
                {tag}
                <button
                  type="button"
                  onClick={() => toggle(tag)}
                  className={cn(
                    "inline-flex size-4.5 items-center justify-center rounded transition-colors",
                    i === 0
                      ? "text-brand-200 hover:bg-white/15 hover:text-white"
                      : "text-brand-600 hover:bg-brand-100 hover:text-brand-900",
                  )}
                >
                  <X className="size-3" aria-hidden="true" />
                  <span className="sr-only">Remove {tag}</span>
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      {selected.length > 1 && (
        <p className="mb-2.5 text-xs text-ink-faint">
          <strong className="font-semibold text-ink-soft">{selected[0]}</strong>{" "}
          is the primary tag — it is the one shown on the news card.
          Remove and re-add to change the order.
        </p>
      )}

      <div className="relative">
        <Search
          className="absolute top-1/2 start-3 size-3.5 -translate-y-1/2 text-ink-faint"
          aria-hidden="true"
        />
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              // Enter picks the single obvious match, otherwise creates.
              if (matches.length === 1 && !canCreate) toggle(matches[0]);
              else if (canCreate) void create();
            }
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder={
            selected.length ? "Add another tag…" : "Search or create…"
          }
          className="w-full rounded-xl border border-brand-200/80 bg-white py-2.5 pe-4 ps-9 text-sm text-ink shadow-sm transition-colors placeholder:text-ink-faint focus:border-brand-600 focus:outline-none"
        />
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}

      {open && (
        <div
          id={listId}
          className="mt-1.5 max-h-56 overflow-y-auto rounded-xl border border-brand-200 bg-white p-1 shadow-lg"
        >
          {matches.length === 0 && !canCreate && (
            <p className="px-2.5 py-3 text-center text-xs text-ink-faint">
              No tags yet.
            </p>
          )}

          <ul>
            {matches.map((tag) => {
              const isSelected = selected.includes(tag);
              return (
                <li key={tag}>
                  <button
                    type="button"
                    onClick={() => toggle(tag)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-start text-sm transition-colors",
                      isSelected
                        ? "font-medium text-brand-800"
                        : "text-ink-soft hover:bg-brand-50",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
                        isSelected
                          ? "border-brand-700 bg-brand-700 text-white"
                          : "border-brand-300",
                      )}
                    >
                      {isSelected && (
                        <Check className="size-3" aria-hidden="true" />
                      )}
                    </span>
                    <Tag className="size-3.5 shrink-0 text-brand-400" aria-hidden="true" />
                    {tag}
                  </button>
                </li>
              );
            })}
          </ul>

          {canCreate && (
            <button
              type="button"
              onClick={create}
              disabled={creating}
              className="mt-1 flex w-full items-center gap-2 rounded-lg border-t border-brand-50 px-2.5 py-2 text-start text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50 disabled:opacity-60"
            >
              {creating ? (
                <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden="true" />
              ) : (
                <Plus className="size-4 shrink-0" aria-hidden="true" />
              )}
              Create &ldquo;{trimmed}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  );
}

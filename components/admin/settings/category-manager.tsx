"use client";

import { useAdminApi } from "@/components/admin/base-path";

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
import { fill, useAdminStrings } from "@/components/admin/strings";
import type { Category, CategoryUsage } from "@/lib/cms/categories";
import {
  LOCALES,
  LOCALE_LABELS,
  localePath,
  type Locale,
} from "@/lib/i18n/config";
import {
  slugifyTaxonomy,
  slugifyTaxonomyDraft,
  taxonomyPath,
} from "@/lib/cms/format";

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
 *
 * Every category belongs to one language site, and the row says which: the
 * editor only offers a post the categories of the language it is written in,
 * so a category filed under the wrong one is invisible where it was meant to
 * be used. A name may be taken only once across both — two identical rows
 * here would rename and delete differently with nothing to tell them apart.
 */
export function CategoryManager({ initial }: { initial: Category[] }) {
  const api = useAdminApi();
  const router = useRouter();
  const t = useAdminStrings();
  const st = t.settings;
  const [categories, setCategories] = useState(initial);
  const [adding, setAdding] = useState<TaxonomyDraft>(BLANK);
  const [addingLocale, setAddingLocale] = useState<Locale>(LOCALES[0]);
  const [editing, setEditing] = useState<
    { from: string; draft: TaxonomyDraft } | null
  >(null);
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

  /** Moves a category to the other language site. The name — and so every
   *  post filed under it — is untouched; only which editor offers it moves. */
  async function move(category: string, locale: Locale) {
    const { ok, body } = await call(
      api("/categories"),
      {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ from: category, locale }),
      },
      category,
    );

    if (!ok) return setError(body?.error ?? st.moveFailed);
    setCategories(body.categories);
    router.refresh();
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!adding.name.trim()) return;

    const { ok, body } = await call(
      api("/categories"),
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: adding.name,
          locale: addingLocale,
          slug: adding.slug,
        }),
      },
      "add",
    );

    if (!ok) return setError(body?.error ?? st.addFailed);
    setCategories(body.categories);
    setAdding(BLANK);
    router.refresh();
  }

  /** Name and both notes in one request — see the route's PUT, which applies
   *  the rename first so the notes land on the record it settled on. */
  async function save() {
    if (!editing) return;

    const { ok, body } = await call(
      api("/categories"),
      {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          from: editing.from,
          to: editing.draft.name,
          slug: editing.draft.slug,
        }),
      },
      editing.from,
    );

    if (!ok) return setError(body?.error ?? st.renameFailed);
    setCategories(body.categories);
    setEditing(null);
    router.refresh();
  }

  /** First click: ask what it is attached to. */
  async function requestDelete(name: string) {
    const { ok, status, body } = await call(
      api(`/categories?name=${encodeURIComponent(name)}`),
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
    setError(body?.error ?? st.deleteFailed);
  }

  /** Second click: do it, stripping the category from the affected posts. */
  async function confirmDelete() {
    if (!confirming) return;

    const { ok, body } = await call(
      api(`/categories?name=${encodeURIComponent(confirming.name)}&force=true`),
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
          {st.categoriesTitle}
        </h2>
        <p className="mt-0.5 text-xs text-ink-soft">
          {st.categoriesIntro}
        </p>
      </div>

      {error && (
        <p role="alert" className="border-b border-red-100 bg-red-50 px-5 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      <ul className="divide-y divide-brand-50">
        {categories.map(({ name: category, locale, slug }) => {
          const isEditing = editing?.from === category;
          const dir = locale === "ar" ? "rtl" : "ltr";

          return (
            <li
              key={category}
              className={cn(
                "group flex gap-3 px-5 py-2.5",
                isEditing ? "items-start" : "items-center",
              )}
            >
              {isEditing ? (
                <>
                  <Tag
                    className="mt-6 size-4 shrink-0 text-brand-400"
                    aria-hidden="true"
                  />
                  <TaxonomyEditor
                    draft={editing.draft}
                    original={slug}
                    locale={locale}
                    basePath="/blogs"
                    busy={busy === category}
                    onChange={(draft) => setEditing({ ...editing, draft })}
                    onSave={save}
                    onCancel={() => setEditing(null)}
                  />
                </>
              ) : (
                <>
                  <Tag className="size-4 shrink-0 text-brand-400" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span
                      dir={dir}
                      className="block truncate text-sm font-medium text-ink"
                    >
                      {category}
                    </span>
                    <TaxonomyPermalink slug={slug} locale={locale} basePath="/blogs" />
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      void move(category, locale === "ar" ? LOCALES[0] : "ar")
                    }
                    disabled={busy === category}
                    title={fill(st.moveToNamed, {
                      label:
                        locale === "ar"
                          ? LOCALE_LABELS[LOCALES[0]]
                          : LOCALE_LABELS.ar,
                    })}
                    className="shrink-0 self-center rounded-md border border-brand-200/60 bg-brand-50 px-2 py-0.5 text-[0.6875rem] font-semibold text-brand-800 transition-colors hover:border-brand-300 hover:bg-brand-100 disabled:opacity-50"
                  >
                    {LOCALE_LABELS[locale]}
                  </button>

                  <div className="flex shrink-0 items-center gap-0.5 self-center opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:focus-within:opacity-100">
                    <button
                      type="button"
                      onClick={() =>
                        setEditing({
                          from: category,
                          draft: { name: category, slug },
                        })
                      }
                      className="inline-flex size-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-brand-100 hover:text-brand-800"
                    >
                      <Pencil className="size-3.5" aria-hidden="true" />
                      <span className="sr-only">
                        {fill(st.renameNamed, { name: category })}
                      </span>
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
                      <span className="sr-only">
                        {fill(st.deleteNamed, { name: category })}
                      </span>
                    </button>
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>

      <TaxonomyAdder
        draft={adding}
        locale={addingLocale}
        basePath="/blogs"
        namePlaceholder={st.newCategoryName}
        busy={busy === "add"}
        onChange={setAdding}
        onLocaleChange={setAddingLocale}
        onSubmit={add}
      />

      {confirming && (
        <DeleteWarning
          title={fill(st.confirmDeleteTitle, { name: confirming.name })}
          busy={busy === confirming.name}
          onCancel={() => setConfirming(null)}
          onConfirm={confirmDelete}
          lead={
            confirming.usage.posts.length === 1
              ? st.usedByOnePost
              : fill(st.usedByPosts, { n: confirming.usage.posts.length })
          }
          warning={
            confirming.usage.orphanCount === 0
              ? null
              : confirming.usage.orphanCount === 1
                ? st.orphanOnePost
                : fill(st.orphanPosts, { n: confirming.usage.orphanCount })
          }
          rows={confirming.usage.posts.map((post) => ({
            id: post.id,
            title: post.title,
            status: post.status,
            flagged: post.onlyCategory,
            flagLabel: st.flagNoCategory,
          }))}
        />
      )}
    </section>
  );
}

/** The two fields an edit or add row holds. Shared so both managers' state,
 *  their request bodies and both forms all describe the same record. */
export interface TaxonomyDraft {
  name: string;
  slug: string;
}

/** A frozen empty draft, so resetting the add row after a successful create is
 *  one reference rather than two literals in two files. */
export const BLANK: TaxonomyDraft = Object.freeze({ name: "", slug: "" });

/** Which public index a manager's rows belong to. Decides what a permalink
 *  preview reads, and nothing else — the two lists still have no path to each
 *  other's endpoint. */
export type TaxonomyBase = "/blogs" | "/events";

/**
 * The edit form shared by both managers.
 *
 * A row used to become a single input, because a row was a single name. It now
 * carries its permalink as well, so editing opens a small stacked form — and
 * the permalink field says, right beside it, that changing it moves the page.
 * The name and the slug have opposite consequences: a rename keeps every link
 * working, a moved slug breaks every link to the old address. The form does
 * not hide that behind a matching pair of boxes.
 *
 * Imported by `news-tag-manager.tsx` rather than copied, on the same grounds
 * as `DeleteWarning` below: it is presentation with no knowledge of either
 * content type, it cannot address an endpoint, and one of the two files has to
 * own it.
 */
export function TaxonomyEditor({
  draft,
  original,
  locale,
  basePath,
  busy,
  onChange,
  onSave,
  onCancel,
}: {
  draft: TaxonomyDraft;
  /** The slug the row had when editing opened, so the warning shows only once
   *  the permalink has actually been changed. */
  original: string;
  /** The language the record belongs to — its name runs that way, and its
   *  page lives under that language's site. The panel's chrome is unaffected. */
  locale: Locale;
  basePath: TaxonomyBase;
  busy: boolean;
  onChange: (draft: TaxonomyDraft) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const t = useAdminStrings();
  const st = t.settings;
  const dir = locale === "ar" ? "rtl" : "ltr";

  // Enter saves from either field; Escape abandons from anywhere.
  const keys = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onSave();
    }
    if (event.key === "Escape") onCancel();
  };

  const field =
    "w-full rounded-lg border border-brand-200 bg-white px-2.5 py-1.5 text-sm text-ink transition-colors placeholder:text-ink-faint focus:border-brand-600 focus:outline-none";
  const label =
    "mb-1 block text-[0.625rem] font-semibold tracking-wide text-ink-faint uppercase";

  const moved = slugifyTaxonomy(draft.slug) !== original;

  return (
    <div className="flex-1 space-y-2.5">
      <div>
        <label className={label}>{st.nameLabel}</label>
        <input
          autoFocus
          dir={dir}
          value={draft.name}
          onChange={(e) => onChange({ ...draft, name: e.target.value })}
          onKeyDown={keys}
          className={cn(field, "border-brand-300 font-medium")}
        />
      </div>

      <div>
        <label className={label}>{st.permalinkLabel}</label>
        {/* The slug is typed into a Latin-direction field even for an Arabic
            category: it is an address, and an address reads left to right in
            the location bar regardless of the letters in it. */}
        <div className="flex items-center gap-1.5">
          <span
            dir="ltr"
            className="shrink-0 font-mono text-[0.6875rem] text-ink-faint"
          >
            {localePath(locale, basePath)}/
          </span>
          <input
            dir="ltr"
            value={draft.slug}
            placeholder={st.permalinkPlaceholder}
            onChange={(e) =>
              onChange({ ...draft, slug: slugifyTaxonomyDraft(e.target.value) })
            }
            onBlur={(e) =>
              onChange({ ...draft, slug: slugifyTaxonomy(e.target.value) })
            }
            onKeyDown={keys}
            className={cn(field, "font-mono text-xs")}
          />
        </div>
        <p
          className={cn(
            "mt-1 text-[0.6875rem] leading-relaxed",
            moved ? "font-medium text-signal-600" : "text-ink-faint",
          )}
        >
          {moved ? st.permalinkMoved : st.permalinkHint}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
        >
          {busy ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Check className="size-3.5" aria-hidden="true" />
          )}
          {t.common.save}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-ink-faint transition-colors hover:bg-brand-50 hover:text-ink"
        >
          <X className="size-3.5" aria-hidden="true" />
          {t.common.cancel}
        </button>
      </div>
    </div>
  );
}

/**
 * The add form shared by both managers.
 *
 * The language control and the name keep the line they always had, so the
 * common case — type a name, press Add — is unchanged; the permalink sits on a
 * second line and is optional. Left empty, the server makes one from the name,
 * and the placeholder shows exactly what that will be, so nobody has to type a
 * slug just to find out what they would have got.
 *
 * `onSubmit` is the form's, not a button's, so Enter from either field adds.
 */
export function TaxonomyAdder({
  draft,
  locale,
  basePath,
  namePlaceholder,
  busy,
  onChange,
  onLocaleChange,
  onSubmit,
}: {
  draft: TaxonomyDraft;
  locale: Locale;
  basePath: TaxonomyBase;
  namePlaceholder: string;
  busy: boolean;
  onChange: (draft: TaxonomyDraft) => void;
  onLocaleChange: (locale: Locale) => void;
  onSubmit: (event: React.FormEvent) => void;
}) {
  const t = useAdminStrings();
  const st = t.settings;
  const dir = locale === "ar" ? "rtl" : "ltr";

  const field =
    "w-full rounded-xl border border-brand-200/80 bg-white px-3.5 py-2 text-sm text-ink shadow-sm transition-colors placeholder:text-ink-faint focus:border-brand-600 focus:outline-none";

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-2 border-t border-brand-100 px-5 py-3.5"
    >
      <div className="flex flex-wrap gap-2">
        {/* Which site the new shelf goes on. The same segmented control the
            editor uses for Edit / Preview. */}
        <div className="flex shrink-0 rounded-xl bg-brand-50 p-0.5">
          {LOCALES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onLocaleChange(option)}
              aria-pressed={locale === option}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-200",
                locale === option
                  ? "bg-white text-brand-800 shadow-sm"
                  : "text-ink-faint hover:text-ink",
              )}
            >
              {LOCALE_LABELS[option]}
            </button>
          ))}
        </div>
        <input
          value={draft.name}
          dir={dir}
          onChange={(e) => onChange({ ...draft, name: e.target.value })}
          placeholder={namePlaceholder}
          className={cn(field, "min-w-40 flex-1")}
        />
        <button
          type="submit"
          disabled={!draft.name.trim() || busy}
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Plus className="size-4" aria-hidden="true" />
          )}
          {t.common.add}
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <span
          dir="ltr"
          className="shrink-0 font-mono text-[0.6875rem] text-ink-faint"
        >
          {localePath(locale, basePath)}/
        </span>
        <input
          dir="ltr"
          value={draft.slug}
          placeholder={slugifyTaxonomy(draft.name) || st.permalinkPlaceholder}
          onChange={(e) =>
            onChange({ ...draft, slug: slugifyTaxonomyDraft(e.target.value) })
          }
          onBlur={(e) =>
            onChange({ ...draft, slug: slugifyTaxonomy(e.target.value) })
          }
          aria-label={st.permalinkLabel}
          className={cn(field, "font-mono text-xs")}
        />
      </div>
    </form>
  );
}

/**
 * What a row shows under its name when it is not being edited: the address
 * of its page, as a working link. The notes were only useful if visible
 * without clicking Edit, and a permalink is only useful if it can be copied.
 */
export function TaxonomyPermalink({
  slug,
  locale,
  basePath,
}: {
  slug: string;
  locale: Locale;
  basePath: TaxonomyBase;
}) {
  return (
    <a
      href={localePath(locale, taxonomyPath(basePath, slug))}
      target="_blank"
      rel="noreferrer"
      dir="ltr"
      className="mt-0.5 block truncate font-mono text-[0.6875rem] text-ink-faint transition-colors hover:text-brand-700 hover:underline"
    >
      {/* Shown decoded — an Arabic slug reads as its letters here, and the
          browser encodes the href on the way out. */}
      {localePath(locale, `${basePath}/${slug}`)}
    </a>
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
  const t = useAdminStrings();
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={t.common.cancel}
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
                  {t.status.draft}
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
            {t.common.cancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {t.settings.deleteAnyway}
          </button>
        </div>
      </div>
    </div>
  );
}

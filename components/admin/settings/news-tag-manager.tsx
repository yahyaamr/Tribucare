"use client";

import { useAdminApi } from "@/components/admin/base-path";
import { fill, useAdminStrings } from "@/components/admin/strings";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Tag, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NewsTag, NewsTagUsage } from "@/lib/cms/news-tags";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/config";
import {
  BLANK,
  DeleteWarning,
  TaxonomyAdder,
  TaxonomyEditor,
  TaxonomyPermalink,
  type TaxonomyDraft,
} from "./category-manager";

/**
 * News tag management.
 *
 * `CategoryManager` for the news vocabulary, and deliberately its own component
 * rather than the same one pointed at a different endpoint: nothing in this
 * file can address the categories API, so a news tag edit has no path to
 * the blog's data even by mistake. That is the isolation the panel promises,
 * expressed as structure rather than as a runtime check.
 *
 * Rename rewrites every news item carrying the old name in the same operation,
 * so /news can never end up showing two filter tabs for one tag. Delete is
 * two-step for the same reason it is on categories — the first click asks the
 * server what the tag is attached to and shows the answer, including the items
 * that would be left untagged.
 *
 * The confirmation sheet and the edit form are imported from the category
 * manager rather than copied: both are presentation with no knowledge of
 * either content type — neither can address an endpoint — and one of the two
 * files has to own them.
 *
 * Every tag belongs to one language site, and the row says which, on exactly
 * the reasoning categories follow: the editor only offers an item the tags of
 * the language it is written in, so a tag filed under the wrong one is
 * invisible where it was meant to be used. A name may be taken only once
 * across both.
 */
export function NewsTagManager({ initial }: { initial: NewsTag[] }) {
  const api = useAdminApi();
  const router = useRouter();
  const t = useAdminStrings();
  const st = t.settings;
  const [tags, setTags] = useState(initial);
  const [adding, setAdding] = useState<TaxonomyDraft>(BLANK);
  const [addingLocale, setAddingLocale] = useState<Locale>(LOCALES[0]);
  const [editing, setEditing] = useState<
    { from: string; draft: TaxonomyDraft } | null
  >(null);
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
    if (!adding.name.trim()) return;

    const { ok, body } = await call(
      api("/news-tags"),
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
    setTags(body.tags);
    setAdding(BLANK);
    router.refresh();
  }

  /** Moves a tag to the other language site. The name — and so every item
   *  filed under it — is untouched; only which editor offers it moves. */
  async function move(tag: string, locale: Locale) {
    const { ok, body } = await call(
      api("/news-tags"),
      {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ from: tag, locale }),
      },
      tag,
    );

    if (!ok) return setError(body?.error ?? st.moveFailed);
    setTags(body.tags);
    router.refresh();
  }

  /** Name and both notes in one request — see the route's PUT, which applies
   *  the rename first so the notes land on the record it settled on. */
  async function save() {
    if (!editing) return;

    const { ok, body } = await call(
      api("/news-tags"),
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
    setTags(body.tags);
    setEditing(null);
    router.refresh();
  }

  /** First click: ask what it is attached to. */
  async function requestDelete(name: string) {
    const { ok, status, body } = await call(
      api(`/news-tags?name=${encodeURIComponent(name)}`),
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
    setError(body?.error ?? st.deleteFailed);
  }

  /** Second click: do it, stripping the tag from the affected items. */
  async function confirmDelete() {
    if (!confirming) return;

    const { ok, body } = await call(
      api(`/news-tags?name=${encodeURIComponent(confirming.name)}&force=true`),
      { method: "DELETE" },
      confirming.name,
    );

    if (!ok) return setError(body?.error ?? "Could not delete that category.");
    setTags(body.tags);
    setConfirming(null);
    router.refresh();
  }

  return (
    <section className="card-surface overflow-hidden">
      <div className="border-b border-brand-100 bg-brand-50/50 px-5 py-3.5">
        <h2 className="font-display text-base font-semibold text-ink">
          {st.newsTagsTitle}
        </h2>
        <p className="mt-0.5 text-xs text-ink-soft">
          {st.newsTagsIntro}
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
          {st.newsTagsEmpty}
        </p>
      ) : (
        <ul className="divide-y divide-brand-50">
          {tags.map(({ name: tag, locale, slug }) => {
            const isEditing = editing?.from === tag;
            const dir = locale === "ar" ? "rtl" : "ltr";

            return (
              <li
                key={tag}
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
                      basePath="/events"
                      busy={busy === tag}
                      onChange={(draft) => setEditing({ ...editing, draft })}
                      onSave={save}
                      onCancel={() => setEditing(null)}
                    />
                  </>
                ) : (
                  <>
                    <Tag
                      className="size-4 shrink-0 text-brand-400"
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        dir={dir}
                        className="block truncate text-sm font-medium text-ink"
                      >
                        {tag}
                      </span>
                      <TaxonomyPermalink
                        slug={slug}
                        locale={locale}
                        basePath="/events"
                      />
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        void move(tag, locale === "ar" ? LOCALES[0] : "ar")
                      }
                      disabled={busy === tag}
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
                            from: tag,
                            draft: { name: tag, slug },
                          })
                        }
                        className="inline-flex size-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-brand-100 hover:text-brand-800"
                      >
                        <Pencil className="size-3.5" aria-hidden="true" />
                        <span className="sr-only">
                          {fill(st.renameNamed, { name: tag })}
                        </span>
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
                        <span className="sr-only">
                          {fill(st.deleteNamed, { name: tag })}
                        </span>
                      </button>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <TaxonomyAdder
        draft={adding}
        locale={addingLocale}
        basePath="/events"
        namePlaceholder={st.newTagName}
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
            confirming.usage.items.length === 1
              ? st.usedByOneItem
              : fill(st.usedByItems, { n: confirming.usage.items.length })
          }
          warning={
            confirming.usage.orphanCount === 0
              ? null
              : confirming.usage.orphanCount === 1
                ? st.orphanOneItem
                : fill(st.orphanItems, { n: confirming.usage.orphanCount })
          }
          rows={confirming.usage.items.map((item) => ({
            id: item.id,
            title: item.title,
            status: item.status,
            flagged: item.onlyTag,
            flagLabel: st.flagNoCategory,
          }))}
        />
      )}
    </section>
  );
}

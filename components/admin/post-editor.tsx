"use client";

import { useAdminApi, useAdminBase } from "@/components/admin/base-path";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Eye,
  ImagePlus,
  Loader2,
  Pencil,
  Redo2,
  Send,
  Star,
  Trash2,
  TriangleAlert,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { historyIntent, useDraftHistory } from "./use-draft-history";
import { LeaveDialog, useLeaveGuard } from "./leave-guard";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/config";
import {
  computeReadTime,
  formatPostDate,
  slugify,
  slugifyDraft,
} from "@/lib/cms/format";
import type { Category } from "@/lib/cms/categories";
import type { Author, Post, ResolvedPost } from "@/lib/cms/types";
import { DocEditor } from "./doc-editor";
import { MediaPickerDialog } from "./media-picker";
import { StatusPill } from "./status-pill";
import { CategorySelect } from "./category-select";
import { ArticleView } from "@/components/blog/article-view";
import { getContent } from "@/content";

/**
 * The post editor.
 *
 * Gutenberg's layout: the title and the block canvas in the main column, a
 * settings rail on the right whose top panel is the publish box, and a sticky
 * action bar at the top. `Edit` / `Preview` is a tab pair rather than a
 * separate screen, because the whole point of the preview is to check a change
 * you just made without losing your place.
 *
 * The preview renders `<ArticleView>` — the exact component the published page
 * uses — against the in-memory draft, so what is on screen is the article, not
 * an approximation of it.
 */

const FIELD =
  "w-full rounded-xl border border-brand-200/80 bg-white px-3.5 py-2.5 text-sm text-ink shadow-sm transition-colors placeholder:text-ink-faint focus:border-brand-600 focus:outline-none";
const LABEL = "block text-xs font-semibold tracking-wide text-ink uppercase";

/**
 * The preview renders the real article component, which needs the blog's
 * string table — and which one is a question about the *content*, not about
 * the panel. An Arabic article previewed with the English table would show an
 * English "Key Takeaways" heading over Arabic bullets, which is not what
 * ships. Both are built once here and indexed by the record's own language.
 */
const BLOG_UI: Record<Locale, ReturnType<typeof getContent>["ui"]["blog"]> = {
  en: getContent("en").ui.blog,
  ar: getContent("ar").ui.blog,
};

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card-surface overflow-hidden">
      <h2 className="border-b border-brand-100 bg-brand-50/50 px-4 py-2.5 font-display text-sm font-semibold text-ink">
        {title}
      </h2>
      <div className="space-y-3.5 p-4">{children}</div>
    </section>
  );
}

/** The history pair. Icon-only and quiet: they sit beside Save and Publish and
 *  must not compete with them. */
const HISTORY_BUTTON =
  "inline-flex size-8 items-center justify-center rounded-xl text-ink-soft transition-colors hover:bg-brand-50 hover:text-brand-800 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink-soft";

export function PostEditor({
  initialPost,
  categories: initialCategories,
  authors,
  isNew,
}: {
  initialPost: Post;
  /** Both languages' categories. The picker narrows them to the post's own —
   *  which can change without a reload, so the narrowing is client-side. */
  categories: Category[];
  /** Managed in Settings, not here — the editor only picks from the list. */
  authors: Author[];
  isNew: boolean;
}) {
  const router = useRouter();
  const base = useAdminBase();
  const api = useAdminApi();
  // Undo/redo covers the whole draft, not just the article body — see
  // `use-draft-history.ts` for why the browser's own history cannot serve
  // here, and why the unit is the record rather than one field.
  const {
    value: post,
    set: setDraft,
    commit: commitDraft,
    amend: amendDraft,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useDraftHistory(initialPost);
  // Held in state rather than read straight from the prop so a category
  // created in the picker appears in the list without a round trip.
  const [categories, setCategories] = useState(initialCategories);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [coverOpen, setCoverOpen] = useState(false);
  const [dirty, setDirty] = useState(false);

  /** Tracks whether the slug has ever been set by hand. Until it has, it keeps
   *  following the title — which is what WordPress does and what stops posts
   *  shipping with a slug from an abandoned first headline. */
  const slugTouched = useRef(!isNew && Boolean(initialPost.slug));

  const update = useCallback(
    (patch: Partial<Post>, options?: { history?: "step" | "amend" }) => {
      const apply =
        options?.history === "amend"
          ? amendDraft
          : options?.history === "step"
            ? commitDraft
            : setDraft;
      apply((current) => ({ ...current, ...patch }));
      setDirty(true);
      setNotice("");
    },
    [setDraft, commitDraft, amendDraft],
  );

  /* ---- history ------------------------------------------------------- */

  const stepBack = useCallback(() => {
    if (!canUndo) return;
    undo();
    setDirty(true);
    setNotice("");
  }, [canUndo, undo]);

  const stepForward = useCallback(() => {
    if (!canRedo) return;
    redo();
    setDirty(true);
    setNotice("");
  }, [canRedo, redo]);

  // Capture phase, so a `contenteditable` row never gets to run its own undo
  // against a DOM that React is about to rewrite from state.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const intent = historyIntent(event);
      if (!intent) return;
      event.preventDefault();
      if (intent === "undo") stepBack();
      else stepForward();
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [stepBack, stepForward]);

  // Nothing here autosaves, so leaving with unsaved work has to be a
  // deliberate choice rather than an accident. The guard holds any in-panel
  // link until the dialog at the bottom has had its answer; a saved draft
  // lets every link through untouched. See leave-guard.tsx.
  const leaveGuard = useLeaveGuard(dirty);

  const previewPost = useMemo<ResolvedPost>(
    () => ({
      ...post,
      slug: post.slug || slugify(post.title) || "untitled",
      author: authors.find((a) => a.id === post.authorId) ?? null,
    }),
    [post, authors],
  );

  /** Resolves true once the record is stored, false if the save was refused —
   *  the leave dialog goes on the first and stays put on the second so the
   *  errors it surfaced are actually seen. */
  async function save(status: "draft" | "published"): Promise<boolean> {
    setSaving(status === "published" ? "publish" : "draft");
    setErrors({});
    setNotice("");

    const payload: Post = {
      ...post,
      status,
      slug: post.slug || slugify(post.title),
    };

    const response = await fetch(
      isNew ? api("/posts") : api(`/posts/${post.id}`),
      {
        method: isNew ? "POST" : "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      },
    ).catch(() => null);

    const body = await response?.json().catch(() => null);

    if (!response?.ok) {
      if (response?.status === 422 && body?.errors) {
        setErrors(body.errors);
        setNotice("");
      } else {
        setNotice(body?.error ?? "Could not save. Check your connection.");
      }
      setSaving(null);
      return false;
    }

    const saved = body.post as Post;
    commitDraft(saved);
    setDirty(false);
    setSaving(null);
    setNotice(
      status === "published" ? "Published — it is live now." : "Draft saved.",
    );

    if (isNew) {
      // Swap the URL from /new to the real record so a refresh doesn't create
      // a second copy.
      router.replace(`${base}/posts/${saved.id}`);
    }
    router.refresh();
    return true;
  }

  async function remove() {
    if (
      !window.confirm(
        "Delete this post? It disappears from the website immediately and cannot be undone.",
      )
    ) {
      return;
    }
    await fetch(api(`/posts/${post.id}`), { method: "DELETE" });
    setDirty(false);
    router.replace(`${base}/posts`);
    router.refresh();
  }

  const busy = saving !== null;

  /** A post with neither language ticked would appear on no site at all, so
   *  both save paths are closed until one is — the server refuses it too, but
   *  a button that cannot succeed should not look like it can. */
  /**
   * The direction the editor writes in.
   *
   * Taken from the post's Content language, never from the panel's. Those are
   * two different questions: the panel's language decides what "Move to trash"
   * says, and the post's decides which way the words being typed run. Tying
   * the second to the first meant flipping the whole panel into Arabic just to
   * write one Arabic article — and then flipping it back.
   *
   * It turns the *content* and nothing else: the fields the post is written
   * into, and the preview of it. The layout stays put — the action bar, the
   * two-column split, the settings rail, the toolbars — because that is
   * panel chrome, and chrome answers to the panel's language. Turning the
   * whole screen moved furniture nobody asked to move.
   */
  const contentLocale = post.locales[0] ?? LOCALES[0];
  const contentDir = contentLocale === "ar" ? "rtl" : "ltr";

  const noLocale = post.locales.length === 0;
  const noLocaleReason = noLocale
    ? "Pick a language under Content language first."
    : undefined;

  return (
    <>
      {/* ---- Action bar ------------------------------------------------- */}
      <div className="sticky top-12 z-30 border-b border-brand-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[100rem] flex-wrap items-center gap-3 px-5 py-3 sm:px-8">
          <Link
            href={`${base}/posts`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-brand-700"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Posts
          </Link>

          <StatusPill status={post.status} />
          {dirty && (
            <span className="text-xs font-medium text-signal-600">
              Unsaved changes
            </span>
          )}

          <div className="ms-auto flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={stepBack}
                disabled={!canUndo}
                title="Undo (⌘Z / Ctrl+Z)"
                className={HISTORY_BUTTON}
              >
                <Undo2 className="size-4" aria-hidden="true" />
                <span className="sr-only">Undo</span>
              </button>
              <button
                type="button"
                onClick={stepForward}
                disabled={!canRedo}
                title="Redo (⇧⌘Z / Ctrl+Y)"
                className={HISTORY_BUTTON}
              >
                <Redo2 className="size-4" aria-hidden="true" />
                <span className="sr-only">Redo</span>
              </button>
            </div>

            <div className="me-1 flex rounded-xl bg-brand-50 p-0.5">
              {(["edit", "preview"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  aria-pressed={tab === key}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-200",
                    tab === key
                      ? "bg-white text-brand-800 shadow-sm"
                      : "text-ink-faint hover:text-ink",
                  )}
                >
                  {key === "edit" ? (
                    <Pencil className="size-3.5" aria-hidden="true" />
                  ) : (
                    <Eye className="size-3.5" aria-hidden="true" />
                  )}
                  {key === "edit" ? "Edit" : "Preview"}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => save("draft")}
              disabled={busy || noLocale}
              title={noLocaleReason}
              className="rounded-xl border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-brand-50 disabled:opacity-60"
            >
              {saving === "draft" ? "Saving…" : "Save draft"}
            </button>

            <button
              type="button"
              onClick={() => save("published")}
              disabled={busy || noLocale}
              title={noLocaleReason}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-300 hover:bg-brand-800 disabled:opacity-60"
            >
              {saving === "publish" ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="size-4" aria-hidden="true" />
              )}
              {post.status === "published" ? "Update" : "Publish"}
            </button>
          </div>
        </div>

        {(notice || Object.keys(errors).length > 0) && (
          <div className="mx-auto max-w-[100rem] px-5 pb-3 sm:px-8">
            {notice && (
              <p
                role="status"
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-800"
              >
                <Check className="size-4" aria-hidden="true" />
                {notice}
              </p>
            )}
            {Object.keys(errors).length > 0 && (
              <p
                role="alert"
                className="inline-flex items-start gap-1.5 rounded-xl bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700"
              >
                <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {Object.values(errors).join(" ")}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ---- Body -------------------------------------------------------- */}
      {tab === "preview" ? (
        <div className="bg-gradient-to-b from-brand-50/50 via-white to-brand-50/30">
          <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
            <p className="mb-8 inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-white px-3.5 py-2 text-xs font-medium text-ink-soft">
              <Eye className="size-3.5" aria-hidden="true" />
              Preview — exactly how this article will render on the site.
            </p>
            {/* The preview is the article itself, so it turns with the
                article — the notice above it is panel chrome and does not. */}
            <div dir={contentDir}>
              <ArticleView
                post={previewPost}
                ui={BLOG_UI[contentLocale]}
                animate={false}
                priority={false}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto grid max-w-[100rem] gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          {/* ---- Main column ---------------------------------------- */}
          <div className="min-w-0">
            <div>
              <label htmlFor="post-title" className={LABEL}>
                Title
              </label>
              <p className="mt-1 mb-2 text-xs text-ink-faint">
                The article headline — shown on the card, the /blogs index and
                the browser tab.
              </p>
              {/* Direction comes from the Content language, not from the
                  panel's: the panel's is a cookie and cannot answer for the
                  text typed into it, which may be either language in either
                  panel. */}
              <input
                id="post-title"
                dir={contentDir}
                value={post.title}
                onChange={(e) => {
                  const title = e.target.value;
                  update(
                    slugTouched.current
                      ? { title }
                      : { title, slug: slugify(title) },
                  );
                }}
                placeholder="Add title"
                className={FIELD}
              />
            </div>

            <div className="mt-6">
              <label htmlFor="post-slug" className={LABEL}>
                Permalink
              </label>
              <p className="mt-1 mb-2 text-xs text-ink-faint">
                The article&rsquo;s web address. Follows the title until you
                edit it here.
              </p>
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="shrink-0 font-mono text-xs text-ink-faint"
                >
                  /blogs/
                </span>
                <input
                  id="post-slug"
                  dir="ltr"
                  value={post.slug}
                  onChange={(e) => {
                    slugTouched.current = true;
                    // The typing-tolerant transform: the canonical one strips
                    // a trailing separator, which makes a hyphen impossible to
                    // type. Tidied on blur, and again by `uniqueSlug` on save.
                    update({ slug: slugifyDraft(e.target.value) });
                  }}
                  onBlur={() => {
                    // Only when it actually changes: an unconditional update
                    // would mark the draft dirty and add a history entry every
                    // time the field lost focus.
                    const tidy = slugify(post.slug);
                    if (tidy !== post.slug) update({ slug: tidy });
                  }}
                  placeholder="url-slug"
                  className={cn(FIELD, "font-mono")}
                />
              </div>
            </div>

            <div className="mt-8">
              <h2 className={LABEL}>Content</h2>
              <p className="mt-1 mb-3 text-xs text-ink-faint">
                Write the article straight through. Enter starts a new
                paragraph, and you can paste an image in where you want it.
              </p>
              <DocEditor
                blocks={post.blocks}
                dir={contentDir}
                onChange={(blocks, options) => update({ blocks }, options)}
              />
            </div>

            {/* After the article rather than before it: the excerpt summarises
                what was just written, and asking for it first meant writing it
                twice — once as a guess, once for real. */}
            <div className="mt-8">
              <label htmlFor="post-excerpt" className={LABEL}>
                Excerpt
              </label>
              <p className="mt-1 mb-2 text-xs text-ink-faint">
                Shown on the article card, the /blogs index, and as the search
                and social description.
              </p>
              <textarea
                id="post-excerpt"
                dir={contentDir}
                rows={3}
                value={post.excerpt}
                onChange={(e) => update({ excerpt: e.target.value })}
                placeholder="A two-line summary of the article…"
                className={cn(FIELD, "resize-y leading-relaxed")}
              />
            </div>
          </div>

          {/* ---- Settings rail --------------------------------------- */}
          <aside
            /* The rail scrolls on its own once it outgrows the viewport, so a
               long settings column can be worked through without moving the
               article canvas. No Lenis in the panel, so native overscroll
               hands the wheel back to the page at either end by itself.
               `overflow-x-clip` because giving one axis `auto` computes the
               other to `auto` too; the negative inline margins buy the
               scrollbar and the cards' shadows their room back. */
            className="scroll-subtle space-y-4 lg:sticky lg:top-32 lg:-mx-2 lg:max-h-[calc(100vh-9rem)] lg:self-start lg:overflow-x-clip lg:overflow-y-auto lg:px-2"
          >
            <Panel title="Publish">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-soft">Status</span>
                <StatusPill status={post.status} />
              </div>

              <div>
                <label htmlFor="post-date" className={LABEL}>
                  Publish date
                </label>
                <input
                  id="post-date"
                  type="date"
                  value={post.date}
                  onChange={(e) => update({ date: e.target.value })}
                  className={cn(FIELD, "mt-1.5")}
                />
                <p className="mt-1 text-xs text-ink-faint">
                  Shows as {formatPostDate(post.date)}
                </p>
              </div>

              <label className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={post.featured}
                  onChange={(e) => update({ featured: e.target.checked })}
                  className="mt-0.5 size-4 shrink-0 rounded border-brand-300 accent-brand-700"
                />
                <span className="text-sm">
                  <span className="flex items-center gap-1.5 font-medium text-ink">
                    <Star className="size-3.5 text-signal-500" aria-hidden="true" />
                    Feature this post
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-faint">
                    Pins it to the top of /blog. Only one post can be featured —
                    this replaces any current one.
                  </span>
                </span>
              </label>

              {/* Buttons, and stacked. These were inline links, which `space-y`
                  cannot separate — so the two ran together on one line and the
                  trash icon sat against the wrong label. Full width also keeps
                  the destructive one from landing under the cursor on its way
                  to the harmless one. */}
              {(post.status === "published" || !isNew) && (
                <div className="flex flex-col gap-2 border-t border-brand-100 pt-3.5">
                  {post.status === "published" && (
                    <Link
                      href={`/blogs/${post.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50 hover:text-brand-800"
                    >
                      <Eye className="size-4" aria-hidden="true" />
                      View live post
                    </Link>
                  )}

                  {!isNew && (
                    <button
                      type="button"
                      onClick={remove}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      Permanently delete
                    </button>
                  )}
                </div>
              )}
            </Panel>

            <Panel title="Cover image">
              {post.image ? (
                <>
                  <div className="relative h-32 w-full overflow-hidden rounded-xl border border-brand-100 bg-brand-50">
                    <Image
                      src={post.image}
                      alt=""
                      fill
                      sizes="320px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCoverOpen(true)}
                      className="flex-1 rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:bg-brand-50"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => update({ image: "" })}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-ink-faint transition-colors hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setCoverOpen(true)}
                  className="flex w-full flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-brand-200 py-6 text-xs font-semibold text-brand-700 transition-colors hover:border-brand-400 hover:bg-brand-50"
                >
                  <ImagePlus className="size-5" aria-hidden="true" />
                  Set cover image
                </button>
              )}
            </Panel>

            {/* Placement, not translation: choosing English puts the post on
                the English blog whatever language it is written in. Nothing
                here inspects the body — the editor decides, because the panel
                cannot know and guessing would be worse than asking. */}
            <Panel title="Content language">
              <p className="text-xs text-ink-faint">
                Which language site this post appears on. Choosing a language
                does not translate the post — it decides where it is listed.
              </p>

              <div className="space-y-2">
                {LOCALES.map((locale) => {
                  // `[0]`, not `includes`: a record written before this was a
                  // single choice carries both languages, and two checked
                  // radios in one group is a state the DOM cannot show. This
                  // is also exactly what a save would write.
                  const checked = post.locales[0] === locale;
                  return (
                    <label
                      key={locale}
                      className="flex cursor-pointer items-center gap-2.5"
                    >
                      <input
                        type="radio"
                        name="post-locale"
                        checked={checked}
                        onChange={() => {
                          // A category belongs to one language site, so the
                          // ones picked for the other cannot follow the post
                          // across — they would file it on a shelf its own
                          // site does not have. Undo puts them back.
                          const allowed = new Set(
                            categories
                              .filter((c) => c.locale === locale)
                              .map((c) => c.name),
                          );
                          update({
                            locales: [locale],
                            categories: post.categories.filter((c) =>
                              allowed.has(c),
                            ),
                          });
                        }}
                        className="size-4 shrink-0 border-brand-300 accent-brand-700"
                      />
                      <span className="text-sm font-medium text-ink">
                        {LOCALE_LABELS[locale]}
                      </span>
                    </label>
                  );
                })}
              </div>

              {post.locales.length === 0 && (
                <p
                  role="alert"
                  className="flex items-start gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
                >
                  <TriangleAlert
                    className="mt-0.5 size-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  Pick a language — the post cannot be saved while it would
                  appear nowhere.
                </p>
              )}
            </Panel>

            <Panel title="Categories">
              <CategorySelect
                locale={contentLocale}
                selected={post.categories}
                available={categories}
                onChange={(next) => update({ categories: next })}
                onCategoriesChange={setCategories}
              />
            </Panel>

            <Panel title="Author">
              <select
                value={post.authorId}
                onChange={(e) => update({ authorId: e.target.value })}
                className={FIELD}
              >
                <option value="">No byline</option>
                {authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                    {author.role ? ` — ${author.role}` : ""}
                  </option>
                ))}
                {/* An author deleted while this post was open would otherwise
                    silently reset the select to "No byline" on the next save. */}
                {post.authorId &&
                  !authors.some((a) => a.id === post.authorId) && (
                    <option value={post.authorId}>
                      (deleted author — pick a replacement)
                    </option>
                  )}
              </select>
              <p className="text-xs text-ink-faint">
                Authors are managed once in{" "}
                <Link
                  href={`${base}/settings`}
                  className="font-semibold text-brand-700 hover:text-brand-800"
                >
                  Settings
                </Link>
                , so correcting a name or photo updates every post they wrote.
              </p>
            </Panel>

            <Panel title="SEO">
              <div>
                <label htmlFor="seo-title" className={LABEL}>
                  Meta title
                </label>
                <input
                  id="seo-title"
                  dir={contentDir}
                  value={post.seo.metaTitle}
                  onChange={(e) =>
                    update({ seo: { ...post.seo, metaTitle: e.target.value } })
                  }
                  placeholder={post.title || "Defaults to the post title"}
                  className={cn(FIELD, "mt-1.5")}
                />
                <p className="mt-1 text-xs text-ink-faint">
                  {(post.seo.metaTitle || post.title).length} characters · aim
                  for under 60
                </p>
              </div>
              <div>
                <label htmlFor="seo-description" className={LABEL}>
                  Meta description
                </label>
                <textarea
                  id="seo-description"
                  dir={contentDir}
                  rows={3}
                  value={post.seo.metaDescription}
                  onChange={(e) =>
                    update({
                      seo: { ...post.seo, metaDescription: e.target.value },
                    })
                  }
                  placeholder={post.excerpt || "Defaults to the excerpt"}
                  className={cn(FIELD, "mt-1.5 resize-y leading-relaxed")}
                />
                <p className="mt-1 text-xs text-ink-faint">
                  {(post.seo.metaDescription || post.excerpt).length} characters
                  · aim for 120–160
                </p>
              </div>
            </Panel>

            <Panel title="Reading time">
              <input
                value={post.readTime}
                onChange={(e) => update({ readTime: e.target.value })}
                placeholder={computeReadTime(post.blocks)}
                className={FIELD}
              />
              <p className="text-xs text-ink-faint">
                Left blank it is calculated from the content —{" "}
                {computeReadTime(post.blocks)}.
              </p>
            </Panel>
          </aside>
        </div>
      )}

      <MediaPickerDialog
        open={coverOpen}
        selectedUrl={post.image}
        onClose={() => setCoverOpen(false)}
        onPick={(item) => {
          update({ image: item.url });
          setCoverOpen(false);
        }}
      />

      <LeaveDialog
        open={leaveGuard.pending !== null}
        saving={saving !== null}
        onStay={leaveGuard.stay}
        onLeave={leaveGuard.leave}
        // Saved under its current status, so "save" never quietly unpublishes
        // a live post or publishes a draft on the way out.
        onSaveAndLeave={async () => {
          const ok = await save(post.status);
          if (ok) leaveGuard.leave();
          else leaveGuard.stay();
        }}
      />
    </>
  );
}

"use client";

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
  Send,
  Star,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { computeReadTime, formatPostDate, slugify } from "@/lib/cms/format";
import type { Author, Post, ResolvedPost } from "@/lib/cms/types";
import { BlockEditor } from "./block-editor";
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

/** The preview renders the real article component, which needs the blog's
 *  string table. The panel itself is English, so it hands over the English
 *  one — the published page picks the reader's language for itself. */
const BLOG_UI = getContent().ui.blog;

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

export function PostEditor({
  initialPost,
  categories: initialCategories,
  authors,
  isNew,
}: {
  initialPost: Post;
  categories: string[];
  /** Managed in Settings, not here — the editor only picks from the list. */
  authors: Author[];
  isNew: boolean;
}) {
  const router = useRouter();
  const [post, setPost] = useState(initialPost);
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

  const update = useCallback((patch: Partial<Post>) => {
    setPost((current) => ({ ...current, ...patch }));
    setDirty(true);
    setNotice("");
  }, []);

  // Nothing here autosaves, so leaving with unsaved work has to be a
  // deliberate choice rather than an accident.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const previewPost = useMemo<ResolvedPost>(
    () => ({
      ...post,
      slug: post.slug || slugify(post.title) || "untitled",
      author: authors.find((a) => a.id === post.authorId) ?? null,
    }),
    [post, authors],
  );

  async function save(status: "draft" | "published") {
    setSaving(status === "published" ? "publish" : "draft");
    setErrors({});
    setNotice("");

    const payload: Post = {
      ...post,
      status,
      slug: post.slug || slugify(post.title),
    };

    const response = await fetch(
      isNew ? "/api/admin/posts" : `/api/admin/posts/${post.id}`,
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
      return;
    }

    const saved = body.post as Post;
    setPost(saved);
    setDirty(false);
    setSaving(null);
    setNotice(
      status === "published" ? "Published — it is live now." : "Draft saved.",
    );

    if (isNew) {
      // Swap the URL from /new to the real record so a refresh doesn't create
      // a second copy.
      router.replace(`/admin/posts/${saved.id}`);
    }
    router.refresh();
  }

  async function remove() {
    if (
      !window.confirm(
        "Delete this post? It disappears from the website immediately and cannot be undone.",
      )
    ) {
      return;
    }
    await fetch(`/api/admin/posts/${post.id}`, { method: "DELETE" });
    setDirty(false);
    router.replace("/admin/posts");
    router.refresh();
  }

  const busy = saving !== null;

  return (
    <>
      {/* ---- Action bar ------------------------------------------------- */}
      <div className="sticky top-12 z-30 border-b border-brand-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[100rem] flex-wrap items-center gap-3 px-5 py-3 sm:px-8">
          <Link
            href="/admin/posts"
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
              disabled={busy}
              className="rounded-xl border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-brand-50 disabled:opacity-60"
            >
              {saving === "draft" ? "Saving…" : "Save draft"}
            </button>

            <button
              type="button"
              onClick={() => save("published")}
              disabled={busy}
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
            <ArticleView
              post={previewPost}
              ui={BLOG_UI}
              animate={false}
              priority={false}
            />
          </div>
        </div>
      ) : (
        <div className="mx-auto grid max-w-[100rem] gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          {/* ---- Main column ---------------------------------------- */}
          <div className="min-w-0">
            <label htmlFor="post-title" className="sr-only">
              Post title
            </label>
            <input
              id="post-title"
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
              className="w-full border-0 bg-transparent font-display text-3xl leading-tight font-semibold tracking-[-0.02em] text-ink placeholder:text-brand-300 focus:outline-none"
            />

            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-ink-faint">
              <span>Permalink:</span>
              <span className="font-mono">/blog/</span>
              <input
                value={post.slug}
                onChange={(e) => {
                  slugTouched.current = true;
                  update({ slug: slugify(e.target.value) });
                }}
                placeholder="url-slug"
                className="min-w-32 flex-1 rounded-lg border border-transparent bg-brand-50/70 px-2 py-1 font-mono text-xs text-brand-800 transition-colors focus:border-brand-300 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="mt-6">
              <label htmlFor="post-excerpt" className={LABEL}>
                Excerpt
              </label>
              <p className="mt-1 mb-2 text-xs text-ink-faint">
                Shown on the article card, the /blog index, and as the search
                and social description.
              </p>
              <textarea
                id="post-excerpt"
                rows={3}
                value={post.excerpt}
                onChange={(e) => update({ excerpt: e.target.value })}
                placeholder="A two-line summary of the article…"
                className={cn(FIELD, "resize-y leading-relaxed")}
              />
            </div>

            <div className="mt-8">
              <h2 className={LABEL}>Content</h2>
              <p className="mt-1 mb-3 text-xs text-ink-faint">
                Build the article from blocks. Hover a block for its move,
                duplicate and delete controls.
              </p>
              <BlockEditor
                blocks={post.blocks}
                onChange={(blocks) => update({ blocks })}
              />
            </div>
          </div>

          {/* ---- Settings rail --------------------------------------- */}
          <aside className="space-y-4 lg:sticky lg:top-32 lg:self-start">
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

              {post.status === "published" && (
                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 transition-colors hover:text-brand-800"
                >
                  <Eye className="size-3.5" aria-hidden="true" />
                  View live post
                </Link>
              )}

              {!isNew && (
                <button
                  type="button"
                  onClick={remove}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-faint transition-colors hover:text-red-600"
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                  Move to trash
                </button>
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

            <Panel title="Categories">
              <CategorySelect
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
                  href="/admin/settings"
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
    </>
  );
}

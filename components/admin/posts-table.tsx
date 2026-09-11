"use client";

import { useAdminApi, useAdminBase } from "@/components/admin/base-path";
import { fill, useAdminStrings } from "@/components/admin/strings";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ImageFallback } from "@/components/site/image-fallback";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  FileText,
  Loader2,
  PlusCircle,
  Search,
  SquarePen,
  Star,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPostDate } from "@/lib/cms/format";
import type { PostStatus, PostSummary } from "@/lib/cms/types";
import { StatusPill } from "./status-pill";

type Filter = "all" | PostStatus;

/**
 * The posts list — WordPress's "All Posts" table.
 *
 * Same information architecture: status tabs with counts across the top, a
 * search box on the right, and a row per post whose actions (Edit / View /
 * Delete) appear on hover, exactly where wp-admin puts them. The thumbnail
 * column is the one addition, and it earns its place: this blog is
 * image-forward and the cover is the fastest way to recognise a post.
 *
 * Seeded from a server render so the first paint has the real list, then
 * maintained client-side so deleting a row doesn't cost a round trip.
 */
export function PostsTable({ initialPosts }: { initialPosts: PostSummary[] }) {
  const router = useRouter();
  const t = useAdminStrings();
  const base = useAdminBase();
  const api = useAdminApi();
  const [posts, setPosts] = useState(initialPosts);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  const counts = useMemo(
    () => ({
      all: posts.length,
      published: posts.filter((p) => p.status === "published").length,
      draft: posts.filter((p) => p.status === "draft").length,
    }),
    [posts],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      if (filter !== "all" && post.status !== filter) return false;
      if (!q) return true;
      return (
        post.title.toLowerCase().includes(q) ||
        post.categories.some((c) => c.toLowerCase().includes(q)) ||
        post.slug.toLowerCase().includes(q)
      );
    });
  }, [posts, filter, query]);

  async function remove(post: PostSummary) {
    const label = post.title || t.posts.untitledFallback;
    if (!window.confirm(fill(t.posts.confirmDelete, { title: label }))) {
      return;
    }

    setDeleting(post.id);
    setError("");

    const response = await fetch(api(`/posts/${post.id}`), {
      method: "DELETE",
    }).catch(() => null);

    if (!response?.ok) {
      setError(fill(t.posts.deleteFailed, { title: label }));
      setDeleting(null);
      return;
    }

    setPosts((current) => current.filter((p) => p.id !== post.id));
    setDeleting(null);
    // Keeps the dashboard counts and the public blog in step.
    router.refresh();
  }

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: t.common.all },
    { key: "published", label: t.common.published },
    { key: "draft", label: t.common.drafts },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            {t.posts.title}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">{t.posts.intro}</p>
        </div>
        <Link
          href={`${base}/posts/new`}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-colors duration-300 hover:bg-brand-800"
        >
          <PlusCircle className="size-4" aria-hidden="true" />
          {t.posts.addNew}
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div role="group" aria-label={t.common.filterByStatus} className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              aria-pressed={filter === tab.key}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200",
                filter === tab.key
                  ? "bg-brand-800 text-white"
                  : "text-ink-soft hover:bg-white hover:text-brand-700",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "ms-1.5 text-xs",
                  filter === tab.key ? "text-brand-200" : "text-ink-faint",
                )}
              >
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <label htmlFor="admin-post-search" className="sr-only">
            {t.posts.searchLabel}
          </label>
          <Search
            className="absolute top-1/2 start-3.5 size-4 -translate-y-1/2 text-ink-faint"
            aria-hidden="true"
          />
          <input
            id="admin-post-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.posts.searchPlaceholder}
            className="w-full rounded-xl border border-brand-200/80 bg-white py-2.5 pe-4 ps-10 text-sm text-ink shadow-sm transition-colors placeholder:text-ink-faint focus:border-brand-600 focus:outline-none"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="card-surface mt-5 overflow-hidden">
        {visible.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <FileText
              className="mx-auto size-10 text-brand-300"
              aria-hidden="true"
            />
            <p className="mt-4 font-display text-base font-semibold text-ink">
              {posts.length === 0
                ? t.posts.emptyTitle
                : t.posts.noMatchTitle}
            </p>
            <p className="mt-1 text-sm text-ink-faint">
              {posts.length === 0
                ? t.posts.emptyBody
                : t.common.tryOtherFilter}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-brand-50">
            {visible.map((post) => (
              <li
                key={post.id}
                className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-brand-50/50"
              >
                <div className="relative hidden size-14 shrink-0 overflow-hidden rounded-xl bg-brand-50 sm:block">
                  {post.image ? (
                    <Image
                      src={post.image}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <ImageFallback iconClassName="size-5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`${base}/posts/${post.id}`}
                      className="truncate text-sm font-semibold text-ink transition-colors hover:text-brand-700"
                    >
                      {post.title || t.common.untitled}
                    </Link>
                    {post.featured && (
                      <Star
                        className="size-3.5 shrink-0 fill-signal-500 text-signal-500"
                        aria-label={t.posts.featured}
                      />
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-ink-faint">
                    {post.categories.join(t.common.listSeparator) ||
                      t.common.uncategorised} ·{" "}
                    {formatPostDate(post.date)} ·{" "}
                    <span className="font-mono">/{post.slug}</span>
                  </p>
                </div>

                <StatusPill status={post.status} className="hidden sm:inline-flex" />

                {/* Always reachable by keyboard; revealed on hover for the
                    mouse, which is the wp-admin row-actions pattern. */}
                <div className="flex shrink-0 items-center gap-0.5 opacity-100 transition-opacity duration-200 lg:opacity-0 lg:group-hover:opacity-100 lg:focus-within:opacity-100">
                  <Link
                    href={`${base}/posts/${post.id}`}
                    title={t.common.edit}
                    className="inline-flex size-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-brand-100 hover:text-brand-800"
                  >
                    <SquarePen className="size-4" aria-hidden="true" />
                    <span className="sr-only">
                      {fill(t.common.editNamed, { title: post.title })}
                    </span>
                  </Link>
                  <Link
                    href={
                      post.status === "published"
                        ? `/blogs/${post.slug}`
                        : `${base}/posts/${post.id}#preview`
                    }
                    target={post.status === "published" ? "_blank" : undefined}
                    rel="noreferrer"
                    title={t.common.view}
                    className="inline-flex size-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-brand-100 hover:text-brand-800"
                  >
                    <Eye className="size-4" aria-hidden="true" />
                    <span className="sr-only">
                      {fill(t.common.viewNamed, { title: post.title })}
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(post)}
                    disabled={deleting === post.id}
                    title={t.common.delete}
                    className="inline-flex size-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    {deleting === post.id ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Trash2 className="size-4" aria-hidden="true" />
                    )}
                    <span className="sr-only">
                      {fill(t.common.deleteNamed, { title: post.title })}
                    </span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

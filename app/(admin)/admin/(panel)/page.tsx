import Link from "next/link";
import { ArrowRight, FileText, Images, Newspaper, Send } from "lucide-react";
import { getPostSummaries } from "@/lib/cms/posts";
import { getNewsSummaries } from "@/lib/cms/news";
import { listMedia } from "@/lib/cms/media";
import { formatPostDate } from "@/lib/cms/posts";
import { StatusPill } from "@/components/admin/status-pill";

export const metadata = { title: "Dashboard" };
/** The panel always reflects the store as it is right now, never a cached
 *  snapshot — an editor seeing yesterday's list would be a bug, not a saving. */
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [posts, news, media] = await Promise.all([
    getPostSummaries(),
    getNewsSummaries(),
    listMedia(),
  ]);

  const published = posts.filter((p) => p.status === "published").length;
  const newsPublished = news.filter((n) => n.status === "published").length;
  const drafts =
    posts.length - published + (news.length - newsPublished);
  const recent = posts.slice(0, 5);
  const recentNews = news.slice(0, 5);

  const stats = [
    { label: "Published blogs", value: published, icon: Send },
    { label: "Published news", value: newsPublished, icon: Newspaper },
    { label: "Drafts", value: drafts, icon: FileText },
    { label: "Images", value: media.length, icon: Images },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <h1 className="font-display text-2xl font-semibold text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Blogs appear on the TribuCare blog; news appears on the news page.
      </p>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <li key={stat.label} className="card-surface p-5">
            <span className="icon-disc size-10">
              <stat.icon className="size-4.5" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <p className="mt-4 font-display text-3xl font-semibold text-ink">
              {stat.value}
            </p>
            <p className="mt-0.5 text-xs font-medium text-ink-faint">
              {stat.label}
            </p>
          </li>
        ))}
      </ul>

      <div className="card-surface mt-6 overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-brand-100 px-5 py-4">
          <h2 className="font-display text-base font-semibold text-ink">
            Recent blogs
          </h2>
          <Link
            href="/admin/posts"
            className="group inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 transition-colors hover:text-brand-800"
          >
            View all
            <ArrowRight
              className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-ink-soft">No blogs yet.</p>
            <Link
              href="/admin/posts/new"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
            >
              Write the first one
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-brand-50">
            {recent.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/admin/posts/${post.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-brand-50/60"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">
                      {post.title || "(untitled)"}
                    </span>
                    <span className="mt-0.5 block text-xs text-ink-faint">
                      {post.categories.join(", ") || "Uncategorised"} ·{" "}
                      {formatPostDate(post.date)}
                    </span>
                  </span>
                  <StatusPill status={post.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* The news list is a second panel rather than a merged feed: the two
          content types are edited in different places and go to different
          pages, so a combined list would only raise the question of which is
          which on every row. */}
      <div className="card-surface mt-6 overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-brand-100 px-5 py-4">
          <h2 className="font-display text-base font-semibold text-ink">
            Recent news
          </h2>
          <Link
            href="/admin/news"
            className="group inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 transition-colors hover:text-brand-800"
          >
            View all
            <ArrowRight
              className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>

        {recentNews.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-ink-soft">No news yet.</p>
            <Link
              href="/admin/news/new"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
            >
              Add the first one
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-brand-50">
            {recentNews.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/admin/news/${item.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-brand-50/60"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">
                      {item.title || "(untitled)"}
                    </span>
                    <span className="mt-0.5 block text-xs text-ink-faint">
                      {item.tags.join(", ") || "Untagged"} ·{" "}
                      {formatPostDate(item.date)}
                    </span>
                  </span>
                  <StatusPill status={item.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

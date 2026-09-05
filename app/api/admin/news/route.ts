import { requireSession } from "@/lib/cms/session";
import { revalidateNews } from "@/lib/cms/revalidate";
import {
  emptyNews,
  getNewsSummaries,
  saveNews,
  uniqueNewsSlug,
  validateNews,
} from "@/lib/cms/news";
import type { NewsItem } from "@/lib/cms/types";

export async function GET() {
  const denied = await requireSession();
  if (denied) return denied;

  return Response.json(
    { news: await getNewsSummaries() },
    { headers: { "cache-control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const denied = await requireSession();
  if (denied) return denied;

  const body = (await request
    .json()
    .catch(() => null)) as Partial<NewsItem> | null;
  const base = emptyNews();

  const draft: NewsItem = {
    ...base,
    ...body,
    // Never trust a client-supplied id or timestamp — the id decides which
    // stored record a save overwrites.
    id: base.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const errors = validateNews(draft, draft.status);
  if (Object.keys(errors).length) {
    return Response.json({ errors }, { status: 422 });
  }

  draft.slug = await uniqueNewsSlug(draft.slug || draft.title, draft.id);

  const saved = await saveNews(draft);
  revalidateNews(saved.slug);

  return Response.json({ item: saved }, { status: 201 });
}

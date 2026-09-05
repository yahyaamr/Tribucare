import { requireSession } from "@/lib/cms/session";
import { createAuthor, getAuthors } from "@/lib/cms/authors";

export async function GET() {
  const denied = await requireSession();
  if (denied) return denied;

  return Response.json(
    { authors: await getAuthors() },
    { headers: { "cache-control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const denied = await requireSession();
  if (denied) return denied;

  const body = (await request.json().catch(() => null)) as {
    name?: string;
    role?: string;
    avatar?: string;
  } | null;

  const result = await createAuthor({
    name: body?.name ?? "",
    role: body?.role,
    avatar: body?.avatar,
  });

  if (!result.ok) return Response.json({ error: result.error }, { status: 400 });

  return Response.json(
    { author: result.author, authors: await getAuthors() },
    { status: 201 },
  );
}

import { requireSession } from "@/lib/cms/session";
import { guardStore } from "@/lib/cms/store";
import { createAuthor, getAuthors } from "@/lib/cms/authors";

async function GET_() {
  const denied = await requireSession();
  if (denied) return denied;

  return Response.json(
    { authors: await getAuthors() },
    { headers: { "cache-control": "no-store" } },
  );
}

async function POST_(request: Request) {
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

// A storage failure becomes a clear JSON error with the right status, which the
// editors display verbatim, rather than a bare 500 they render as "check your
// connection". Nothing is written on the failing path.
export const GET = guardStore(GET_);
export const POST = guardStore(POST_);

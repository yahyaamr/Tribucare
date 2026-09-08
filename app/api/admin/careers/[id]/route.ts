import { requireSession } from "@/lib/cms/session";
import { guardStore } from "@/lib/cms/store";
import { revalidateCareers } from "@/lib/cms/revalidate";
import { getRoleById, saveRole, validateRole } from "@/lib/cms/roles";
import type { Role } from "@/lib/cms/types";

/** `params` is a Promise in Next 16 — synchronous access was removed. */
type Context = { params: Promise<{ id: string }> };

async function GET_(_request: Request, { params }: Context) {
  const denied = await requireSession();
  if (denied) return denied;

  const role = await getRoleById((await params).id);
  if (!role) return Response.json({ error: "Not found." }, { status: 404 });

  return Response.json({ role }, { headers: { "cache-control": "no-store" } });
}

async function PUT_(request: Request, { params }: Context) {
  const denied = await requireSession();
  if (denied) return denied;

  const { id } = await params;
  const existing = await getRoleById(id);
  if (!existing) return Response.json({ error: "Not found." }, { status: 404 });

  const body = (await request.json().catch(() => null)) as Partial<Role> | null;

  const next: Role = {
    ...existing,
    ...body,
    // The path decides identity, and `order` is the homepage's layout rather
    // than a field this form edits — neither is the payload's to rewrite.
    id: existing.id,
    order: existing.order,
  };

  const errors = validateRole(next);
  if (Object.keys(errors).length) {
    return Response.json({ errors }, { status: 422 });
  }

  const saved = await saveRole(next, existing);
  revalidateCareers();

  return Response.json({ role: saved });
}

// A storage failure becomes a clear JSON error with the right status, which the
// editors display verbatim, rather than a bare 500 they render as "check your
// connection". Nothing is written on the failing path.
export const GET = guardStore(GET_);
export const PUT = guardStore(PUT_);

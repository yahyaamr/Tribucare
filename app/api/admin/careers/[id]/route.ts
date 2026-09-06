import { requireSession } from "@/lib/cms/session";
import { revalidateCareers } from "@/lib/cms/revalidate";
import { getRoleById, saveRole, validateRole } from "@/lib/cms/roles";
import type { Role } from "@/lib/cms/types";

/** `params` is a Promise in Next 16 — synchronous access was removed. */
type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const denied = await requireSession();
  if (denied) return denied;

  const role = await getRoleById((await params).id);
  if (!role) return Response.json({ error: "Not found." }, { status: 404 });

  return Response.json({ role }, { headers: { "cache-control": "no-store" } });
}

export async function PUT(request: Request, { params }: Context) {
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

import { requireSession } from "@/lib/cms/session";
import { ensureRolesSeeded } from "@/lib/cms/roles";

/**
 * The role list.
 *
 * Read-only, and there is no `POST`: the careers section shows a fixed set of
 * cards that the panel edits rather than a queue of openings it publishes.
 * Adding a role is a content decision that changes the homepage's shape, so it
 * stays a code change until somebody asks for it to stop being one.
 */
export async function GET() {
  const denied = await requireSession();
  if (denied) return denied;

  return Response.json(
    { roles: await ensureRolesSeeded() },
    { headers: { "cache-control": "no-store" } },
  );
}

import { requireSession } from "@/lib/cms/session";
import { guardStore } from "@/lib/cms/store";
import { ensureRolesSeeded } from "@/lib/cms/roles";

/**
 * The role list.
 *
 * Read-only, and there is no `POST`: the careers section shows a fixed set of
 * cards that the panel edits rather than a queue of openings it publishes.
 * Adding a role is a content decision that changes the homepage's shape, so it
 * stays a code change until somebody asks for it to stop being one.
 */
async function GET_() {
  const denied = await requireSession();
  if (denied) return denied;

  return Response.json(
    { roles: await ensureRolesSeeded() },
    { headers: { "cache-control": "no-store" } },
  );
}

// A storage failure becomes a clear JSON error with the right status, which the
// editors display verbatim, rather than a bare 500 they render as "check your
// connection". Nothing is written on the failing path.
export const GET = guardStore(GET_);

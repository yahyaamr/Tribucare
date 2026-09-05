import { cookies } from "next/headers";
import { requireSession } from "@/lib/cms/session";
import { isLocale } from "@/lib/i18n/config";
import {
  ADMIN_LOCALE_COOKIE,
  adminLocaleCookieOptions,
} from "@/lib/i18n/admin";

/** Sets the panel's language for this person. Session-gated like every other
 *  admin route — the cookie decides what the server renders. */
export async function POST(request: Request) {
  const denied = await requireSession();
  if (denied) return denied;

  const body = (await request.json().catch(() => null)) as {
    locale?: string;
  } | null;

  if (!body?.locale || !isLocale(body.locale)) {
    return Response.json({ error: "Unknown language." }, { status: 400 });
  }

  const store = await cookies();
  store.set(ADMIN_LOCALE_COOKIE, body.locale, adminLocaleCookieOptions);
  return Response.json({ ok: true });
}

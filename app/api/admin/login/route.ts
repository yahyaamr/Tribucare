import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  createSessionValue,
  isAuthConfigured,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/cms/auth";

/** Rejections are deliberately slow and vague: a shared password is the only
 *  thing standing in front of the panel, so this should not be a fast oracle
 *  and should not distinguish "wrong password" from anything else. */
export async function POST(request: Request) {
  if (!isAuthConfigured()) {
    return Response.json(
      {
        error:
          "No admin password is set. Add ADMIN_PASSWORD to the environment and redeploy.",
      },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    password?: string;
  } | null;

  if (!(await verifyPassword(body?.password ?? ""))) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return Response.json({ error: "That password is not right." }, { status: 401 });
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionValue(), sessionCookieOptions);
  return Response.json({ ok: true });
}

import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  createSessionValue,
  isAuthConfigured,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/cms/auth";
import {
  MAX_ATTEMPTS,
  checkLock,
  clearFailures,
  clientIp,
  recordFailure,
} from "@/lib/cms/rate-limit";

/** Rejections are deliberately slow and vague: a shared password is the only
 *  thing standing in front of the panel, so this should not be a fast oracle
 *  and should not distinguish "wrong password" from anything else. */
export async function POST(request: Request) {
  const ip = clientIp(request);

  // Checked before the password is even read: while an address is blocked
  // there is no answer it can give that matters, and comparing anyway would
  // leak timing about the credential to somebody already being refused.
  const lock = await checkLock(ip);
  if (lock.blocked) {
    return Response.json({ error: blockedMessage(lock.until) }, { status: 429 });
  }

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
    const next = await recordFailure(ip);
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (next.blocked) {
      return Response.json({ error: blockedMessage(next.until) }, { status: 429 });
    }
    return Response.json(
      {
        error: `That password is not right. ${next.remaining} ${
          next.remaining === 1 ? "attempt" : "attempts"
        } left before this device is blocked for a week.`,
      },
      { status: 401 },
    );
  }

  // A run of failures only counts while unbroken, so signing in ends it.
  await clearFailures(ip);

  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionValue(), sessionCookieOptions);
  return Response.json({ ok: true });
}

/** Says how long is left rather than just "blocked", because the alternative is
 *  an editor retrying all week without knowing there is nothing to retry. */
function blockedMessage(until: number) {
  const hours = Math.max(1, Math.ceil((until - Date.now()) / 3_600_000));
  const left =
    hours >= 48
      ? `about ${Math.round(hours / 24)} days`
      : `about ${hours} ${hours === 1 ? "hour" : "hours"}`;

  return `Too many wrong passwords. This device is blocked for ${left}. ${MAX_ATTEMPTS} wrong attempts in a row triggers a one-week block.`;
}

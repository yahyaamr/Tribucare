/**
 * Login lockout: three wrong passwords and that address is out for a week.
 *
 * The panel is guarded by one shared password, and until now `/api/admin/login`
 * would accept guesses as fast as they arrived — the 600ms pause on a rejection
 * is per request, so a hundred parallel requests take 600ms in total, not a
 * minute. That is the gap this closes, and it matters more than anything else
 * on the login path: a secret URL only stops the attacker who has not been told
 * where to look.
 *
 * ## The rule
 *
 * Three consecutive failures from one address block it for seven days. Signing
 * in successfully clears the count, so the three do not have to be near each
 * other in time — only unbroken. Once a block lapses the address starts over.
 *
 * ## Two properties worth being deliberate about
 *
 * **The block is per address, never global.** A global counter would mean any
 * stranger who found the login could stop the whole team publishing for a week
 * with three wrong guesses — trading a brute-force risk for a much cheaper
 * denial of service.
 *
 * **An office is one address.** Everybody behind the same NAT shares a counter,
 * so a colleague's third typo locks their colleagues out too. That is inherent
 * to identifying people by IP when the credential is shared and there are no
 * accounts, and it is why `unlock` exists.
 *
 * ## Storage
 *
 * Upstash over its REST API — no SDK, and it works in any runtime. Serverless
 * runs many instances, so a counter held in one of them counts almost nothing;
 * a shared store is what makes "three" actually mean three. Without the
 * credentials it degrades to per-instance memory, which is weaker but keeps
 * local development and any deployment without Redis working normally.
 *
 * **It fails open.** If Redis is unreachable the login proceeds unthrottled
 * rather than refusing everyone: an outage at the storage layer should not be
 * indistinguishable from a lockout, because that failure mode locks the team
 * out of their own site with no way to tell why.
 */

const MAX_ATTEMPTS = 3;
const BLOCK_SECONDS = 7 * 24 * 60 * 60;
/** Counts are meaningless once they can never reach the threshold, so they are
 *  given the same lifetime as a block rather than living forever. */
const COUNT_SECONDS = BLOCK_SECONDS;

const FAILS = (ip: string) => `tribucare:login:fails:${ip}`;
const BLOCK = (ip: string) => `tribucare:login:block:${ip}`;

/* ------------------------------------------------------------- storage -- */

function credentials() {
  const url =
    process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? "";
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? "";
  return url && token ? { url, token } : null;
}

export function isLockoutShared() {
  return credentials() !== null;
}

async function redis(command: (string | number)[]) {
  const creds = credentials();
  if (!creds) return null;

  const response = await fetch(creds.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${creds.token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`Upstash ${response.status}`);
  return (await response.json()) as { result: unknown };
}

/** The fallback when Redis is not configured. Per instance and lost on deploy,
 *  which is why it is a fallback and not the design. */
const memory = new Map<string, { value: number; expires: number }>();

function memoryGet(key: string) {
  const entry = memory.get(key);
  if (!entry) return null;
  if (entry.expires < Date.now()) {
    memory.delete(key);
    return null;
  }
  return entry;
}

/* --------------------------------------------------------------- api ---- */

/**
 * The caller's address.
 *
 * `x-forwarded-for` is a list appended to by each hop, so the client is the
 * first entry; taking the last would read the proxy nearest us and give every
 * visitor the same identity.
 */
export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export type LockState = { blocked: boolean; until: number; remaining: number };

const open: LockState = { blocked: false, until: 0, remaining: MAX_ATTEMPTS };

export async function checkLock(ip: string): Promise<LockState> {
  try {
    if (isLockoutShared()) {
      const [block, fails] = await Promise.all([
        redis(["GET", BLOCK(ip)]),
        redis(["GET", FAILS(ip)]),
      ]);
      const until = Number(block?.result ?? 0);
      if (until > Date.now()) return { blocked: true, until, remaining: 0 };
      return {
        blocked: false,
        until: 0,
        remaining: Math.max(0, MAX_ATTEMPTS - Number(fails?.result ?? 0)),
      };
    }

    const block = memoryGet(BLOCK(ip));
    if (block) return { blocked: true, until: block.value, remaining: 0 };
    const fails = memoryGet(FAILS(ip))?.value ?? 0;
    return { blocked: false, until: 0, remaining: Math.max(0, MAX_ATTEMPTS - fails) };
  } catch {
    return open;
  }
}

/** Records a rejected password and reports the state that follows it. */
export async function recordFailure(ip: string): Promise<LockState> {
  try {
    if (isLockoutShared()) {
      const incremented = await redis(["INCR", FAILS(ip)]);
      const count = Number(incremented?.result ?? 0);
      await redis(["EXPIRE", FAILS(ip), COUNT_SECONDS]);

      if (count < MAX_ATTEMPTS) {
        return { blocked: false, until: 0, remaining: MAX_ATTEMPTS - count };
      }

      const until = Date.now() + BLOCK_SECONDS * 1000;
      await redis(["SET", BLOCK(ip), String(until), "EX", BLOCK_SECONDS]);
      // The count has served its purpose; the block is now what is consulted.
      await redis(["DEL", FAILS(ip)]);
      return { blocked: true, until, remaining: 0 };
    }

    const count = (memoryGet(FAILS(ip))?.value ?? 0) + 1;
    memory.set(FAILS(ip), {
      value: count,
      expires: Date.now() + COUNT_SECONDS * 1000,
    });

    if (count < MAX_ATTEMPTS) {
      return { blocked: false, until: 0, remaining: MAX_ATTEMPTS - count };
    }

    const until = Date.now() + BLOCK_SECONDS * 1000;
    memory.set(BLOCK(ip), { value: until, expires: until });
    memory.delete(FAILS(ip));
    return { blocked: true, until, remaining: 0 };
  } catch {
    return open;
  }
}

/** Signing in clears the run of failures — three has to mean three in a row. */
export async function clearFailures(ip: string) {
  try {
    if (isLockoutShared()) {
      await redis(["DEL", FAILS(ip)]);
      return;
    }
    memory.delete(FAILS(ip));
  } catch {
    // A counter that could not be cleared is not worth failing a valid login
    // over; it lapses on its own.
  }
}

/**
 * Lifts a block.
 *
 * The escape hatch for the NAT problem above: one person's typos can strand a
 * whole office for a week, and without this the only remedy would be waiting it
 * out. Not reachable from the panel — being locked out is precisely when it is
 * needed — so it is called from `scripts/unlock-login.mjs`.
 */
export async function unlock(ip: string) {
  if (isLockoutShared()) {
    await Promise.all([redis(["DEL", BLOCK(ip)]), redis(["DEL", FAILS(ip)])]);
    return;
  }
  memory.delete(BLOCK(ip));
  memory.delete(FAILS(ip));
}

export { MAX_ATTEMPTS, BLOCK_SECONDS };

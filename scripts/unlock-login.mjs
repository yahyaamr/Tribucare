#!/usr/bin/env node
/**
 * Lifts a login block.
 *
 * Three wrong passwords in a row block an address for a week. That is the rule
 * working as intended when it is an attacker, and a problem when it is the
 * office — everyone behind one NAT shares an address, so a colleague's third
 * typo strands the team. This is the way out.
 *
 * It is a script rather than a button because being locked out is exactly when
 * the panel cannot help you, and an unlock control reachable from the login
 * screen would undo the lockout it sits next to.
 *
 *   node scripts/unlock-login.mjs 41.35.12.7     # lift one address
 *   node scripts/unlock-login.mjs --all          # lift every block
 *   node scripts/unlock-login.mjs --list         # who is blocked
 *
 * Reads Upstash credentials from the environment, so run it with the project's
 * env loaded — `vercel env pull` first, or run it anywhere .env.local is
 * present. Without those it exits saying so rather than pretending to work:
 * with no Redis, blocks live in each instance's memory and a redeploy clears
 * them anyway.
 */

import { readFileSync } from "node:fs";

function loadEnvLocal() {
  try {
    for (const line of readFileSync(".env.local", "utf8").split("\n")) {
      const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
      if (!match) continue;
      const [, key, raw] = match;
      if (!process.env[key]) {
        process.env[key] = raw.trim().replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // No .env.local — the environment may still carry the variables.
  }
}

loadEnvLocal();

const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const token =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  console.error(
    "No Upstash credentials found (KV_REST_API_URL / KV_REST_API_TOKEN).\n" +
      "Without them blocks are per-instance and in memory — redeploy clears them.",
  );
  process.exit(1);
}

async function redis(command) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(command),
  });
  if (!response.ok) {
    throw new Error(`Upstash ${response.status}: ${await response.text()}`);
  }
  return (await response.json()).result;
}

const arg = process.argv[2];

if (!arg) {
  console.error(
    "Usage:\n" +
      "  node scripts/unlock-login.mjs <ip>\n" +
      "  node scripts/unlock-login.mjs --all\n" +
      "  node scripts/unlock-login.mjs --list",
  );
  process.exit(1);
}

const BLOCK_PREFIX = "tribucare:login:block:";

/** Strip the prefix rather than splitting on ":" — an IPv6 address is full of
 *  colons, so `split(":").pop()` on `…block:::1` yields "1" and the delete that
 *  follows targets a key that does not exist. The unlock silently does nothing,
 *  which is the worst way for an escape hatch to fail. */
const ipFromKey = (key) => key.slice(BLOCK_PREFIX.length);

const blockKeys = await redis(["KEYS", `${BLOCK_PREFIX}*`]);

if (arg === "--list") {
  if (blockKeys.length === 0) {
    console.log("No addresses are blocked.");
  } else {
    for (const key of blockKeys) {
      const until = Number(await redis(["GET", key]));
      const hours = Math.ceil((until - Date.now()) / 3_600_000);
      console.log(`${ipFromKey(key)}  — blocked for another ${hours} hour(s)`);
    }
  }
  process.exit(0);
}

const targets = arg === "--all" ? blockKeys.map(ipFromKey) : [arg];

for (const ip of targets) {
  await redis(["DEL", `tribucare:login:block:${ip}`]);
  await redis(["DEL", `tribucare:login:fails:${ip}`]);
  console.log(`Unblocked ${ip}`);
}

if (targets.length === 0) console.log("Nothing to unblock.");

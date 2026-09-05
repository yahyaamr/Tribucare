/**
 * Pushes the local CMS store into Vercel Blob.
 *
 * The panel writes to `.cms-data/` (and `public/uploads/`) whenever no Blob
 * token is present, which is what makes `npm run dev` work with no setup. Both
 * are gitignored — they are content, not source — so anything written locally
 * stays local. This copies it up once, so posts, news, authors, categories and
 * uploaded images written before the store was connected are not retyped.
 *
 * Usage:
 *   vercel env pull .env.local     # brings BLOB_READ_WRITE_TOKEN down
 *   node scripts/cms-push.mjs      # dry run: lists what would be sent
 *   node scripts/cms-push.mjs --write
 *
 * Records already in Blob are left alone unless `--force` is passed, so a
 * second run cannot quietly overwrite what the team has since edited online.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { list, put } from "@vercel/blob";

const ROOT = process.cwd();
const FS_ROOT = path.join(ROOT, ".cms-data");
const FS_UPLOADS = path.join(ROOT, "public", "uploads");
const MEDIA_PREFIX = "cms/media/";

const write = process.argv.includes("--write");
const force = process.argv.includes("--force");

/** Reads `.env.local` for the token, so the script works straight after
 *  `vercel env pull` without exporting anything by hand. */
async function loadToken() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN;
  const raw = await fs.readFile(path.join(ROOT, ".env.local"), "utf8").catch(() => "");
  const match = raw.match(/^\s*BLOB_READ_WRITE_TOKEN\s*=\s*"?([^"\n]+)"?/m);
  return match?.[1]?.trim() ?? "";
}

/** Every file under `dir`, as paths relative to it. */
async function walk(dir, base = dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const out = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full, base)));
    else if (entry.isFile() && !entry.name.startsWith(".")) {
      out.push({ full, rel: path.relative(base, full).split(path.sep).join("/") });
    }
  }
  return out;
}

const token = await loadToken();
if (!token) {
  console.error(
    "No BLOB_READ_WRITE_TOKEN found.\n" +
      "Connect a Blob store to the project in the Vercel dashboard\n" +
      "(Storage → Create → Blob → connect), then run:\n\n" +
      "  vercel env pull .env.local\n",
  );
  process.exit(1);
}

// `.cms-data/cms/...` maps onto the same key in Blob; uploads map onto
// `cms/media/<file>`, which is where `lib/cms/store.ts` reads them from.
const records = (await walk(path.join(FS_ROOT, "cms"))).map((f) => ({
  ...f,
  key: `cms/${f.rel}`,
  type: "application/json",
}));
const media = (await walk(FS_UPLOADS)).map((f) => ({
  ...f,
  key: `${MEDIA_PREFIX}${f.rel}`,
  type: "application/octet-stream",
}));
const files = [...records, ...media];

if (files.length === 0) {
  console.log("Nothing in .cms-data/ or public/uploads/ to push.");
  process.exit(0);
}

const remote = new Set(
  (await list({ token, limit: 1000 })).blobs.map((b) => b.pathname),
);

console.log(`Local: ${files.length} file(s). Already in Blob: ${remote.size}.\n`);

let sent = 0;
let skipped = 0;

for (const file of files) {
  const exists = remote.has(file.key);
  if (exists && !force) {
    console.log(`  skip   ${file.key} (already in Blob — use --force to replace)`);
    skipped += 1;
    continue;
  }
  if (!write) {
    console.log(`  would  ${file.key}${exists ? " (replace)" : ""}`);
    continue;
  }
  const body = await fs.readFile(file.full);
  await put(file.key, body, {
    token,
    access: "public",
    contentType: file.type,
    // The pathname is the identity, exactly as in lib/cms/store.ts.
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  console.log(`  sent   ${file.key}`);
  sent += 1;
}

console.log(
  write
    ? `\nDone. ${sent} sent, ${skipped} skipped.`
    : `\nDry run. Re-run with --write to send. ${skipped} would be skipped.`,
);

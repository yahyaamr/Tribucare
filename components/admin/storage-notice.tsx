import { AlertTriangle } from "lucide-react";
import type { AdminStrings } from "@/lib/i18n/admin-strings";

/**
 * The one piece of setup this panel cannot do for itself.
 *
 * Vercel's filesystem is read-only, so without a Blob store every post and
 * upload is written to a disk that is discarded on the next deploy. Locally
 * that fallback is exactly what you want; in production it is silent data
 * loss, so it is called out here rather than discovered later.
 *
 * Both sentences name a path or a menu route inside them, so each is one string
 * with placeholders rather than fragments concatenated around a `<code>`. Word
 * order around those values is not the same in both languages, and fragments
 * can only be right in one.
 */
function interpolate(
  template: string,
  parts: Record<string, React.ReactNode>,
): React.ReactNode[] {
  return template
    .split(/(\{\w+\})/g)
    .map((chunk, i) => {
      const key = /^\{(\w+)\}$/.exec(chunk)?.[1];
      if (!key || !(key in parts)) return chunk;
      return <span key={`${key}-${i}`}>{parts[key]}</span>;
    });
}

export function StorageNotice({
  configured,
  t,
}: {
  configured: boolean;
  t: AdminStrings["storage"];
}) {
  if (configured) return null;

  const onVercel = Boolean(process.env.VERCEL);
  if (!onVercel) {
    return (
      <p className="mt-6 rounded-xl border border-brand-200 bg-brand-50/60 px-4 py-3 text-xs leading-relaxed text-ink-soft">
        {interpolate(t.localBody, {
          data: <code className="font-mono">.cms-data/</code>,
          uploads: <code className="font-mono">public/uploads/</code>,
        })}
      </p>
    );
  }

  return (
    <div className="mt-6 flex gap-3 rounded-xl border border-signal-500/40 bg-signal-500/10 p-4">
      <AlertTriangle
        className="mt-0.5 size-4.5 shrink-0 text-signal-600"
        aria-hidden="true"
      />
      <div className="text-sm leading-relaxed text-ink">
        <p className="font-semibold">{t.warningTitle}</p>
        <p className="mt-1 text-ink-soft">
          {interpolate(t.warningBody, {
            token: (
              <code className="font-mono text-xs">BLOB_READ_WRITE_TOKEN</code>
            ),
            steps: <strong>Storage → Create → Blob</strong>,
          })}
        </p>
      </div>
    </div>
  );
}

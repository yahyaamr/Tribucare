import { AlertTriangle } from "lucide-react";

/**
 * The one piece of setup this panel cannot do for itself.
 *
 * Vercel's filesystem is read-only, so without a Blob store every post and
 * upload is written to a disk that is discarded on the next deploy. Locally
 * that fallback is exactly what you want; in production it is silent data
 * loss, so it is called out here rather than discovered later.
 */
export function StorageNotice({ configured }: { configured: boolean }) {
  if (configured) return null;

  const onVercel = Boolean(process.env.VERCEL);
  if (!onVercel) {
    return (
      <p className="mt-6 rounded-xl border border-brand-200 bg-brand-50/60 px-4 py-3 text-xs leading-relaxed text-ink-soft">
        Running locally — posts are saved to{" "}
        <code className="font-mono">.cms-data/</code> and images to{" "}
        <code className="font-mono">public/uploads/</code>. Nothing extra to set
        up.
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
        <p className="font-semibold">Connect a Blob store before writing.</p>
        <p className="mt-1 text-ink-soft">
          This deployment has no{" "}
          <code className="font-mono text-xs">BLOB_READ_WRITE_TOKEN</code>, so
          anything saved here will be lost on the next deploy. In your Vercel
          project open <strong>Storage → Create → Blob</strong>, connect it to
          this project, then redeploy.
        </p>
      </div>
    </div>
  );
}

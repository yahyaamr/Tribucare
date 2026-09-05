import { cn } from "@/lib/utils";
import type { PostStatus } from "@/lib/cms/types";
import type { AdminStrings } from "@/lib/i18n/admin-strings";

/** Draft vs published, in the two states the panel ever needs. Kept as its own
 *  component because the list, the dashboard and the editor all show it. */
export function StatusPill({
  status,
  labels,
  className,
}: {
  status: PostStatus;
  /** Optional so the many call sites inside the English-only editor need no
   *  change; the shell and list pass the reader's own. */
  labels?: AdminStrings["status"];
  className?: string;
}) {
  const text =
    status === "published"
      ? (labels?.published ?? "Published")
      : (labels?.draft ?? "Draft");
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-[0.6875rem] font-semibold tracking-wide uppercase",
        status === "published"
          ? "bg-brand-50 text-brand-800"
          : "bg-signal-500/15 text-signal-600",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full",
          status === "published" ? "bg-brand-600" : "bg-signal-500",
        )}
      />
      {text}
    </span>
  );
}

"use client";

import { cn } from "@/lib/utils";
import type { PostStatus } from "@/lib/cms/types";
import type { AdminStrings } from "@/lib/i18n/admin-strings";
import { useAdminStrings } from "@/components/admin/strings";

/**
 * Draft vs published, in the two states the panel ever needs. Kept as its own
 * component because the list, the dashboard and the editor all show it.
 *
 * It reads the panel's language from context rather than taking it as a prop:
 * the pill appears on nearly every screen, including inside server-rendered
 * lists, and threading a label pair through each of them was what left it
 * reading "PUBLISHED" on an Arabic panel. `labels` is still accepted so a
 * caller that already holds the bundle can pass it.
 */
export function StatusPill({
  status,
  labels,
  className,
}: {
  status: PostStatus;
  labels?: AdminStrings["status"];
  className?: string;
}) {
  const t = useAdminStrings();
  const resolved = labels ?? t.status;
  const text = status === "published" ? resolved.published : resolved.draft;
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

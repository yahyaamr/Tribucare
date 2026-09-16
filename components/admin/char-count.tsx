"use client";

import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { fill, useAdminStrings } from "@/components/admin/strings";

/**
 * The character counter under an SEO field.
 *
 * A recommendation, never a cap. The fields it sits under have no `maxLength`
 * on purpose: 60 and 160 are where Google *truncates* a title and a
 * description, not where either becomes wrong, and a long title that reads
 * well truncated is a legitimate choice a panel should not be able to veto.
 * So going over is allowed, and only ever *said*.
 *
 * Under the limit it reads as the quiet hint it always was. Over it, it turns
 * into the site's one warning treatment — `signal-600` and the `TriangleAlert`
 * the delete confirmation and the storage notice already use — and names the
 * overage rather than only the count, because "72 characters" leaves the writer
 * to do the subtraction against a number they may not remember.
 *
 * `aria-live="polite"` so the warning is announced rather than only drawn.
 * Polite, not assertive: it waits for a pause instead of interrupting every
 * keystroke.
 */
export function CharCount({
  value,
  limit,
  /** The hint shown while inside the limit, with `{n}` for the count. */
  okTemplate,
}: {
  value: string;
  limit: number;
  okTemplate: string;
}) {
  const t = useAdminStrings().editor;
  const n = value.length;
  const over = n - limit;

  return (
    <p
      aria-live="polite"
      className={cn(
        "mt-1 flex items-center gap-1.5 text-xs",
        over > 0 ? "font-medium text-signal-600" : "text-ink-faint",
      )}
    >
      {over > 0 && (
        <TriangleAlert className="size-3 shrink-0" aria-hidden="true" />
      )}
      {over > 0
        ? fill(t.charsOverLimit, { n, over, limit })
        : fill(okTemplate, { n })}
    </p>
  );
}

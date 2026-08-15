import { cn } from "@/lib/utils";

/** Page gutter. One place to change the site's horizontal rhythm. */
export function Shell({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[86rem] px-5 sm:px-8 lg:px-12 xl:px-16",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** The deck's small-caps annotation, with the orange trace tick. */
export function Eyebrow({
  children,
  tone = "dark",
  className,
}: {
  children: React.ReactNode;
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <p
      className={cn(
        // `items-start` rather than `items-center`: when the label wraps at
        // narrow widths, centring floats the trace tick into the middle of the
        // block instead of leaving it against the first line.
        "eyebrow flex items-start gap-2.5 max-sm:text-[0.625rem] max-sm:tracking-[0.14em]",
        tone === "light" ? "text-brand-200" : "text-brand-600",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="mt-[0.45em] inline-block h-px w-6 shrink-0 bg-signal-500"
      />
      <span className="min-w-0">{children}</span>
    </p>
  );
}

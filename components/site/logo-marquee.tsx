import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ContentData } from "@/content/en";

/**
 * A row of brand marks gliding sideways in an endless loop, straight on the
 * section's ground — no panel — with both ends fading out (`logo-marquee`).
 *
 * `tone="dark"` is for `ground-deep`: most marks are dark ink on transparent
 * and all but vanish there, so they are drawn as white silhouettes. `light`
 * keeps each brand's own colours.
 *
 * Each half of the track is the list twice over, so a half is always wider
 * than the frame and the loop never shows a gap, however few brands there
 * are. The second half is a visual repeat only: `aria-hidden`, empty alts.
 * Marks share one height, never one box, per the brand-mark rule.
 */
export function LogoMarquee({
  names,
  brandLogos,
  label,
  tone = "light",
}: {
  names: readonly string[];
  brandLogos: ContentData["brandLogos"];
  label: string;
  tone?: "light" | "dark";
}) {
  const set = [...names, ...names];

  const half = (hidden: boolean) => (
    <ul
      aria-label={hidden ? undefined : label}
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center gap-14 pe-14 md:gap-20 md:pe-20"
    >
      {set.map((name, i) => {
        const logo = brandLogos[name];
        const repeat = hidden || i >= names.length;
        return (
          <li
            key={`${name}-${i}`}
            aria-hidden={!hidden && repeat ? true : undefined}
            className="flex h-14 shrink-0 items-center"
          >
            {logo ? (
              <Image
                src={logo.src}
                alt={repeat ? "" : name}
                width={logo.width}
                height={logo.height}
                className={cn(
                  "h-9 w-auto max-w-[10rem] object-contain md:h-11 md:max-w-[12rem]",
                  tone === "dark" && "brightness-0 invert",
                )}
              />
            ) : (
              <span
                className={cn(
                  "font-display text-lg font-semibold",
                  tone === "dark" ? "text-white" : "text-ink",
                )}
              >
                {name}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div dir="ltr" className="logo-marquee overflow-hidden">
      <div
        className="logo-marquee-track flex w-max"
        style={
          { "--marquee-duration": `${set.length * 4}s` } as React.CSSProperties
        }
      >
        {half(false)}
        {half(true)}
      </div>
    </div>
  );
}

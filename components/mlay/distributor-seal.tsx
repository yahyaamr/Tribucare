import { cn } from "@/lib/utils";
import { content } from "@/content/server";

/**
 * The zigzagged edge, computed once at module scope rather than typed out as a
 * 1KB path literal — the tooth count and the two radii are the only things
 * anyone would ever want to change, and here they are readable.
 *
 * Alternating points on two concentric circles, starting at twelve o'clock.
 */
const ZIGZAG = (() => {
  const teeth = 36;
  const outer = 99;
  const inner = 90;
  const points = Array.from({ length: teeth * 2 }, (_, i) => {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / teeth - Math.PI / 2;
    return `${(100 + r * Math.cos(a)).toFixed(2)} ${(100 + r * Math.sin(a)).toFixed(2)}`;
  });
  return `M ${points.join(" L ")} Z`;
})();

/**
 * The exclusive-distributor seal on the MLAY hero.
 *
 * A stamp has no precedent on the site, so rather than invent a treatment it is
 * assembled from vocabulary that already exists: it is a white plate on a deep
 * ground — the same pairing every card on the site uses — carrying the mono
 * `eyebrow` face for the curved lettering, `font-display` for the mark, and the
 * `signal-500` trace tick the <Eyebrow> component already uses as its accent.
 * The drop shadow is BrandPlate's, to the value. No new colour or curve enters
 * the system.
 *
 * Drawn rather than imaged: an SVG keeps it crisp at any size and costs nothing
 * against the page-weight budget.
 *
 * Authenticity comes from the things a real stamp has and a graphic badge does
 * not: a zigzagged edge, concentric rules, lettering that follows the circle
 * instead of sitting on a baseline, separator glyphs at the three and nine
 * o'clock joins between the two arcs, and a few degrees of rotation so it reads
 * as pressed onto the page rather than laid out on it.
 */
export async function DistributorSeal({ className }: { className?: string }) {
  const { mlay } = await content();

  const seal = mlay.seal;

  return (
    <div
      className={cn(
        "relative inline-flex size-[9.35rem] shrink-0 -rotate-6 items-center justify-center md:size-[11rem]",
        className,
      )}
      role="img"
      aria-label={`${seal.ring} — ${seal.mark}, ${seal.subline}`}
    >
      {/* Plate, rules and curved lettering. */}
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 size-full text-brand-700 drop-shadow-[0_10px_24px_rgb(7_42_42/0.45)]"
        aria-hidden="true"
      >
        <defs>
          {/* Upper arc runs start-to-right over the top; the lower arc is drawn
              in the opposite direction so its text sits upright underneath
              rather than upside down. */}
          <path
            id="seal-arc-top"
            fill="none"
            d="M 26 100 A 74 74 0 0 1 174 100"
          />
          <path
            id="seal-arc-bottom"
            fill="none"
            d="M 24 100 A 76 76 0 0 0 176 100"
          />
        </defs>

        <path d={ZIGZAG} fill="#ffffff" />

        <circle
          cx="100"
          cy="100"
          r="86"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.4"
          strokeWidth="1.5"
        />
        <circle
          cx="100"
          cy="100"
          r="66"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.4"
          strokeWidth="1.5"
        />

        <text
          className="font-mono seal-arc seal-arc-top"
          fill="currentColor"
          fontSize="11.5"
          fontWeight="600"
          letterSpacing="2"
        >
          <textPath href="#seal-arc-top" startOffset="50%" textAnchor="middle">
            {seal.arcTop}
          </textPath>
        </text>
        <text
          className="font-mono seal-arc seal-arc-bottom"
          fill="currentColor"
          fillOpacity="0.7"
          fontSize="8"
          fontWeight="500"
          letterSpacing="1.5"
        >
          <textPath
            href="#seal-arc-bottom"
            startOffset="50%"
            textAnchor="middle"
          >
            {seal.arcBottom}
          </textPath>
        </text>

        {/* Separator glyphs at the joins between the two arcs. */}
        <g className="text-signal-500" fill="currentColor">
          <circle cx="21" cy="100" r="2.4" />
          <circle cx="179" cy="100" r="2.4" />
        </g>
      </svg>

      {/* Core. */}
      <span className="relative flex flex-col items-center leading-none">
        <span className="font-display text-[1.15rem] font-semibold tracking-[0.14em] text-ink md:text-[1.35rem]">
          {seal.mark}
        </span>
        <span
          aria-hidden="true"
          className="mt-1.5 block h-px w-7 bg-signal-500"
        />
        <span className="mt-1.5 font-mono text-[0.4375rem] font-medium tracking-[0.16em] text-brand-700/80 uppercase md:text-[0.5rem]">
          {seal.subline}
        </span>
      </span>
    </div>
  );
}

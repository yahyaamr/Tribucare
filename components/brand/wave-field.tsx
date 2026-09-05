"use client";

import { cn } from "@/lib/utils";

const W = 1200;
const H = 420;
/** Integer period count so the field tiles seamlessly for the drift loop. */
const PERIODS = 2;
const SAMPLES = 60;

/**
 * Whole units. The field is drawn at 2400 units across, so a unit is under a
 * pixel at any width the site renders and half a unit — the most rounding can
 * move a point — is below what anti-aliasing resolves on a 0.9-unit stroke.
 * Every x is already a multiple of 10; the decimal on y was the last of the
 * padding.
 */
function fmt(n: number) {
  return String(Math.round(n));
}

function smoothPath(points: [number, number][]) {
  let d = `M${fmt(points[0][0])} ${fmt(points[0][1])}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [x, y] = points[i];
    const [nx, ny] = points[i + 1];
    d += ` Q${fmt(x)} ${fmt(y)} ${fmt((x + nx) / 2)} ${fmt((y + ny) / 2)}`;
  }
  const [lx, ly] = points[points.length - 1];
  return `${d} L${fmt(lx)} ${fmt(ly)}`;
}

function buildLines(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 0 : i / (count - 1);
    const amplitude = 16 + t * 34;
    const baseline = H * 0.28 + t * H * 0.5;
    const phase = t * 2.7;

    const points: [number, number][] = [];
    for (let s = 0; s <= SAMPLES; s++) {
      const x = (s / SAMPLES) * W;
      const y =
        baseline +
        Math.sin((x / W) * Math.PI * 2 * PERIODS + phase) * amplitude;
      points.push([x, y]);
    }
    return smoothPath(points);
  });
}

/**
 * The deck's thin-stroke wave field. The optional drift is a single
 * GPU-composited transform on one group, and is neutralised under
 * prefers-reduced-motion.
 *
 * ## Why this is a client component
 *
 * The geometry is deterministic and cheap, but as markup it is not small: a
 * 26-line field is 26 paths of ~1.5KB each. Rendered as a server component that
 * markup shipped twice — once in the HTML and again, verbatim, inside the RSC
 * payload the client needs to hydrate — and with a dozen fields on the
 * homepage the two copies came to over 900KB of a 1.1MB document. As a client
 * component the HTML is still server-rendered (nothing pops in), but the
 * payload carries `lines` and `tone` instead of the paths, and the browser
 * regenerates them from a few hundred bytes of code.
 *
 * The second tile is a `<use>` of the first rather than a second copy of every
 * path, for the same reason.
 *
 * **Position it with `left-`, never `inset-x-` or `start-`.** The field is a
 * brand texture, not a directional element: it reads the same in both locales
 * and has no Arabic variant. Two things break that if the positioning is
 * logical:
 *
 * - Every call site pairs its inset with an explicit width (`w-[200%]` and
 *   friends). `inset-x-0` sets both `left` and `right`, so with a width the box
 *   is over-constrained, and CSS drops whichever side the *containing block's*
 *   direction says to — `right` under LTR, `left` under RTL. Under Arabic the
 *   field therefore anchored to the opposite edge and left a bare gap where the
 *   overflow used to be.
 * - `start-0` mirrors outright, which moves the texture out from under the
 *   content it was drawn to sit beneath.
 *
 * A physical `left-0` is what LTR already resolved to, so this is the geometry
 * the design was drawn at, now in both directions.
 */
export function WaveField({
  className,
  lines = 24,
  tone = "light",
  animate = true,
}: {
  className?: string;
  lines?: number;
  tone?: "light" | "dark";
  animate?: boolean;
}) {
  const paths = buildLines(lines);
  const stroke = tone === "dark" ? "#7fdcec" : "#45b2af";
  // Ids repeat across instances with the same tone and line count. That is
  // safe: a reference resolves to the first definition in the document, and
  // every definition carrying the same id is identical.
  const linesId = `wf-lines-${tone}-${lines}`;

  return (
    <svg
      viewBox={`0 0 ${W * 2} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
      aria-hidden="true"
      focusable="false"
      className={cn("pointer-events-none select-none", className)}
    >
      <defs>
        <linearGradient id={`wf-fade-${tone}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="22%" stopColor="#fff" stopOpacity="1" />
          <stop offset="78%" stopColor="#fff" stopOpacity="1" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={`wf-mask-${tone}`}>
          <rect
            width={W * 2}
            height={H}
            fill={`url(#wf-fade-${tone})`}
          />
        </mask>
        <g id={linesId}>
          {paths.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={stroke}
              strokeWidth="0.9"
              opacity={0.16 + (i / paths.length) * 0.36}
            />
          ))}
        </g>
      </defs>

      <g mask={`url(#wf-mask-${tone})`}>
        <g className={animate ? "wave-drift" : undefined}>
          <use href={`#${linesId}`} />
          <use href={`#${linesId}`} x={W} />
        </g>
      </g>
    </svg>
  );
}

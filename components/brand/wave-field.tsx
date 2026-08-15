import { cn } from "@/lib/utils";

const W = 1200;
const H = 420;
/** Integer period count so the field tiles seamlessly for the drift loop. */
const PERIODS = 2;
const SAMPLES = 60;

function smoothPath(points: [number, number][]) {
  let d = `M${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [x, y] = points[i];
    const [nx, ny] = points[i + 1];
    d += ` Q${x.toFixed(1)} ${y.toFixed(1)} ${((x + nx) / 2).toFixed(1)} ${(
      (y + ny) / 2
    ).toFixed(1)}`;
  }
  const [lx, ly] = points[points.length - 1];
  return `${d} L${lx.toFixed(1)} ${ly.toFixed(1)}`;
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
 * The deck's thin-stroke wave field. Rendered on the server as static SVG —
 * ships zero JavaScript. The optional drift is a single GPU-composited
 * transform on one group, and is neutralised under prefers-reduced-motion.
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
      </defs>

      <g mask={`url(#wf-mask-${tone})`}>
        <g className={animate ? "wave-drift" : undefined}>
          {[0, W].map((offset) => (
            <g key={offset} transform={`translate(${offset} 0)`}>
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
          ))}
        </g>
      </g>
    </svg>
  );
}

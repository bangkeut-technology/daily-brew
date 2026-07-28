"use client";

/**
 * Bare trend line for a stat tile — no axes, no labels, no tooltip. It says
 * "shape of the last N days" and nothing more; the exact numbers live in the
 * trend chart's table view.
 *
 * `preserveAspectRatio="none"` lets it stretch to any tile width; the stroke
 * survives that squash thanks to `vector-effect`, and the end marker is a real
 * DOM circle rather than an SVG one so it can't be squashed into an ellipse.
 */
export function Sparkline({
  values,
  color = "var(--db-chart-ontime)",
  height = 28,
}: {
  values: number[];
  color?: string;
  height?: number;
}) {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  // A flat series would divide by zero; draw it down the middle instead.
  const span = max - min || 1;
  const points = values.map((value, i) => {
    const x = (i / (values.length - 1)) * 100;
    const y = max === min ? 50 : 100 - ((value - min) / span) * 100;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  const lastY = Number(points[points.length - 1].split(",")[1]);

  return (
    <div className="relative w-full" style={{ height }} aria-hidden>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-full w-full overflow-visible"
      >
        <polyline
          points={points.join(" ")}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          opacity={0.45}
        />
      </svg>
      <span
        className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-glass-bg"
        style={{ left: "100%", top: `${lastY}%`, backgroundColor: color }}
      />
    </div>
  );
}

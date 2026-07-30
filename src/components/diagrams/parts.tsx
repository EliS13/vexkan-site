import React from "react";
import { SCHEMES, Scheme } from "@/lib/schemes";

export { SCHEMES };
export type { Scheme };

export const INK = "#171717";
export const MUTED = "#737373";



/** Arrowhead markers, one per scheme, so arrows can match their line colour. */
export function Defs() {
  return (
    <defs>
      {(Object.keys(SCHEMES) as Scheme[]).map((key) => (
        <marker
          key={key}
          id={`arrow-${key}`}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={SCHEMES[key].solid} />
        </marker>
      ))}
      <marker id="arrow-ink" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill={MUTED} />
      </marker>
    </defs>
  );
}

export function Card({
  x,
  y,
  w,
  h,
  scheme = "neutral",
  filled = true,
  radius = 10,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  scheme?: Scheme;
  filled?: boolean;
  radius?: number;
}) {
  const s = SCHEMES[scheme];
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={radius}
      fill={filled ? s.bg : "#ffffff"}
      stroke={s.solid}
      strokeWidth={1.5}
    />
  );
}

export function T({
  x,
  y,
  children,
  size = 13,
  weight = 400,
  fill = INK,
  anchor = "middle",
}: {
  x: number;
  y: number;
  children: React.ReactNode;
  size?: number;
  weight?: number | string;
  fill?: string;
  anchor?: "start" | "middle" | "end";
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      fontWeight={weight}
      fill={fill}
      textAnchor={anchor}
      dominantBaseline="middle"
      style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}
    >
      {children}
    </text>
  );
}

export function Arrow({
  x1,
  y1,
  x2,
  y2,
  scheme = "neutral",
  dashed = false,
  curve,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  scheme?: Scheme | "ink";
  dashed?: boolean;
  curve?: number;
}) {
  const color = scheme === "ink" ? MUTED : SCHEMES[scheme].solid;
  const d =
    curve === undefined
      ? `M ${x1} ${y1} L ${x2} ${y2}`
      : `M ${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2 + curve} ${x2} ${y2}`;
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={1.75}
      strokeDasharray={dashed ? "5 4" : undefined}
      markerEnd={`url(#arrow-${scheme})`}
    />
  );
}

/** A small pill label, used for badges inside diagrams. */
export function Pill({
  x,
  y,
  label,
  scheme = "purple",
  w,
}: {
  x: number;
  y: number;
  label: string;
  scheme?: Scheme;
  w?: number;
}) {
  const s = SCHEMES[scheme];
  const width = w ?? Math.max(44, label.length * 7 + 16);
  return (
    <g>
      <rect x={x - width / 2} y={y - 10} width={width} height={20} rx={10} fill={s.bg} />
      <T x={x} y={y} size={11} weight={700} fill={s.text}>
        {label.toUpperCase()}
      </T>
    </g>
  );
}

export function Gear({ cx, cy, r, teeth = 8, color }: { cx: number; cy: number; r: number; teeth?: number; color: string }) {
  const spokes = Array.from({ length: teeth }, (_, i) => {
    const a = (i / teeth) * Math.PI * 2;
    return (
      <line
        key={i}
        x1={cx + Math.cos(a) * r}
        y1={cy + Math.sin(a) * r}
        x2={cx + Math.cos(a) * (r + 5)}
        y2={cy + Math.sin(a) * (r + 5)}
        stroke={color}
        strokeWidth={3.5}
        strokeLinecap="round"
      />
    );
  });
  return (
    <g>
      {spokes}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={2.5} />
      <circle cx={cx} cy={cy} r={3} fill={color} />
    </g>
  );
}

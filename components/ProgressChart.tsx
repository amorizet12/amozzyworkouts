"use client";

import { useRef, useState } from "react";
import { format, parseISO } from "date-fns";

interface ChartPoint {
  date: string;
  value: number;
}

interface ProgressChartProps {
  points: ChartPoint[];
  unit: string;
  formatValue?: (value: number) => string;
}

const VIEW_W = 600;
const VIEW_H = 240;
const MARGIN = { top: 24, right: 14, bottom: 28, left: 46 };
const PLOT_W = VIEW_W - MARGIN.left - MARGIN.right;
const PLOT_H = VIEW_H - MARGIN.top - MARGIN.bottom;

// Read as CSS vars so the chart follows the user's chosen theme/accent color.
const SURFACE = "rgb(var(--base-900))";
const GRID = "rgb(var(--base-700))";
const AXIS_TEXT = "rgb(var(--base-400))";
const ACCENT = "rgb(var(--accent-400))";
const HOVER_LINE = "rgb(var(--base-600))";
const VALUE_TEXT = "rgb(var(--base-100))";

export default function ProgressChart({ points, unit, formatValue }: ProgressChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const fmt = formatValue ?? ((v: number) => Math.round(v).toLocaleString());

  if (points.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-xl border border-dashed border-base-700 text-[13px] text-base-500">
        No sets logged yet for this exercise.
      </div>
    );
  }

  const values = points.map((p) => p.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const range = rawMax - rawMin || rawMax * 0.1 || 1;
  const minV = Math.max(0, rawMin - range * 0.15);
  const maxV = rawMax + range * 0.15;

  const n = points.length;
  const xAt = (i: number) => MARGIN.left + (n === 1 ? PLOT_W / 2 : (i / (n - 1)) * PLOT_W);
  const yAt = (v: number) => MARGIN.top + PLOT_H - ((v - minV) / (maxV - minV)) * PLOT_H;

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(p.value)}`).join(" ");

  const gridValues = [minV, (minV + maxV) / 2, maxV];

  const updateHoverFromClientX = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const relX = ((clientX - rect.left) / rect.width) * VIEW_W;
    let nearest = 0;
    let nearestDist = Infinity;
    points.forEach((_, i) => {
      const d = Math.abs(xAt(i) - relX);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = i;
      }
    });
    setHoverIndex(nearest);
  };

  const hovered = hoverIndex != null ? points[hoverIndex] : null;
  const lastPoint = points[points.length - 1];

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full touch-none"
        onPointerDown={(e) => updateHoverFromClientX(e.clientX)}
        onPointerMove={(e) => updateHoverFromClientX(e.clientX)}
        onPointerUp={(e) => {
          if (e.pointerType === "touch") setHoverIndex(null);
        }}
        onPointerLeave={() => setHoverIndex(null)}
      >
        {gridValues.map((v, i) => (
          <g key={i}>
            <line
              x1={MARGIN.left}
              x2={VIEW_W - MARGIN.right}
              y1={yAt(v)}
              y2={yAt(v)}
              style={{ stroke: GRID }}
              strokeWidth={1}
            />
            <text x={MARGIN.left - 8} y={yAt(v)} dy={4} textAnchor="end" fontSize={10} style={{ fill: AXIS_TEXT }}>
              {fmt(v)}
            </text>
          </g>
        ))}

        <text x={MARGIN.left} y={VIEW_H - 8} fontSize={10} style={{ fill: AXIS_TEXT }}>
          {format(parseISO(points[0].date), "MMM d")}
        </text>
        <text x={VIEW_W - MARGIN.right} y={VIEW_H - 8} textAnchor="end" fontSize={10} style={{ fill: AXIS_TEXT }}>
          {format(parseISO(lastPoint.date), "MMM d")}
        </text>

        <path
          d={linePath}
          fill="none"
          style={{ stroke: ACCENT }}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((p, i) => (
          <circle
            key={p.date}
            cx={xAt(i)}
            cy={yAt(p.value)}
            r={i === hoverIndex ? 6 : 4}
            style={{ fill: ACCENT, stroke: SURFACE }}
            strokeWidth={2}
          />
        ))}

        <text
          x={xAt(n - 1)}
          y={yAt(lastPoint.value) - 12}
          textAnchor="end"
          fontSize={11}
          fontWeight={600}
          style={{ fill: VALUE_TEXT }}
        >
          {fmt(lastPoint.value)}
          {unit}
        </text>

        {hovered && (
          <line
            x1={xAt(hoverIndex!)}
            x2={xAt(hoverIndex!)}
            y1={MARGIN.top}
            y2={VIEW_H - MARGIN.bottom}
            style={{ stroke: HOVER_LINE }}
            strokeWidth={1}
          />
        )}
      </svg>

      {hovered && hoverIndex != null && (
        <div
          className="pointer-events-none absolute rounded-md border border-base-700/60 bg-base-950 px-2 py-1 text-[11px] shadow-lg"
          style={{
            left: `${(xAt(hoverIndex) / VIEW_W) * 100}%`,
            top: `${(Math.max(MARGIN.top, yAt(hovered.value) - 40) / VIEW_H) * 100}%`,
            transform: "translateX(-50%)",
          }}
        >
          <p className="font-semibold text-base-100">
            {fmt(hovered.value)}
            {unit}
          </p>
          <p className="text-base-500">{format(parseISO(hovered.date), "MMM d, yyyy")}</p>
        </div>
      )}
    </div>
  );
}

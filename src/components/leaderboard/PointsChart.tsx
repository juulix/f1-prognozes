"use client";

import { useState, useEffect } from "react";

interface PointsData {
  round: number;
  name: string;
  [userName: string]: number | string;
}

interface PointsChartProps {
  data: PointsData[];
  userNames: string[];
}

const CHART_COLORS = [
  "#e10600", "#FF8000", "#3671C6", "#27F4D2", "#229971",
  "#E8002D", "#64C4FF", "#6692FF", "#52E252", "#B6BABD",
];

export function PointsChart({ data, userNames }: PointsChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || data.length === 0) {
    return (
      <div className="f1-card p-4 h-64 flex items-center justify-center text-muted-foreground text-sm">
        Grafiks parādīsies pēc pirmajiem rezultātiem
      </div>
    );
  }

  // Simple SVG line chart since recharts may have SSR issues
  const maxPoints = Math.max(...data.flatMap((d) => userNames.map((n) => (typeof d[n] === "number" ? d[n] as number : 0))));
  const chartW = 600;
  const chartH = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const w = chartW - padding.left - padding.right;
  const h = chartH - padding.top - padding.bottom;

  return (
    <div className="f1-card p-4">
      <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
        <span>📈</span> Punktu attīstība
      </h3>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full min-w-[400px]">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
            <g key={pct}>
              <line
                x1={padding.left}
                y1={padding.top + h * (1 - pct)}
                x2={padding.left + w}
                y2={padding.top + h * (1 - pct)}
                stroke="var(--border)"
                strokeWidth={0.5}
              />
              <text
                x={padding.left - 5}
                y={padding.top + h * (1 - pct) + 4}
                textAnchor="end"
                fill="var(--muted-foreground)"
                fontSize={9}
              >
                {Math.round(maxPoints * pct)}
              </text>
            </g>
          ))}

          {/* Lines per user */}
          {userNames.map((name, userIdx) => {
            const points = data.map((d, i) => {
              const val = typeof d[name] === "number" ? (d[name] as number) : 0;
              const x = padding.left + (i / Math.max(data.length - 1, 1)) * w;
              const y = padding.top + h - (maxPoints > 0 ? (val / maxPoints) * h : 0);
              return `${x},${y}`;
            });

            return (
              <polyline
                key={name}
                points={points.join(" ")}
                fill="none"
                stroke={CHART_COLORS[userIdx % CHART_COLORS.length]}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}

          {/* X-axis labels */}
          {data.map((d, i) => (
            <text
              key={i}
              x={padding.left + (i / Math.max(data.length - 1, 1)) * w}
              y={chartH - 5}
              textAnchor="middle"
              fill="var(--muted-foreground)"
              fontSize={8}
            >
              R{d.round}
            </text>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3">
        {userNames.map((name, i) => (
          <div key={name} className="flex items-center gap-1.5 text-xs">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
            />
            <span>{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

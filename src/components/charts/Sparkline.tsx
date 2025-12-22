import React, { useState } from "react";

interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
}

export function Sparkline({ values, width = 220, height = 48 }: SparklineProps) {
  const [tip, setTip] = useState<{ x: number; y: number; value: number; index: number } | null>(null);

  if (!values || values.length === 0) return <div className="text-xs text-muted-foreground">No data</div>;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = width / Math.max(1, values.length - 1);
  const points = values.map((v, i) => `${i * step},${height - ((v - min) / range) * height}`).join(' ');
  const last = values[values.length - 1];

  const handleMove = (e: React.MouseEvent) => {
    const container = (e.currentTarget as SVGElement).getBoundingClientRect();
    const mouseX = e.clientX - container.left;
    const idx = Math.max(0, Math.min(values.length - 1, Math.round(mouseX / step)));
    const x = idx * step;
    const y = height - ((values[idx] - min) / range) * height;
    setTip({ x, y, value: values[idx], index: idx });
  };

  const handleLeave = () => setTip(null);

  return (
    <div className="relative">
      <svg width={width} height={height} className="block" onMouseMove={handleMove} onMouseLeave={handleLeave}>
        <defs>
          <linearGradient id="spark-gradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline points={points} fill="none" stroke="#10b981" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        { }
        <polygon points={`${0},${height} ${points} ${(values.length - 1) * step},${height}`} fill="url(#spark-gradient)" />
        <circle cx={(values.length - 1) * step} cy={height - ((last - min) / range) * height} r={3} fill="#059669" />
      </svg>
      {tip && (
        <div style={{ left: tip.x + 8, top: tip.y - 24 }} className="absolute pointer-events-none z-50 bg-card border border-border rounded px-2 py-1 text-xs">
          {tip.value}
        </div>
      )}
    </div>
  );
}

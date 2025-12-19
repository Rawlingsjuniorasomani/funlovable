import React, { useState } from "react";

interface PieDatum {
  label: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: PieDatum[];
  size?: number;
}

export function PieChart({ data, size = 120 }: PieChartProps) {
  const [hover, setHover] = useState<{ x: number; y: number; label: string; value: number } | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let cumulative = 0;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2;

  const paths = data.map((d, i) => {
    const startAngle = (cumulative / total) * Math.PI * 2;
    cumulative += d.value;
    const endAngle = (cumulative / total) * Math.PI * 2;
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    const x1 = cx + radius * Math.cos(startAngle - Math.PI / 2);
    const y1 = cy + radius * Math.sin(startAngle - Math.PI / 2);
    const x2 = cx + radius * Math.cos(endAngle - Math.PI / 2);
    const y2 = cy + radius * Math.sin(endAngle - Math.PI / 2);
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    return { path, color: d.color || ['#06b6d4','#3b82f6','#f97316','#8b5cf6','#ec4899'][i % 5], label: d.label, value: d.value };
  });

  const handleMove = (e: React.MouseEvent, label: string, value: number) => {
    const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
    setHover({ x: e.clientX - rect.left, y: e.clientY - rect.top, label, value });
  };

  return (
    <div className="relative inline-block">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="inline-block">
        {paths.map((p, i) => (
          <g key={i}>
            <path
              d={p.path}
              fill={p.color}
              stroke="#fff"
              strokeWidth={hoverIndex === i ? 2 : 1}
              onMouseMove={(e) => { setHoverIndex(i); handleMove(e, p.label, p.value); }}
              onMouseLeave={() => { setHoverIndex(null); setHover(null); }}
            />
          </g>
        ))}
      </svg>
      {hover && (
        <div style={{ left: hover.x + 8, top: hover.y - 24 }} className="absolute pointer-events-none z-50 bg-card border border-border rounded px-2 py-1 text-xs">
          <div className="font-medium">{hover.label}</div>
          <div className="text-muted-foreground">{hover.value} subscribers</div>
        </div>
      )}
    </div>
  );
}

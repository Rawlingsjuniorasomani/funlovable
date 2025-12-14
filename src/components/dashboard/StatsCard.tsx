import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatsColor = "blue" | "green" | "purple" | "orange" | "pink" | "yellow" | "teal" | "red" | "indigo" | "cyan";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  color?: StatsColor;
  className?: string; // Allow custom classes
}

const colorStyles: Record<StatsColor, { bg: string; text: string; subtext: string; border: string; iconBg: string; trendPos: string; trendNeg: string }> = {
  blue: { bg: "bg-blue-600", text: "text-white", subtext: "text-blue-100", border: "border-blue-700", iconBg: "bg-white/20", trendPos: "text-blue-100", trendNeg: "text-blue-100" },
  green: { bg: "bg-emerald-600", text: "text-white", subtext: "text-emerald-100", border: "border-emerald-700", iconBg: "bg-white/20", trendPos: "text-emerald-100", trendNeg: "text-emerald-100" },
  purple: { bg: "bg-purple-600", text: "text-white", subtext: "text-purple-100", border: "border-purple-700", iconBg: "bg-white/20", trendPos: "text-purple-100", trendNeg: "text-purple-100" },
  orange: { bg: "bg-orange-600", text: "text-white", subtext: "text-orange-100", border: "border-orange-700", iconBg: "bg-white/20", trendPos: "text-orange-100", trendNeg: "text-orange-100" },
  pink: { bg: "bg-pink-600", text: "text-white", subtext: "text-pink-100", border: "border-pink-700", iconBg: "bg-white/20", trendPos: "text-pink-100", trendNeg: "text-pink-100" },
  yellow: { bg: "bg-yellow-500", text: "text-white", subtext: "text-yellow-50", border: "border-yellow-600", iconBg: "bg-white/20", trendPos: "text-yellow-50", trendNeg: "text-yellow-50" },
  teal: { bg: "bg-teal-600", text: "text-white", subtext: "text-teal-100", border: "border-teal-700", iconBg: "bg-white/20", trendPos: "text-teal-100", trendNeg: "text-teal-100" },
  red: { bg: "bg-red-600", text: "text-white", subtext: "text-red-100", border: "border-red-700", iconBg: "bg-white/20", trendPos: "text-red-100", trendNeg: "text-red-100" },
  indigo: { bg: "bg-indigo-600", text: "text-white", subtext: "text-indigo-100", border: "border-indigo-700", iconBg: "bg-white/20", trendPos: "text-indigo-100", trendNeg: "text-indigo-100" },
  cyan: { bg: "bg-cyan-600", text: "text-white", subtext: "text-cyan-100", border: "border-cyan-700", iconBg: "bg-white/20", trendPos: "text-cyan-100", trendNeg: "text-cyan-100" },
};


export function StatsCard({ title, value, subtitle, icon: Icon, trend, color = "blue", className }: StatsCardProps) {
  const styles = colorStyles[color] || colorStyles.blue;

  return (
    <div className={cn(
      "rounded-2xl p-6 shadow-md border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden",
      styles.bg,
      styles.border,
      className
    )}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />

      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1">
          <p className={cn("text-sm font-medium", styles.subtext)}>{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className={cn("text-3xl font-display font-bold", styles.text)}>{value}</h3>
          </div>
          {subtitle && <p className={cn("text-xs opacity-90", styles.subtext)}>{subtitle}</p>}

          {trend && (
            <div className={cn("flex items-center gap-1 text-sm font-medium mt-2", trend.positive ? styles.trendPos : styles.trendNeg)}>
              <span>{trend.positive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}% from last week</span>
            </div>
          )}
        </div>

        <div className={cn("p-3 rounded-xl shadow-sm backdrop-blur-sm", styles.iconBg, styles.text)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

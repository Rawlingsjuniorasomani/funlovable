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
  className?: string;
}

const colorStyles: Record<StatsColor, { bg: string; text: string; subtext: string; border: string; iconBg: string; trendPos: string; trendNeg: string }> = {
  blue: { bg: "bg-card hover:border-blue-200 dark:hover:border-blue-800", text: "text-foreground", subtext: "text-muted-foreground", border: "border-border", iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400", trendPos: "text-green-600", trendNeg: "text-red-500" },
  green: { bg: "bg-card hover:border-emerald-200 dark:hover:border-emerald-800", text: "text-foreground", subtext: "text-muted-foreground", border: "border-border", iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400", trendPos: "text-green-600", trendNeg: "text-red-500" },
  purple: { bg: "bg-card hover:border-purple-200 dark:hover:border-purple-800", text: "text-foreground", subtext: "text-muted-foreground", border: "border-border", iconBg: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400", trendPos: "text-green-600", trendNeg: "text-red-500" },
  orange: { bg: "bg-card hover:border-orange-200 dark:hover:border-orange-800", text: "text-foreground", subtext: "text-muted-foreground", border: "border-border", iconBg: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400", trendPos: "text-green-600", trendNeg: "text-red-500" },
  pink: { bg: "bg-card hover:border-pink-200 dark:hover:border-pink-800", text: "text-foreground", subtext: "text-muted-foreground", border: "border-border", iconBg: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400", trendPos: "text-green-600", trendNeg: "text-red-500" },
  yellow: { bg: "bg-card hover:border-yellow-200 dark:hover:border-yellow-800", text: "text-foreground", subtext: "text-muted-foreground", border: "border-border", iconBg: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400", trendPos: "text-green-600", trendNeg: "text-red-500" },
  teal: { bg: "bg-card hover:border-teal-200 dark:hover:border-teal-800", text: "text-foreground", subtext: "text-muted-foreground", border: "border-border", iconBg: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400", trendPos: "text-green-600", trendNeg: "text-red-500" },
  red: { bg: "bg-card hover:border-red-200 dark:hover:border-red-800", text: "text-foreground", subtext: "text-muted-foreground", border: "border-border", iconBg: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400", trendPos: "text-green-600", trendNeg: "text-red-500" },
  indigo: { bg: "bg-card hover:border-indigo-200 dark:hover:border-indigo-800", text: "text-foreground", subtext: "text-muted-foreground", border: "border-border", iconBg: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400", trendPos: "text-green-600", trendNeg: "text-red-500" },
  cyan: { bg: "bg-card hover:border-cyan-200 dark:hover:border-cyan-800", text: "text-foreground", subtext: "text-muted-foreground", border: "border-border", iconBg: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400", trendPos: "text-green-600", trendNeg: "text-red-500" },
};


export function StatsCard({ title, value, subtitle, icon: Icon, trend, color = "blue", className }: StatsCardProps) {
  const styles = colorStyles[color] || colorStyles.blue;

  return (
    <div className={cn(
      "rounded-2xl p-4 shadow-sm border transition-all duration-300 hover:shadow-md hover:-translate-y-1 relative overflow-hidden",
      styles.bg,
      styles.border,
      className
    )}>
      { }
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-gradient-to-br from-transparent to-black/5 dark:to-white/5 blur-2xl" />

      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1">
          <p className={cn("text-xs sm:text-sm font-medium", styles.subtext)}>{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className={cn("text-2xl sm:text-3xl font-display font-bold", styles.text)}>{value}</h3>
          </div>
          {subtitle && <p className={cn("text-xs opacity-90", styles.subtext)}>{subtitle}</p>}

          {trend && (
            <div className={cn("flex items-center gap-1 text-sm font-medium mt-2", trend.positive ? styles.trendPos : styles.trendNeg)}>
              <span>{trend.positive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}% from last week</span>
            </div>
          )}
        </div>

        <div className={cn("p-2 rounded-xl shadow-sm backdrop-blur-sm", styles.iconBg, styles.text)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  color?: "primary" | "secondary" | "tertiary" | "quaternary";
}

const colorClasses = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  tertiary: "bg-tertiary/10 text-tertiary",
  quaternary: "bg-quaternary/10 text-quaternary",
};

export function StatsCard({ title, value, subtitle, icon: Icon, trend, color = "primary" }: StatsCardProps) {
  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border card-hover group">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold font-display text-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          {trend && (
            <div className={cn("flex items-center gap-1 text-sm", trend.positive ? "text-secondary" : "text-destructive")}>
              <span>{trend.positive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}% from last week</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-lg transition-transform group-hover:scale-110", colorClasses[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

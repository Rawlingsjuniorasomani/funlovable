import { Zap, Flame, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useGamification } from "@/hooks/useGamification";
import { cn } from "@/lib/utils";

interface XPDisplayProps {
  compact?: boolean;
  className?: string;
}

export function XPDisplay({ compact = false, className }: XPDisplayProps) {
  const { xp, level, streak, getXPToNextLevel } = useGamification();
  const { current, required } = getXPToNextLevel();
  const progressPercent = (current / required) * 100;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary">
          <Star className="w-4 h-4" />
          <span className="text-sm font-bold">Lvl {level}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 text-accent">
          <Zap className="w-4 h-4" />
          <span className="text-sm font-bold">{xp.toLocaleString()} XP</span>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive">
            <Flame className="w-4 h-4" />
            <span className="text-sm font-bold">{streak}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("bg-card rounded-xl border border-border p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-tertiary flex items-center justify-center text-primary-foreground font-bold text-lg animate-glow">
            {level}
          </div>
          <div>
            <p className="font-semibold text-foreground">Level {level}</p>
            <p className="text-sm text-muted-foreground">{xp.toLocaleString()} XP total</p>
          </div>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-destructive/20 to-accent/20">
            <Flame className="w-5 h-5 text-destructive animate-pulse" />
            <span className="font-bold text-foreground">{streak} day streak!</span>
          </div>
        )}
      </div>
      
      <div className="space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress to Level {level + 1}</span>
          <span className="font-medium text-foreground">{current} / {required} XP</span>
        </div>
        <Progress value={progressPercent} className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-tertiary" />
      </div>
    </div>
  );
}

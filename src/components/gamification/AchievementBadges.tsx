import { Lock, Trophy } from "lucide-react";
import { ALL_ACHIEVEMENTS, useGamification } from "@/hooks/useGamification";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AchievementBadgesProps {
  showLocked?: boolean;
  maxDisplay?: number;
  className?: string;
}

export function AchievementBadges({ showLocked = true, maxDisplay, className }: AchievementBadgesProps) {
  const { achievements } = useGamification();
  
  const displayAchievements = showLocked 
    ? ALL_ACHIEVEMENTS 
    : ALL_ACHIEVEMENTS.filter((a) => achievements.includes(a.id));
  
  const limited = maxDisplay ? displayAchievements.slice(0, maxDisplay) : displayAchievements;
  const remaining = maxDisplay ? displayAchievements.length - maxDisplay : 0;

  return (
    <TooltipProvider>
      <div className={cn("flex flex-wrap gap-2", className)}>
        {limited.map((achievement) => {
          const unlocked = achievements.includes(achievement.id);
          
          return (
            <Tooltip key={achievement.id}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-300",
                    unlocked
                      ? "bg-gradient-to-br from-accent/20 to-primary/20 border-2 border-accent/30 animate-scale-in hover:scale-110 cursor-pointer"
                      : "bg-muted/50 border border-border/50 grayscale opacity-50"
                  )}
                >
                  {unlocked ? (
                    achievement.icon
                  ) : (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[200px]">
                <p className="font-semibold">{achievement.name}</p>
                <p className="text-xs text-muted-foreground">{achievement.description}</p>
                {!unlocked && (
                  <p className="text-xs text-accent mt-1">Keep going to unlock!</p>
                )}
              </TooltipContent>
            </Tooltip>
          );
        })}
        {remaining > 0 && (
          <div className="w-12 h-12 rounded-xl bg-muted/50 border border-border flex items-center justify-center">
            <span className="text-sm font-medium text-muted-foreground">+{remaining}</span>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

export function AchievementUnlockModal({ achievement, onClose }: { achievement: typeof ALL_ACHIEVEMENTS[0]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border p-8 text-center max-w-sm animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center animate-bounce-slow">
          <span className="text-5xl">{achievement.icon}</span>
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Trophy className="w-5 h-5 text-accent" />
          <span className="text-sm font-medium text-accent uppercase tracking-wider">Achievement Unlocked!</span>
        </div>
        <h3 className="text-2xl font-display font-bold text-foreground mb-2">{achievement.name}</h3>
        <p className="text-muted-foreground mb-6">{achievement.description}</p>
        <button
          onClick={onClose}
          className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
}

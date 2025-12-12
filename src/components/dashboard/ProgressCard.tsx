import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressCardProps {
  subject: string;
  progress: number;
  lessonsCompleted: number;
  totalLessons: number;
  color?: "primary" | "secondary" | "tertiary" | "quaternary";
  emoji?: string;
}

const progressColors = {
  primary: "[&>div]:bg-primary",
  secondary: "[&>div]:bg-secondary",
  tertiary: "[&>div]:bg-tertiary",
  quaternary: "[&>div]:bg-quaternary",
};

export function ProgressCard({ subject, progress, lessonsCompleted, totalLessons, color = "primary", emoji = "📚" }: ProgressCardProps) {
  return (
    <div className="bg-card rounded-xl p-5 border border-border card-hover">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl animate-bounce-gentle">{emoji}</span>
        <div>
          <h4 className="font-semibold text-foreground">{subject}</h4>
          <p className="text-sm text-muted-foreground">
            {lessonsCompleted} of {totalLessons} lessons
          </p>
        </div>
      </div>
      <Progress value={progress} className={cn("h-2", progressColors[color])} />
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-muted-foreground">{progress}% complete</span>
        {progress === 100 && (
          <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full animate-pulse">
            ✓ Completed
          </span>
        )}
      </div>
    </div>
  );
}

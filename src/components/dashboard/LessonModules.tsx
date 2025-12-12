import { Play, Lock, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  status: "completed" | "in-progress" | "locked" | "available";
  type: "video" | "quiz" | "reading";
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface LessonModulesProps {
  modules: Module[];
  onStartLesson?: (lessonId: string) => void;
}

const statusIcons = {
  completed: CheckCircle,
  "in-progress": Play,
  locked: Lock,
  available: Play,
};

const statusColors = {
  completed: "text-secondary bg-secondary/10",
  "in-progress": "text-primary bg-primary/10",
  locked: "text-muted-foreground bg-muted",
  available: "text-tertiary bg-tertiary/10",
};

export function LessonModules({ modules, onStartLesson }: LessonModulesProps) {
  return (
    <div className="space-y-6">
      {modules.map((module, moduleIndex) => (
        <div
          key={module.id}
          className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in"
          style={{ animationDelay: `${moduleIndex * 150}ms` }}
        >
          <div className="p-4 bg-gradient-to-r from-primary/10 to-tertiary/10 border-b border-border">
            <h3 className="font-display font-semibold text-foreground">
              Module {moduleIndex + 1}: {module.title}
            </h3>
          </div>
          <div className="divide-y divide-border">
            {module.lessons.map((lesson) => {
              const StatusIcon = statusIcons[lesson.status];
              return (
                <div
                  key={lesson.id}
                  className={cn(
                    "p-4 flex items-center justify-between transition-colors",
                    lesson.status !== "locked" && "hover:bg-muted/30 cursor-pointer"
                  )}
                  onClick={() => lesson.status !== "locked" && onStartLesson?.(lesson.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("p-2 rounded-lg", statusColors[lesson.status])}>
                      <StatusIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={cn("font-medium", lesson.status === "locked" ? "text-muted-foreground" : "text-foreground")}>
                        {lesson.title}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{lesson.duration}</span>
                        <span className="capitalize">• {lesson.type}</span>
                      </div>
                    </div>
                  </div>
                  {lesson.status === "available" && (
                    <Button size="sm" className="btn-bounce">
                      Start
                    </Button>
                  )}
                  {lesson.status === "in-progress" && (
                    <Button size="sm" variant="outline" className="btn-bounce">
                      Continue
                    </Button>
                  )}
                  {lesson.status === "completed" && (
                    <span className="text-sm text-secondary font-medium">✓ Done</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

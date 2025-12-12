import { Trophy, Clock, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizResult {
  id: string;
  subject: string;
  topic: string;
  score: number;
  totalQuestions: number;
  date: string;
  timeTaken: string;
}

interface QuizHistoryProps {
  quizzes: QuizResult[];
}

export function QuizHistory({ quizzes }: QuizHistoryProps) {
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-secondary bg-secondary/10";
    if (percentage >= 60) return "text-accent bg-accent/10";
    return "text-quaternary bg-quaternary/10";
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    return "F";
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border bg-muted/30">
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
          <Trophy className="w-5 h-5 text-star" />
          Quiz History
        </h3>
      </div>
      <div className="divide-y divide-border">
        {quizzes.map((quiz, index) => {
          const percentage = Math.round((quiz.score / quiz.totalQuestions) * 100);
          return (
            <div
              key={quiz.id}
              className="p-4 hover:bg-muted/30 transition-colors animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{quiz.topic}</h4>
                  <p className="text-sm text-muted-foreground">{quiz.subject}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {quiz.timeTaken}
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {quiz.score}/{quiz.totalQuestions}
                    </span>
                    <span>{quiz.date}</span>
                  </div>
                </div>
                <div className={cn("px-4 py-2 rounded-lg text-center", getScoreColor(percentage))}>
                  <span className="text-2xl font-bold font-display">{getGrade(percentage)}</span>
                  <p className="text-xs">{percentage}%</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

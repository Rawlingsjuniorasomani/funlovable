import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

export function StudentProgress() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">My Progress</h1>
        <p className="text-muted-foreground">Track your learning journey and achievements</p>
      </div>

      {/* Level Progress */}
      <div className="bg-gradient-to-r from-primary/10 via-tertiary/10 to-secondary/10 rounded-xl border border-primary/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-xl font-bold">Level 1</h3>
            <p className="text-muted-foreground">Beginner</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">XP to Next Level</p>
            <p className="font-bold text-primary">0 / 100 XP</p>
          </div>
        </div>
        <Progress value={0} className="h-4" />
        <p className="text-sm text-muted-foreground mt-2">100 XP to Level 2</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-2xl font-bold text-foreground">0</p>
          <p className="text-sm text-muted-foreground">Lessons</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-2xl font-bold text-secondary">0</p>
          <p className="text-sm text-muted-foreground">Quizzes</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-2xl font-bold text-star">0</p>
          <p className="text-sm text-muted-foreground">XP Earned</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-2xl font-bold text-tertiary">0</p>
          <p className="text-sm text-muted-foreground">Day Streak</p>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-display text-xl font-semibold mb-2">No Progress Yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Start learning to track your progress. Complete lessons and quizzes to earn XP and level up!
        </p>
        <Link to="/student/subjects">
          <Button>Start Learning</Button>
        </Link>
      </div>
    </div>
  );
}

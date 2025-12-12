import { Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function StudentAchievements() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Achievements</h1>
        <p className="text-muted-foreground">Earn badges and rewards for your accomplishments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-3xl">🏆</p>
          <p className="text-2xl font-bold text-foreground">0</p>
          <p className="text-sm text-muted-foreground">Badges Earned</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-3xl">⭐</p>
          <p className="text-2xl font-bold text-star">0</p>
          <p className="text-sm text-muted-foreground">Stars</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-3xl">💎</p>
          <p className="text-2xl font-bold text-primary">0</p>
          <p className="text-sm text-muted-foreground">Gems</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-3xl">🔥</p>
          <p className="text-2xl font-bold text-tertiary">0</p>
          <p className="text-sm text-muted-foreground">Day Streak</p>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <Award className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-display text-xl font-semibold mb-2">No Achievements Yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Complete lessons, quizzes, and maintain streaks to earn badges and rewards!
        </p>
        <Link to="/student/subjects">
          <Button>Start Earning</Button>
        </Link>
      </div>
    </div>
  );
}

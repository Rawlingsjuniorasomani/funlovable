import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function StudentLeaderboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Leaderboard</h1>
        <p className="text-muted-foreground">See how you rank among other students</p>
      </div>

      {/* Your Rank */}
      <div className="bg-gradient-to-r from-star/10 via-star/5 to-transparent rounded-xl border border-star/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-semibold mb-1">Your Rank</h3>
            <p className="text-muted-foreground">Complete activities to get ranked</p>
          </div>
          <div className="text-center">
            <p className="text-4xl">🏅</p>
            <p className="text-sm text-muted-foreground">Unranked</p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <Trophy className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-display text-xl font-semibold mb-2">Leaderboard Empty</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Start learning to appear on the leaderboard. Earn XP by completing lessons and quizzes!
        </p>
        <Link to="/student/subjects">
          <Button>Start Learning</Button>
        </Link>
      </div>
    </div>
  );
}

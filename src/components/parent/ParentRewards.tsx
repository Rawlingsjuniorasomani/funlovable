import { Trophy, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

export function ParentRewards() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Rewards & Achievements</h1>
        <p className="text-muted-foreground">Track badges, stars, and rewards earned</p>
      </div>

      { }
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <span className="text-3xl">⭐</span>
          <p className="text-2xl font-bold mt-2">0</p>
          <p className="text-sm text-muted-foreground">Stars</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <span className="text-3xl">💎</span>
          <p className="text-2xl font-bold mt-2">0</p>
          <p className="text-sm text-muted-foreground">Points</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <span className="text-3xl">💠</span>
          <p className="text-2xl font-bold mt-2">0</p>
          <p className="text-sm text-muted-foreground">Gems</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <span className="text-3xl">🏆</span>
          <p className="text-2xl font-bold mt-2">0</p>
          <p className="text-sm text-muted-foreground">Trophies</p>
        </div>
      </div>

      { }
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
      </div>

      { }
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <Award className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-display text-xl font-semibold mb-2">No Achievements Yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Badges and rewards will appear here as your children earn them.
        </p>
        <Link to="/parent/children">
          <Button>Manage Children</Button>
        </Link>
      </div>
    </div>
  );
}

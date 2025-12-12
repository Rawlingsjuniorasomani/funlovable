import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function ParentQuizzes() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Quizzes</h1>
        <p className="text-muted-foreground">Track quiz attempts and performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <Brain className="w-6 h-6 mx-auto text-primary mb-2" />
          <p className="text-2xl font-bold text-foreground">0</p>
          <p className="text-sm text-muted-foreground">Total Quizzes</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-2xl font-bold text-secondary">0</p>
          <p className="text-sm text-muted-foreground">Completed</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-2xl font-bold text-star">0%</p>
          <p className="text-sm text-muted-foreground">Avg Score</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-2xl font-bold text-tertiary">0%</p>
          <p className="text-sm text-muted-foreground">This Month</p>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <Brain className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-display text-xl font-semibold mb-2">No Quizzes</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Quiz results will appear here when your children complete quizzes.
        </p>
        <Link to="/parent/children">
          <Button>Manage Children</Button>
        </Link>
      </div>
    </div>
  );
}

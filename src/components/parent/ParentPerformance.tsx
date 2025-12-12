import { TrendingUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

export function ParentPerformance() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Performance & Progress</h1>
          <p className="text-muted-foreground">Detailed analytics and progress tracking</p>
        </div>
        <Button variant="outline" disabled>
          <Download className="w-4 h-4 mr-2" />
          Export PDF Report
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 rounded-xl border border-primary/20">
          <TrendingUp className="w-6 h-6 text-primary mb-2" />
          <p className="text-3xl font-bold text-foreground">0%</p>
          <p className="text-sm text-muted-foreground">Overall Progress</p>
        </div>
        <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 p-4 rounded-xl border border-secondary/20">
          <p className="text-3xl font-bold text-foreground">0%</p>
          <p className="text-sm text-muted-foreground">Quiz Average</p>
        </div>
        <div className="bg-gradient-to-br from-tertiary/10 to-tertiary/5 p-4 rounded-xl border border-tertiary/20">
          <p className="text-3xl font-bold text-foreground">0</p>
          <p className="text-sm text-muted-foreground">Lessons Completed</p>
        </div>
        <div className="bg-gradient-to-br from-star/10 to-star/5 p-4 rounded-xl border border-star/20">
          <p className="text-3xl font-bold text-foreground">0</p>
          <p className="text-sm text-muted-foreground">Day Streak</p>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-display text-xl font-semibold mb-2">No Performance Data</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Performance analytics will appear here once your children start learning.
        </p>
        <Link to="/parent/children">
          <Button>Manage Children</Button>
        </Link>
      </div>
    </div>
  );
}

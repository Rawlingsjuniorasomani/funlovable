import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function StudentAssignments() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Assignments</h1>
        <p className="text-muted-foreground">View and submit your assignments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-2xl font-bold text-foreground">0</p>
          <p className="text-sm text-muted-foreground">Total</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-2xl font-bold text-primary">0</p>
          <p className="text-sm text-muted-foreground">Pending</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-2xl font-bold text-secondary">0</p>
          <p className="text-sm text-muted-foreground">Submitted</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-2xl font-bold text-star">0%</p>
          <p className="text-sm text-muted-foreground">Avg Grade</p>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-display text-xl font-semibold mb-2">No Assignments</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          You don't have any assignments yet. Assignments will appear here when assigned by your teachers.
        </p>
        <Link to="/student/subjects">
          <Button>Browse Subjects</Button>
        </Link>
      </div>
    </div>
  );
}

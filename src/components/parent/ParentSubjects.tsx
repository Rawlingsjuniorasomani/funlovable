import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function ParentSubjects() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Subjects</h1>
        <p className="text-muted-foreground">Track progress across all enrolled subjects</p>
      </div>

      { }
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-display text-xl font-semibold mb-2">No Enrolled Subjects</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Your children haven't enrolled in any subjects yet. Subject progress will appear here once they start learning.
        </p>
        <Link to="/parent/children">
          <Button>Manage Children</Button>
        </Link>
      </div>
    </div>
  );
}

import { BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

export function StudentSubjects() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">My Subjects</h1>
        <p className="text-muted-foreground">Explore and learn from available subjects</p>
      </div>

      {/* Empty State */}
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-display text-xl font-semibold mb-2">No Subjects Enrolled</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          You haven't enrolled in any subjects yet. Browse available subjects to start your learning journey.
        </p>
        <Link to="/subjects">
          <Button size="lg">
            Browse Available Subjects
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

import { Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function StudentLiveClasses() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Live Classes</h1>
        <p className="text-muted-foreground">Join interactive live sessions with teachers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-2xl font-bold text-foreground">0</p>
          <p className="text-sm text-muted-foreground">Upcoming</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-2xl font-bold text-secondary">0</p>
          <p className="text-sm text-muted-foreground">Attended</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-2xl font-bold text-destructive">0</p>
          <p className="text-sm text-muted-foreground">Missed</p>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <Video className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-display text-xl font-semibold mb-2">No Scheduled Classes</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          You don't have any live classes scheduled. Classes will appear here when scheduled by your teachers.
        </p>
        <Link to="/student/subjects">
          <Button>Browse Subjects</Button>
        </Link>
      </div>
    </div>
  );
}

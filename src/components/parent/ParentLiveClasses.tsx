import { Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function ParentLiveClasses() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Live Classes</h1>
        <p className="text-muted-foreground">View schedule and attendance for live sessions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <Video className="w-6 h-6 mx-auto text-primary mb-2" />
          <p className="text-2xl font-bold">0</p>
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
          Live classes will appear here when scheduled by teachers.
        </p>
        <Link to="/parent/children">
          <Button>Manage Children</Button>
        </Link>
      </div>
    </div>
  );
}

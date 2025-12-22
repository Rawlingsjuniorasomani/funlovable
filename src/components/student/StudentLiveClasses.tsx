import { useState, useEffect } from "react";
import { Video, Calendar, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { liveClassesAPI } from "@/config/api";
import { format } from "date-fns";

export function StudentLiveClasses() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const data = await liveClassesAPI.getAll();
      setClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingClasses = classes.filter(c => c.status !== 'completed');
  const upcomingCount = upcomingClasses.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Live Classes</h1>
        <p className="text-muted-foreground">Join interactive live sessions for your enrolled subjects</p>
      </div>

      { }
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-2xl font-bold text-foreground">{upcomingCount}</p>
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

      { }
      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-muted-foreground">Loading classes...</p>
        ) : upcomingClasses.length > 0 ? (
          upcomingClasses.map((cls) => (
            <div key={cls.id} className="bg-card rounded-xl border border-border p-6 flex flex-col md:flex-row items-start md:items-center gap-4 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Video className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">
                    {cls.subject_name || 'Subject'}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <User className="w-3 h-3" /> {cls.teacher_name || 'Teacher'}
                  </span>
                </div>
                <h3 className="font-semibold text-lg">{cls.title}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(cls.scheduled_at), "PPP")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {format(new Date(cls.scheduled_at), "p")} ({cls.duration_minutes} mins)
                  </span>
                </div>
              </div>
              <Button onClick={() => window.open(cls.meeting_url, '_blank')} disabled={cls.status !== 'live' && cls.status !== 'scheduled'}>
                {cls.status === 'live' ? 'Join Now' : 'Join Class'}
              </Button>
            </div>
          ))
        ) : (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <Video className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-display text-xl font-semibold mb-2">No Scheduled Classes</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You don't have any live classes scheduled for your subjects.
            </p>
            <Link to="/student/subjects">
              <Button variant="outline">Browse Subjects</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

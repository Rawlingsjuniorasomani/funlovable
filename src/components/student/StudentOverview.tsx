import { useState, useEffect } from "react";
import { BookOpen, Trophy, Target, Flame, TrendingUp, PlayCircle, Loader2 } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { analyticsAPI } from "@/config/api";
import { format } from "date-fns";

export function StudentOverview() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const analytics = await analyticsAPI.getStudent();
        setData(analytics);
      } catch (error) {
        console.error("Failed to load student dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const progress = data?.progress || { completed_lessons: 0 };
  const quizStats = data?.quizStats || { total_attempts: 0, average_score: 0 };
  const recentActivity = data?.recentActivity || [];

  return (
    <>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary via-tertiary to-secondary rounded-2xl p-6 md:p-8 text-primary-foreground mb-6 md:mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p className="text-primary-foreground/80 mb-4">
            {data?.lastPlayedLesson
              ? `Pick up where you left off: ${data.lastPlayedLesson.title}`
              : "Ready to continue your learning journey?"}
          </p>
          <Link to={data?.lastPlayedLesson ? `/student/learning/${data.lastPlayedLesson.subject_id}` : "/student/subjects"}>
            <Button variant="secondary" className="btn-bounce bg-background text-foreground hover:bg-background/90">
              <PlayCircle className="w-4 h-4 mr-2" />
              {data?.lastPlayedLesson ? "Resume Learning" : "Start Learning"}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <StatsCard
          title="Lessons Completed"
          value={progress.completed_lessons || 0}
          icon={BookOpen}
          color="blue"
        />
        <StatsCard
          title="Quizzes Taken"
          value={quizStats.total_attempts || 0}
          icon={Trophy}
          color="purple"
        />
        <StatsCard
          title="Average Score"
          value={`${Math.round(parseFloat(quizStats.average_score || 0))}%`}
          icon={Target}
          color="green"
        />
        <StatsCard
          title="Study Streak"
          value="0 days"
          icon={Flame}
          subtitle="Coming soon!"
          color="orange"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2">
          {recentActivity.length > 0 ? (
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {recentActivity.map((activity: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${activity.type === 'quiz' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>
                        {activity.type === 'quiz' ? <Trophy className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{activity.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{activity.type} • {format(new Date(activity.date), 'MMM d, h:mm a')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border p-8 text-center h-full flex flex-col items-center justify-center">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-display text-lg font-semibold mb-2">No Recent Activity</h3>
              <p className="text-muted-foreground mb-4">
                Start learning by enrolling in subjects or taking quizzes.
              </p>
              <Link to="/student/subjects">
                <Button>Browse Subjects</Button>
              </Link>
            </div>
          )}
        </div>

        <div>
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Quick Stats
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Level</span>
                <span className="font-bold">{data?.xp?.level || 1}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Total XP</span>
                <span className="font-bold text-primary">{data?.xp?.total_xp || 0} XP</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Achievements</span>
                <span className="font-bold">{data?.achievementsCount || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

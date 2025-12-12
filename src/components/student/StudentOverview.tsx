import { BookOpen, Trophy, Target, Flame, TrendingUp, PlayCircle } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

export function StudentOverview() {
  const { user } = useAuthContext();

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
            Ready to continue your learning journey?
          </p>
          <Link to="/student/subjects">
            <Button variant="secondary" className="btn-bounce bg-background text-foreground hover:bg-background/90">
              <PlayCircle className="w-4 h-4 mr-2" />
              Continue Learning
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <StatsCard
          title="Lessons Completed"
          value={0}
          icon={BookOpen}
          color="primary"
        />
        <StatsCard
          title="Quizzes Taken"
          value={0}
          icon={Trophy}
          color="secondary"
        />
        <StatsCard
          title="Average Score"
          value="0%"
          icon={Target}
          color="tertiary"
        />
        <StatsCard
          title="Study Streak"
          value="0 days"
          icon={Flame}
          subtitle="Start your streak!"
          color="quaternary"
        />
      </div>

      {/* Empty State */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-display text-lg font-semibold mb-2">No Enrolled Subjects</h3>
            <p className="text-muted-foreground mb-4">
              Start learning by enrolling in subjects. Your progress will appear here.
            </p>
            <Link to="/student/subjects">
              <Button>Browse Subjects</Button>
            </Link>
          </div>
        </div>

        <div>
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Recent Activity
            </h3>
            <div className="text-center py-8 text-muted-foreground">
              <p>No recent activity</p>
              <p className="text-sm">Complete lessons to see your activity here</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

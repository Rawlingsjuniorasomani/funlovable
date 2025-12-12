import { Users, BookOpen, BarChart3, FileText, Award, TrendingUp, Clock, Calendar, Plus } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

export function TeacherOverview() {
  const { user } = useAuthContext();

  return (
    <>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-tertiary via-quaternary to-primary rounded-2xl p-8 text-primary-foreground mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <h1 className="text-3xl font-display font-bold mb-2">Welcome, {user?.name?.split(' ')[0] || 'Teacher'}! 👋</h1>
          <p className="text-primary-foreground/80 mb-4">Set up your classes and start teaching today.</p>
          <div className="flex gap-3">
            <Link to="/teacher/subjects">
              <Button variant="secondary" className="btn-bounce bg-background text-foreground hover:bg-background/90">
                <Plus className="w-4 h-4 mr-2" />
                Create Subject
              </Button>
            </Link>
            <Link to="/teacher/live">
              <Button variant="outline" className="btn-bounce border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                Start Live Class
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard title="Total Students" value={0} icon={Users} color="primary" />
        <StatsCard title="Active Courses" value={0} icon={BookOpen} color="secondary" />
        <StatsCard title="Avg. Class Score" value="0%" icon={BarChart3} color="tertiary" />
        <StatsCard title="Lessons Created" value={0} icon={FileText} subtitle="This month" color="quaternary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-display font-semibold text-foreground flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            My Classes
          </h2>
          
          {/* Empty State */}
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-display text-lg font-semibold mb-2">No Classes Created</h3>
            <p className="text-muted-foreground mb-4">Create your first subject to start teaching students.</p>
            <Link to="/teacher/subjects">
              <Button>Create Subject</Button>
            </Link>
          </div>

          {/* Recent Activity - Empty */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-tertiary" />
                Recent Activity
              </h3>
            </div>
            <div className="p-6 text-center text-muted-foreground">
              <p>No recent activity</p>
              <p className="text-sm">Student activity will appear here</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                <Award className="w-5 h-5 text-star" />
                Top Performers
              </h3>
            </div>
            <div className="p-6 text-center text-muted-foreground">
              <p>No students yet</p>
              <p className="text-sm">Top performers will appear here</p>
            </div>
          </div>

          {/* Upcoming Schedule - Empty */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Today's Schedule
              </h3>
            </div>
            <div className="p-6 text-center text-muted-foreground">
              <p>No scheduled classes</p>
              <p className="text-sm">Schedule classes to see them here</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

import { Users, TrendingUp, Clock, Award, Calendar, Bell, BookOpen, MessageSquare, ChevronRight } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

export function ParentOverview() {
  const { user } = useAuthContext();
  const children = user?.children || [];

  return (
    <>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-secondary via-primary to-tertiary rounded-2xl p-8 text-primary-foreground mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <h1 className="text-3xl font-display font-bold mb-2">Good afternoon, {user?.name?.split(' ')[0] || 'Parent'}! 👋</h1>
          <p className="text-primary-foreground/80 mb-4">
            {children.length > 0 
              ? "Track your children's learning progress here." 
              : "Add your children to start tracking their progress."}
          </p>
          <div className="flex gap-3 flex-wrap">
            {children.length === 0 ? (
              <Link to="/parent/children">
                <Button variant="secondary" className="btn-bounce bg-background text-foreground hover:bg-background/90">
                  Add Child
                </Button>
              </Link>
            ) : (
              <Link to="/parent/progress">
                <Button variant="secondary" className="btn-bounce bg-background text-foreground hover:bg-background/90">
                  View Full Reports
                </Button>
              </Link>
            )}
            <Link to="/parent/messages">
              <Button variant="outline" className="btn-bounce border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <MessageSquare className="w-4 h-4 mr-2" />Message Teacher
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard title="Children Enrolled" value={children.length} icon={Users} color="primary" />
        <StatsCard title="Average Progress" value="0%" icon={TrendingUp} color="secondary" />
        <StatsCard title="Total Study Time" value="0h" subtitle="This week" icon={Clock} color="tertiary" />
        <StatsCard title="Badges Earned" value={0} icon={Award} color="quaternary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Children Progress */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-semibold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />Children's Progress
            </h2>
            <Link to="/parent/children" className="text-primary hover:underline text-sm flex items-center gap-1">
              Manage Children <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {children.length > 0 ? (
            children.map((child, index) => (
              <div key={child.id} className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                      {child.avatar || child.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{child.name}</h3>
                      <p className="text-sm text-muted-foreground">{child.grade} • Age {child.age}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">0%</p>
                    <p className="text-xs text-muted-foreground">Overall Progress</p>
                  </div>
                </div>
                <div className="p-4 text-center text-muted-foreground">
                  <p>No learning activity yet</p>
                  <p className="text-sm">Progress will appear once lessons are completed</p>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-display text-lg font-semibold mb-2">No Children Added</h3>
              <p className="text-muted-foreground mb-4">Add your children to start tracking their learning progress.</p>
              <Link to="/parent/children">
                <Button>Add Your First Child</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-tertiary" />Upcoming
              </h3>
            </div>
            <div className="p-6 text-center text-muted-foreground">
              <p>No upcoming events</p>
              <p className="text-sm">Events will appear here</p>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                <Bell className="w-5 h-5 text-quaternary" />Recent Activity
              </h3>
            </div>
            <div className="p-6 text-center text-muted-foreground">
              <p>No recent activity</p>
              <p className="text-sm">Activity will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

import { useState, useEffect } from "react";
import { Users, TrendingUp, Clock, Award, Bell, MessageSquare, ChevronRight, Loader2, BarChart2 } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { analyticsAPI } from "@/config/api";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function ParentOverview() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ children: any[], recentActivity: any[] }>({ children: [], recentActivity: [] });

  const loadData = async () => {
    try {
      setLoading(true);
      const analytics = await analyticsAPI.getParent();
      setData(analytics);
    } catch (error) {
      console.error("Failed to load parent dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

  }, [user?.id, user?.children?.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const children = data.children || [];
  const recentActivity = data.recentActivity || [];


  const totalChildren = children.length;
  const avgProgress = children.length > 0
    ? Math.round(children.reduce((acc: number, child: any) => acc + parseFloat(child.quizStats?.average_score || 0), 0) / children.length)
    : 0;

  const totalMinutes = children.reduce((acc: number, child: any) => acc + (child.totalTime || 0), 0);
  const totalHours = Math.round(totalMinutes / 60);

  const totalBadges = children.reduce((acc: number, child: any) => acc + 0, 0);

  return (
    <>
      { }
      <div className="bg-primary rounded-2xl p-4 md:p-8 text-primary-foreground mb-6 md:mb-8 relative overflow-hidden shadow-lg shadow-primary/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
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
                <Button size="lg" variant="secondary" className="font-semibold shadow-md hover:shadow-lg transition-all">
                  Add Child
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/parent/progress">
                  <Button size="lg" variant="secondary" className="font-semibold shadow-md hover:shadow-lg transition-all">
                    View Full Reports
                  </Button>
                </Link>
                <Link to="/parent/children">
                  <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                    <Users className="w-5 h-5 mr-2" />Add Child
                  </Button>
                </Link>
              </>
            )}
            <Link to="/parent/messages">
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <MessageSquare className="w-5 h-5 mr-2" />Message Teacher
              </Button>
            </Link>
          </div>
        </div>
      </div >

      { }
      < div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" >
        <StatsCard title="Children Enrolled" value={totalChildren} icon={Users} color="blue" />
        <StatsCard title="Average Quiz Score" value={`${avgProgress}%`} icon={TrendingUp} color="green" />
        <StatsCard title="Total Study Time" value={`${totalHours}h`} subtitle="All children" icon={Clock} color="purple" />
        <StatsCard title="Active Subs" value={user?.subscription?.status === 'active' ? 1 : 0} icon={Award} color="yellow" subtitle={user?.subscription?.plan || 'None'} />
      </div >

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        { }
        <div className="lg:col-span-2 space-y-6">
          {/* Analytics Chart */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-semibold flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-primary" />
                Performance Overview
              </h3>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={children.map((c: any) => ({ name: c.name.split(' ')[0], score: parseFloat(c.quizStats?.average_score || 0) }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-semibold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />Children's Progress
            </h2>
            <Link to="/parent/children" className="text-primary hover:underline text-sm flex items-center gap-1">
              Manage Children <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {children.length > 0 ? (
            children.map((child: any, index: number) => (
              <div key={child.id} className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in hover:shadow-md transition-all" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold shadow-sm">
                      {child.avatar || child.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm sm:text-base">{child.name}</h3>
                      <p className="text-xs text-muted-foreground">{child.grade || 'No Grade'} • {child.xp?.total_xp || 0} XP</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">{Math.round(parseFloat(child.quizStats?.average_score || 0))}%</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Score</p>
                  </div>
                </div>
                <div className="p-3 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-base font-semibold">{child.completedLessons}</p>
                    <p className="text-xs text-muted-foreground">Lessons</p>
                  </div>
                  <div>
                    <p className="text-base font-semibold">{child.quizStats?.attempts || 0}</p>
                    <p className="text-xs text-muted-foreground">Quizzes</p>
                  </div>
                  <div>
                    <p className="text-base font-semibold">{Math.round((child.totalTime || 0) / 60)}h</p>
                    <p className="text-xs text-muted-foreground">Time</p>
                  </div>
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
                <Bell className="w-5 h-5 text-quaternary" />Recent Activity
              </h3>
            </div>
            {recentActivity.length > 0 ? (
              <div className="divide-y divide-border">
                {recentActivity.map((activity: any, idx: number) => (
                  <div key={idx} className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {activity.type}
                      </span>
                      <span className="text-xs text-muted-foreground">{format(new Date(activity.date), 'MMM d, h:mm a')}</span>
                    </div>
                    <p className="font-medium text-sm">{activity.name}</p>
                    <p className="text-xs text-muted-foreground">by {activity.student_name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                <p>No recent activity</p>
                <p className="text-sm">Activity will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

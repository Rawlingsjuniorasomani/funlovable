import { useState, useEffect } from "react";
import { Users, GraduationCap, UserCheck, BookOpen, Target, Video, CreditCard, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard, StatsColor } from "@/components/dashboard/StatsCard";

export function AdminOverview() {
  const [statsData, setStatsData] = useState<any>({
    totalParents: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalSubjects: 0,
    totalRevenue: "0.00",
    recentActivity: [],
    systemAlerts: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch('http://localhost:5000/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStatsData(data);
        }
      } catch (err) {
        console.error("Failed to fetch admin stats", err);
      }
    };
    fetchStats();
  }, []);

  const stats: { label: string; value: string | number; icon: any; color: StatsColor }[] = [
    { label: "Total Parents", value: statsData.totalParents, icon: Users, color: "blue" },
    { label: "Total Students", value: statsData.totalStudents, icon: GraduationCap, color: "green" },
    { label: "Total Teachers", value: statsData.totalTeachers, icon: UserCheck, color: "purple" },
    { label: "Subjects", value: statsData.totalSubjects, icon: BookOpen, color: "orange" },
    { label: "Active Quizzes", value: "0", icon: Target, color: "pink" },
    { label: "Live Classes", value: "0", icon: Video, color: "red" },
    { label: "Revenue (Total)", value: `GHS ${statsData.totalRevenue}`, icon: CreditCard, color: "teal" },
    { label: "Growth", value: "0%", icon: TrendingUp, color: "indigo" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of platform performance and metrics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatsCard
            key={stat.label}
            title={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            className="animate-fade-in"
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statsData.recentActivity && statsData.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {statsData.recentActivity.map((activity: any, i: number) => (
                <div key={i} className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${activity.type === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                      {activity.type === 'user' ? <Users className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(activity.date).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No recent activity to display</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-red-500" />
            System Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statsData.systemAlerts && statsData.systemAlerts.length > 0 ? (
            <div className="space-y-3">
              {statsData.systemAlerts.map((alert: any, i: number) => (
                <div key={i} className={`p-3 rounded-lg border flex items-start gap-3 ${alert.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                  <div className={`mt-0.5 ${alert.type === 'error' ? 'text-red-600' : 'text-amber-600'}`}>
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{alert.message}</p>
                    <p className="text-xs opacity-80">{new Date(alert.date).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No system alerts at this time</p>
              <p className="text-xs">All systems operational</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

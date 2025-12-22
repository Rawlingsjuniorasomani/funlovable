import React, { useState, useEffect } from "react";
import { Users, GraduationCap, UserCheck, BookOpen, Target, Video, CreditCard, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard, StatsColor } from "@/components/dashboard/StatsCard";
import { analyticsAPI, quizzesAPI, liveClassesAPI } from "@/config/api";
import { Sparkline } from "@/components/charts/Sparkline";
import { PieChart } from "@/components/charts/PieChart";




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
        const data = await analyticsAPI.getAdmin();
        
        const [quizzesRes, liveRes] = await Promise.all([quizzesAPI.getAll(), liveClassesAPI.getAll()]);
        const counts = Array.isArray(data.userCounts) ? data.userCounts : [];
        const getCount = (role: string) => {
          const found = counts.find((c: any) => c.role === role);
          return found ? parseInt(found.count) : 0;
        };
        const quizzesCount = Array.isArray(quizzesRes) ? quizzesRes.length : (quizzesRes?.quizzes ? quizzesRes.quizzes.length : 0);
        const liveClassesCount = Array.isArray(liveRes) ? liveRes.length : (liveRes?.classes ? liveRes.classes.length : 0);

        
        let growth = '0%';
        try {
          const daily = Array.isArray(data.dailyRevenue) ? data.dailyRevenue.map((d: any) => ({ date: d.date, revenue: parseFloat(d.revenue) || 0 })) : [];
          if (daily.length >= 14) {
            const sorted = daily.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
            const last7 = sorted.slice(-7).reduce((s: number, x: any) => s + x.revenue, 0);
            const prev7 = sorted.slice(-14, -7).reduce((s: number, x: any) => s + x.revenue, 0);
            if (prev7 === 0) {
              growth = last7 === 0 ? '0%' : '100%';
            } else {
              const pct = ((last7 - prev7) / prev7) * 100;
              growth = `${pct >= 0 ? '+' : ''}${Math.round(pct)}%`;
            }
          }
        } catch (e) {
          growth = '0%';
        }
        setStatsData({
          totalParents: getCount('parent'),
          totalStudents: getCount('student'),
          totalTeachers: getCount('teacher'),
          totalSubjects: data.subjectsCount || 0,
          totalRevenue: data.paymentStats?.total_revenue?.toString?.() || "0.00",
          recentActivity: data.recentActivity || [],
          systemAlerts: data.systemAlerts || [],
          
          dailyRevenue: Array.isArray(data.dailyRevenue) ? data.dailyRevenue : [],
          subscriptions: Array.isArray(data.subscriptions) ? data.subscriptions : [],
          activeQuizzes: quizzesCount,
          liveClasses: liveClassesCount,
          growth
        });
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
    { label: "Active Quizzes", value: statsData.activeQuizzes ?? 0, icon: Target, color: "pink" },
    { label: "Live Classes", value: statsData.liveClasses ?? 0, icon: Video, color: "red" },
    { label: "Revenue (Total)", value: `GHS ${statsData.totalRevenue}`, icon: CreditCard, color: "teal" },
    { label: "Growth", value: statsData.growth ?? '0%', icon: TrendingUp, color: "indigo" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of platform performance and metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statsData.recentActivity && statsData.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {statsData.recentActivity.map((activity: any, i: number) => (
                <div key={i} className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 sm:p-2 rounded-full ${activity.type === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
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
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Revenue (Last 30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <h3 className="text-2xl font-bold">GHS {statsData.totalRevenue}</h3>
              </div>
              <div>
                <Sparkline values={Array.isArray((statsData as any).dailyRevenue) ? (statsData as any).dailyRevenue.map((d: any) => parseFloat(d.revenue || 0)) : []} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div>
                {
                  (() => {
                    const subsRaw = Array.isArray((statsData as any).subscriptions) ? (statsData as any).subscriptions : [];
                    const palette = ['#06b6d4','#3b82f6','#f97316','#8b5cf6','#ec4899','#10b981'];
                    const subs = subsRaw.map((s: any, i: number) => ({ label: s.plan || String(i), value: parseInt(s.count || 0), color: palette[i % palette.length] }));
                    return <PieChart data={subs} />;
                  })()
                }
              </div>
              <div>
                {Array.isArray((statsData as any).subscriptions) && (statsData as any).subscriptions.length > 0 ? (
                  <div className="space-y-2">
                    {((statsData as any).subscriptions.map as any ? (statsData as any).subscriptions : []).map((s: any, i: number) => {
                      const palette = ['#06b6d4','#3b82f6','#f97316','#8b5cf6','#ec4899','#10b981'];
                      const color = palette[i % palette.length];
                      return (
                        <div key={s.plan || i} className="flex items-center gap-2">
                          <span style={{ background: color }} className="w-3 h-3 rounded-full block" />
                          <div className="text-sm">
                            <div className="font-medium">{s.plan || 'None'}</div>
                            <div className="text-xs text-muted-foreground">{s.count} subscribers</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No subscription data</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

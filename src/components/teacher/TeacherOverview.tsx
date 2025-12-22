import { useState, useEffect } from "react";
import {
  Users, BookOpen, BarChart3, FileText, Award, TrendingUp, TrendingDown,
  Clock, Calendar, Plus, ChevronRight, MessageSquare, Bell,
  Layers, Search, MoreVertical, ArrowUpRight, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { subjectsAPI, liveClassesAPI, notificationsAPI, analyticsAPI } from "@/config/api";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from "recharts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

export function TeacherOverview() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    totalQuizzes: 0,
    engagementScore: 0
  });

  // Analytics Data Styling Default (Empty)
  const [activityData, setActivityData] = useState<any[]>([]);
  const [quizPerformanceData, setQuizPerformanceData] = useState<any[]>([]);
  const [atRiskStudents, setAtRiskStudents] = useState<any[]>([]);

  const [recentSubjects, setRecentSubjects] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) loadDashboardData();
  }, [user?.id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [subjectsData, analyticsData, liveClassesData, notificationsData] = await Promise.all([
        subjectsAPI.getTeacher(),
        analyticsAPI.getTeacher(),
        liveClassesAPI.getAll({ teacher_id: user?.id, status: 'scheduled' }),
        notificationsAPI.getMy()
      ]);

      const subjects = Array.isArray(subjectsData) ? subjectsData : [];
      const liveClasses = Array.isArray(liveClassesData) ? liveClassesData : [];
      const userNotifications = Array.isArray(notificationsData) ? notificationsData : [];

      // Process Analytics Data from Backend
      if (analyticsData) {
        // Fallback to mock data if empty (for UI demo purposes)
        if (!analyticsData.weeklyActivity || analyticsData.weeklyActivity.length === 0) {
          setActivityData([
            { name: 'Mon', students: 0, active: 0 },
            { name: 'Tue', students: 12, active: 8 },
            { name: 'Wed', students: 18, active: 15 },
            { name: 'Thu', students: 25, active: 22 },
            { name: 'Fri', students: 20, active: 18 },
            { name: 'Sat', students: 10, active: 5 },
            { name: 'Sun', students: 5, active: 2 },
          ]);
        } else {
          setActivityData(analyticsData.weeklyActivity);
        }

        if (!analyticsData.quizPerformanceChart || analyticsData.quizPerformanceChart.length === 0) {
          setQuizPerformanceData([
            { name: 'Algebra I', avg: 75, passing: 60 },
            { name: 'Geometry', avg: 82, passing: 65 },
            { name: 'Physics', avg: 68, passing: 60 },
            { name: 'Chemistry', avg: 90, passing: 70 },
          ]);
        } else {
          setQuizPerformanceData(analyticsData.quizPerformanceChart);
        }

        setAtRiskStudents(analyticsData.atRiskStudents || []); // Keep At Risk empty if empty, as that's a serious alert


        setStats({
          totalStudents: analyticsData.studentsCount || 0,
          activeCourses: analyticsData.subjectsCount || 0,
          totalQuizzes: analyticsData.quizPerformance?.total_attempts || 0,
          engagementScore: Math.round(analyticsData.quizPerformance?.average_score || 0)
        });
      }

      setRecentSubjects(subjects.slice(0, 3));
      setSchedule(liveClasses.slice(0, 3));
      setNotifications(userNotifications.slice(0, 3));

    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">

      {/* Premium Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 shadow-xl">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-[300px] h-[300px] bg-secondary/20 rounded-full blur-3xl translate-y-1/3 pointer-events-none" />

        <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-primary-foreground">
          <div className="space-y-2 max-w-2xl">
            <Badge variant="outline" className="text-primary-foreground border-primary-foreground/30 bg-white/10 backdrop-blur-md mb-2">
              <Calendar className="w-3 h-3 mr-2" />
              {format(new Date(), "EEEE, MMMM do")}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
              {getGreeting()}, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-lg text-primary-foreground/80 leading-relaxed max-w-lg">
              Here is your daily overview.
              {atRiskStudents.length > 0 && <span className="font-bold text-white"> {atRiskStudents.length} students</span>}
              {atRiskStudents.length > 0 ? " need your attention today." : "Wait list is clear."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Button asChild size="lg" variant="secondary" className="shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 font-semibold bg-white text-indigo-600 hover:bg-white/90">
              <Link to="/teacher/live">
                <TrendingUp className="w-4 h-4 mr-2" />
                Go Live
              </Link>
            </Button>
            <Button asChild size="lg" className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-md shadow-sm">
              <Link to="/teacher/subjects">
                <Plus className="w-5 h-5 mr-2" />
                New Course
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="relative z-20 mt-6 mx-4 mb-4 p-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl flex items-center justify-around md:justify-start md:gap-2 overflow-x-auto">
          <QuickAction icon={Layers} label="Modules" to="/teacher/modules" />
          <QuickAction icon={FileText} label="Assignments" to="/teacher/assignments" />
          <QuickAction icon={Award} label="Quizzes" to="/teacher/quizzes" />
          <QuickAction icon={Users} label="Students" to="/teacher/students" />
          <QuickAction icon={MessageSquare} label="Messages" to="/teacher/messages" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
          trend="Active"
          trendDir="up"
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Avg. Quiz Score"
          value={`${stats.engagementScore}%`}
          icon={Award}
          trend="Class Avg"
          trendDir={stats.engagementScore > 60 ? "up" : "down"}
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Attempt Count"
          value={stats.totalQuizzes}
          icon={FileText}
          trend="Submissions"
          trendDir="neutral"
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          title="Active Courses"
          value={stats.activeCourses}
          icon={BookOpen}
          trend="Subjects"
          trendDir="neutral"
          color="bg-orange-50 text-orange-600"
        />
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        {/* Engagement Chart */}
        <Card className="border-border shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>Student logins vs Content completion</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="students" name="Active Students" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorStudents)" strokeWidth={3} />
                <Area type="monotone" dataKey="active" name="Completions" stroke="#ec4899" fillOpacity={1} fill="url(#colorActive)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quiz Performance Bar Chart */}
        <Card className="border-border shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle>Quiz Performance</CardTitle>
            <CardDescription>Average scores from recent assessments</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              {quizPerformanceData.length > 0 ? (
                <BarChart data={quizPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  <Bar dataKey="avg" name="Avg Score" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                  <Bar dataKey="passing" name="Passing Rate (%)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                  <Legend />
                </BarChart>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No quiz data available yet.
                </div>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Lists Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

        {/* Students at Risk */}
        <Card className="border-border shadow-sm overflow-hidden bg-red-50/50 border-red-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              Needs Attention
            </CardTitle>
            <CardDescription>Students falling behind this week</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {atRiskStudents.length > 0 ? atRiskStudents.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-3 bg-white border border-red-100 rounded-xl shadow-sm">
                <div className="flex items-center gap-3">
                  <Avatar className="w-9 h-9 border border-red-100">
                    <AvatarFallback className="bg-red-50 text-red-600 font-bold">{student.name ? student.name[0] : 'S'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.grade} • {student.risk} Risk</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-red-600">{student.score}%</span>
                  <Progress value={student.score} className="h-1.5 w-16 mt-1 bg-red-100" indicatorClassName="bg-red-500" />
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                <AlertCircle className="w-8 h-8 opacity-20 mb-2" />
                <p className="text-sm">No students currently at risk.</p>
              </div>
            )}
            {atRiskStudents.length > 0 && <Button variant="ghost" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">View All At-Risk</Button>}
          </CardContent>
        </Card>

        {/* Recent Courses */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Active Courses
          </h2>
          {recentSubjects.length > 0 ? recentSubjects.map((subject) => (
            <div key={subject.id} className="group flex items-center gap-4 bg-card p-4 rounded-xl border border-border shadow-sm hover:shadow-md transition-all cursor-pointer">
              <div className="p-3 bg-primary/5 rounded-lg group-hover:bg-primary/10">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{subject.name}</h3>
                <p className="text-xs text-muted-foreground">{subject.studentCount || 0} Students • {subject.modulesCount || 0} Modules</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          )) : <p className="text-sm text-muted rounded-lg p-4 border border-dashed text-center">No active courses.</p>}
        </div>

        {/* Schedule */}
        <Card className="border-none shadow-md bg-gradient-to-b from-card to-muted/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-pink-500" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {schedule.length > 0 ? schedule.map((item, index) => (
                <div key={item.id} className="flex gap-4 items-start">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{item.scheduled_at ? format(new Date(item.scheduled_at), 'K:mm a') : 'TBD'}</span>
                    <div className="w-0.5 h-full bg-border mt-1" />
                  </div>
                  <Card className="flex-1 p-3 mb-2 border-l-4 border-l-pink-500 hover:shadow-sm">
                    <h4 className="font-semibold text-sm">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.subject_name}</p>
                  </Card>
                </div>
              )) : <p className="text-sm text-muted-foreground text-center py-4">No live classes scheduled.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, to }: { icon: any, label: string, to: string }) {
  return (
    <Link to={to} className="group flex flex-col items-center gap-2 p-3 min-w-[80px] rounded-xl hover:bg-white/10 transition-all">
      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-white group-hover:text-purple-600 transition-all shadow-inner">
        <Icon className="w-5 h-5 text-white group-hover:text-purple-600" />
      </div>
      <span className="text-xs font-medium text-white/90 group-hover:text-white">{label}</span>
    </Link>
  );
}

function StatCard({ title, value, icon: Icon, trend, trendDir, color }: any) {
  return (
    <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all hover:scale-[1.02] bg-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-xl ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
          {trend && (
            <Badge variant="outline" className={`border-none ${trendDir === 'up' ? 'bg-emerald-50 text-emerald-600' :
              trendDir === 'down' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'
              }`}>
              {trend} {trendDir === 'up' && <TrendingUp className="w-3 h-3 ml-1" />}
            </Badge>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="text-3xl font-display font-bold text-gray-900">{value}</h3>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <Skeleton className="h-[300px] w-full rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
    </div>
  );
}

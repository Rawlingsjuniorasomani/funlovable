import { useState, useEffect } from "react";
import { Users, BookOpen, BarChart3, FileText, Award, TrendingUp, Clock, Calendar, Plus, ChevronRight, MessageSquare, Bell, Layers } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { subjectsAPI, quizzesAPI, lessonsAPI, liveClassesAPI, notificationsAPI } from "@/config/api";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function TeacherOverview() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    totalQuizzes: 0,
    totalLessons: 0,
  });
  const [recentSubjects, setRecentSubjects] = useState<any[]>([]);
  const [recentQuizzes, setRecentQuizzes] = useState<any[]>([]);
  const [recentLessons, setRecentLessons] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) loadDashboardData();
  }, [user?.id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [subjectsData, quizzesData, lessonsData, liveClassesData, notificationsData] = await Promise.all([
        subjectsAPI.getTeacher(),
        quizzesAPI.getAll(),
        lessonsAPI.getAll(),
        liveClassesAPI.getAll({ teacher_id: user?.id, status: 'scheduled' }),
        notificationsAPI.getAll()
      ]);

      const subjects = Array.isArray(subjectsData) ? subjectsData : [];
      const quizzes = Array.isArray(quizzesData) ? quizzesData : [];
      const lessons = Array.isArray(lessonsData) ? lessonsData : [];
      const liveClasses = Array.isArray(liveClassesData) ? liveClassesData : [];
      const userNotifications = Array.isArray(notificationsData) ? notificationsData : [];

      // Calculate stats
      const studentCount = subjects.reduce((acc: number, sub: any) => acc + (sub.studentCount || 0), 0);

      setStats({
        totalStudents: studentCount,
        activeCourses: subjects.length,
        totalQuizzes: quizzes.length,
        totalLessons: lessons.length
      });

      // Set recent data
      setRecentSubjects(subjects.slice(0, 3));
      setRecentQuizzes(quizzes.slice(0, 3));
      setRecentLessons(lessons.slice(0, 3));
      setSchedule(liveClasses.slice(0, 3)); // Top 3 upcoming
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

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 md:p-12 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[300px] w-[300px] rounded-full bg-white/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-[200px] w-[200px] rounded-full bg-blue-500/20 blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white/80 text-sm font-medium uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              {format(new Date(), "EEEE, MMMM do, yyyy")}
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold">
              Welcome back, {user?.name?.split(' ')[0] || 'Teacher'}! 👋
            </h1>
            <p className="text-white/80 max-w-xl text-lg">
              You have {stats.activeCourses} active courses and {stats.totalQuizzes} quizzes. Ready to inspire some minds today?
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-white/90 font-semibold shadow-lg border-0">
              <Link to="/teacher/subjects">
                <Plus className="w-5 h-5 mr-2" />
                Create Subject
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm">
              <Link to="/teacher/modules">
                <Layers className="w-5 h-5 mr-2" />
                Add Module
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm">
              <Link to="/teacher/live">
                <TrendingUp className="w-5 h-5 mr-2" />
                Go Live
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
          subtitle="Across all classes"
          color="blue"
          trend={{ value: 12, positive: true }}
        />
        <StatsCard
          title="Active Courses"
          value={stats.activeCourses}
          icon={BookOpen}
          subtitle="Currently running"
          color="green"
        />
        <StatsCard
          title="Total Quizzes"
          value={stats.totalQuizzes}
          icon={Award}
          subtitle="Assessments created"
          color="purple"
        />
        <StatsCard
          title="Lessons"
          value={stats.totalLessons}
          icon={FileText}
          subtitle="Learning materials"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="xl:col-span-2 space-y-8">

          {/* Recent Subjects */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Your Courses
              </h2>
              <Link to="/teacher/subjects" className="text-sm text-primary font-medium hover:underline flex items-center">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {recentSubjects.length === 0 ? (
              <EmptyState
                title="No courses yet"
                description="Create your first course to start teaching."
                actionLink="/teacher/subjects"
                actionLabel="Create Course"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentSubjects.map((subject) => (
                  <Link key={subject.id} to={`/teacher/subjects`} className="group">
                    <Card className="h-full hover:shadow-md transition-all border-l-4 border-l-primary cursor-pointer group-hover:translate-x-1">
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <div className={`p-2 rounded-lg bg-primary/10 text-primary`}>
                            {/* Icon placeholder if backend adds icons later */}
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>
                        </div>
                        <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{subject.name}</h3>
                        <p className="text-muted-foreground text-sm line-clamp-2">{subject.description || "No description provided."}</p>
                        <div className="mt-4 flex items-center text-sm text-muted-foreground gap-4">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {subject.studentCount || 0} Students</span>
                          <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {subject.modulesCount || 0} Modules</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
                {/* Always show a "Create New" card if less than 4 items */}
                <Link to="/teacher/subjects" className="group">
                  <div className="h-full min-h-[160px] rounded-xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer p-6">
                    <div className="h-10 w-10 rounded-full bg-muted group-hover:bg-primary/20 flex items-center justify-center mb-3 transition-colors">
                      <Plus className="w-6 h-6" />
                    </div>
                    <span className="font-semibold">Create New Course</span>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Recent Quizzes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold flex items-center gap-2">
                <Award className="w-5 h-5 text-tertiary" />
                Recent Quizzes
              </h2>
              <Link to="/teacher/quizzes" className="text-sm text-primary font-medium hover:underline flex items-center">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {recentQuizzes.length === 0 ? (
              <EmptyState
                title="No quizzes created"
                description="Assess your students by creating quizzes."
                actionLink="/teacher/quizzes/create"
                actionLabel="Create Quiz"
              />
            ) : (
              <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="divide-y divide-border">
                  {recentQuizzes.map((quiz) => (
                    <div key={quiz.id} className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary font-bold">
                          Q
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{quiz.title}</h4>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            {quiz.subject_name || "General"} • {quiz.questions || quiz.total_questions || 0} Questions
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={quiz.published || quiz.is_active ? "default" : "outline"}>
                          {quiz.published || quiz.is_active ? "Published" : "Draft"}
                        </Badge>
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                          <Link to={`/teacher/quizzes`}>
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-8">

          {/* Schedule Widget */}
          <Card className="border-none shadow-md bg-gradient-to-b from-card to-muted/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-secondary" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              {schedule.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">No classes scheduled.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {schedule.map((item, index) => (
                    <div key={item.id} className={`flex gap-4 relative pl-4 ${index !== schedule.length - 1 ? 'border-l-2 border-primary/20 pb-4' : ''}`}>
                      <div className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-4 border-background ${index === 0 ? 'bg-primary' : 'bg-muted-foreground'}`} />
                      <div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${index === 0 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          {item.scheduled_at ? format(new Date(item.scheduled_at), 'hh:mm a') : 'TBD'}
                        </span>
                        <h4 className={`font-semibold mt-1 ${index === 0 ? 'text-foreground' : 'text-muted-foreground'}`}>{item.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.subject_name || 'General'} • {item.duration_minutes || 45} min
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button asChild variant="outline" className="w-full mt-6">
                <Link to="/teacher/live">View Full Schedule</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Notifications */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-quaternary" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifications.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">No new notifications.</p>
                </div>
              ) : (
                notifications.map((notif: any) => (
                  <div key={notif.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="p-1.5 rounded-full bg-primary/10 text-primary shrink-0">
                      {notif.type === 'success' || notif.type === 'achievement' ? <Award className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{notif.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notif.message}</p>
                    </div>
                  </div>
                ))
              )}
              <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
                <Link to="/teacher/messages">View all notifications</Link>
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <Skeleton className="h-[280px] w-full rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-4">
          <Skeleton className="h-10 w-1/3" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        </div>
        <div className="col-span-1">
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, description, actionLink, actionLabel }: any) {
  return (
    <div className="bg-card rounded-xl border border-dashed border-muted-foreground/30 p-8 text-center flex flex-col items-center justify-center min-h-[200px]">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
        <Plus className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-sm mb-4">{description}</p>
      <Button asChild>
        <Link to={actionLink}>{actionLabel}</Link>
      </Button>
    </div>
  );
}

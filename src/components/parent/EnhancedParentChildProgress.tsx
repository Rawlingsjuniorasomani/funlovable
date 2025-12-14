import { useState, useEffect } from "react";
import {
  TrendingUp, BookOpen, Trophy, Target, Calendar, Clock,
  Award, Star, CheckCircle, ArrowLeft, MessageSquare, Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { parentsAPI } from "@/config/api";
import { format } from "date-fns";
import { toast } from "sonner";

interface SubjectGrade {
  subject: string;
  icon: string;
  grade: string;
  score: number;
  trend: "up" | "down" | "stable";
  lessonsCompleted: number;
  totalLessons: number;
  quizzesTaken: number;
}

interface RecentActivity {
  id: string;
  type: "lesson" | "quiz" | "assignment" | "achievement";
  title: string;
  subject: string;
  date: string;
  score?: number;
}

export function EnhancedParentChildProgress() {
  const navigate = useNavigate();
  const { childId } = useParams();
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    overview: { total_xp: number; level: number; average_score: number };
    subjects: SubjectGrade[];
    recent_activity: RecentActivity[];
  } | null>(null);

  const child = user?.children?.find(c => c.id === childId);

  useEffect(() => {
    if (childId) {
      loadChildData();
    }
  }, [childId]);

  const loadChildData = async () => {
    try {
      setLoading(true);
      const result = await parentsAPI.getChildProgress(childId!);
      // Transform backend data to match interface if needed
      // Currently backend returns: { overview, subjects, recent_activity }

      // Map icons to subjects (simple mapping for now)
      const subjectsWithIcons = result.subjects.map((sub: any) => ({
        ...sub,
        icon: getSubjectIcon(sub.subject),
        trend: "stable", // Default for now
        lessonsCompleted: 0, // Not yet in backend
        totalLessons: 0 // Not yet in backend
      }));

      setData({
        overview: result.overview,
        subjects: subjectsWithIcons,
        recent_activity: result.recent_activity || []
      });
    } catch (error) {
      console.error("Failed to load child progress:", error);
      toast.error("Failed to load progress data");
    } finally {
      setLoading(false);
    }
  };

  const getSubjectIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("math")) return "📐";
    if (n.includes("science")) return "🔬";
    if (n.includes("english")) return "📚";
    if (n.includes("social")) return "🌍";
    if (n.includes("art")) return "🎨";
    return "📘";
  };

  if (!child) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Child not found</p>
        <Button onClick={() => navigate("/parent/children")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Children
        </Button>
      </div>
    );
  }

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading progress...</div>;
  }

  const { overview, subjects, recent_activity } = data || { overview: { average_score: 0, level: 1, total_xp: 0 }, subjects: [] as SubjectGrade[], recent_activity: [] };
  const overallAverage = overview?.average_score || 0;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/parent/children")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
              {child.avatar || child.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground">{child.name}</h2>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>{child.grade}</span>
                <span>•</span>
                <span>Level {overview?.level || 1}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <MessageSquare className="w-4 h-4 mr-2" />
            Message Teacher
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{overallAverage}%</p>
                <p className="text-xs text-muted-foreground">Average Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{overview?.total_xp || 0}</p>
                <p className="text-xs text-muted-foreground">Total XP</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-tertiary/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-tertiary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{subjects.reduce((acc, s) => acc + (s.quizzesTaken || 0), 0)}</p>
                <p className="text-xs text-muted-foreground">Quizzes Taken</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Subject Grades */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Subject Performance
              </h3>

              {subjects.length === 0 ? (
                <div className="text-center p-8 border border-dashed rounded-xl text-muted-foreground">
                  No subject data available yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subjects.map((subject) => (
                    <Card key={subject.subject}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{subject.icon}</span>
                            <div>
                              <h4 className="font-semibold">{subject.subject}</h4>
                              <p className="text-sm text-muted-foreground">
                                {subject.quizzesTaken} quizzes taken
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={subject.score >= 85 ? "default" : "secondary"} className={subject.score >= 85 ? "bg-secondary text-secondary-foreground" : ""}>
                              {subject.grade}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">{subject.score}%</p>
                          </div>
                        </div>
                        <Progress value={subject.score} className="h-2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity Sidebar */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-tertiary" />
                Recent Activity
              </h3>

              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {recent_activity.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center">No recent activity.</p>
                    ) : (
                      recent_activity.slice(0, 5).map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.type === "quiz" ? "bg-primary/20" :
                            activity.type === "lesson" ? "bg-secondary/20" :
                              "bg-tertiary/20"
                            }`}>
                            {activity.type === "quiz" && <Trophy className="w-4 h-4 text-primary" />}
                            {activity.type === "lesson" && <BookOpen className="w-4 h-4 text-secondary" />}
                            {activity.type === "assignment" && <CheckCircle className="w-4 h-4 text-tertiary" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">{activity.subject} • {format(new Date(activity.date), 'MMM d, yyyy')}</p>
                          </div>
                          {activity.score !== undefined && (
                            <Badge variant="outline" className="text-xs">
                              {activity.score}%
                            </Badge>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="subjects" className="mt-6">
          <div className="space-y-4">
            {subjects.map((subject) => (
              <Card key={subject.subject}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{subject.icon}</span>
                      <div>
                        <h4 className="text-lg font-semibold">{subject.subject}</h4>
                        <p className="text-sm text-muted-foreground">Current Grade: {subject.grade}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-primary">{subject.score}%</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{subject.quizzesTaken}</p>
                      <p className="text-sm text-muted-foreground">Quizzes</p>
                    </div>
                    {/* Add more real stats as available */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {recent_activity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.type === "quiz" ? "bg-primary/20" :
                      activity.type === "lesson" ? "bg-secondary/20" :
                        "bg-tertiary/20"
                      }`}>
                      {activity.type === "quiz" && <Trophy className="w-5 h-5 text-primary" />}
                      {activity.type === "lesson" && <BookOpen className="w-5 h-5 text-secondary" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.subject} • {format(new Date(activity.date), 'PPP')}</p>
                    </div>
                    {activity.score !== undefined && (
                      <Badge variant="outline" className="text-sm">
                        Score: {activity.score}%
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

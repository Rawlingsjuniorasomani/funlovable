import { useState } from "react";
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

interface SubjectGrade {
  subject: string;
  icon: string;
  grade: string;
  score: number;
  trend: "up" | "down" | "stable";
  lessonsCompleted: number;
  totalLessons: number;
}

interface RecentActivity {
  id: string;
  type: "lesson" | "quiz" | "assignment" | "achievement";
  title: string;
  subject: string;
  date: string;
  score?: number;
}

const mockGrades: SubjectGrade[] = [
  { subject: "Mathematics", icon: "📐", grade: "A", score: 92, trend: "up", lessonsCompleted: 18, totalLessons: 20 },
  { subject: "Science", icon: "🔬", grade: "B+", score: 85, trend: "up", lessonsCompleted: 12, totalLessons: 15 },
  { subject: "English", icon: "📚", grade: "A-", score: 88, trend: "stable", lessonsCompleted: 15, totalLessons: 18 },
  { subject: "Social Studies", icon: "🌍", grade: "B", score: 82, trend: "down", lessonsCompleted: 8, totalLessons: 12 },
];

const mockActivities: RecentActivity[] = [
  { id: "1", type: "quiz", title: "Fractions Quiz", subject: "Mathematics", date: "2024-12-10", score: 95 },
  { id: "2", type: "lesson", title: "Photosynthesis", subject: "Science", date: "2024-12-10" },
  { id: "3", type: "achievement", title: "Quiz Master Badge", subject: "General", date: "2024-12-09" },
  { id: "4", type: "assignment", title: "Grammar Worksheet", subject: "English", date: "2024-12-08", score: 88 },
  { id: "5", type: "lesson", title: "Ancient Civilizations", subject: "Social Studies", date: "2024-12-08" },
];

export function EnhancedParentChildProgress() {
  const navigate = useNavigate();
  const { childId } = useParams();
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState("overview");

  const child = user?.children?.find(c => c.id === childId);

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

  const overallProgress = Math.round(
    mockGrades.reduce((acc, g) => acc + (g.lessonsCompleted / g.totalLessons), 0) / mockGrades.length * 100
  );
  const overallAverage = Math.round(mockGrades.reduce((acc, g) => acc + g.score, 0) / mockGrades.length);

  return (
    <div className="space-y-6">
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
              <p className="text-muted-foreground">{child.grade} • Age {child.age}</p>
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
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{overallProgress}%</p>
                <p className="text-xs text-muted-foreground">Overall Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-secondary" />
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
              <div className="w-10 h-10 rounded-lg bg-tertiary/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-tertiary" />
              </div>
              <div>
                <p className="text-2xl font-bold">12h</p>
                <p className="text-xs text-muted-foreground">This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-quaternary/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-quaternary" />
              </div>
              <div>
                <p className="text-2xl font-bold">8</p>
                <p className="text-xs text-muted-foreground">Badges Earned</p>
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
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Subject Grades */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Subject Performance
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockGrades.map((subject) => (
                  <Card key={subject.subject}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{subject.icon}</span>
                          <div>
                            <h4 className="font-semibold">{subject.subject}</h4>
                            <p className="text-sm text-muted-foreground">
                              {subject.lessonsCompleted}/{subject.totalLessons} lessons
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
                      <Progress value={(subject.lessonsCompleted / subject.totalLessons) * 100} className="h-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
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
                    {mockActivities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.type === "quiz" ? "bg-primary/20" :
                          activity.type === "lesson" ? "bg-secondary/20" :
                          activity.type === "achievement" ? "bg-star/20" :
                          "bg-tertiary/20"
                        }`}>
                          {activity.type === "quiz" && <Trophy className="w-4 h-4 text-primary" />}
                          {activity.type === "lesson" && <BookOpen className="w-4 h-4 text-secondary" />}
                          {activity.type === "achievement" && <Star className="w-4 h-4 text-star" />}
                          {activity.type === "assignment" && <CheckCircle className="w-4 h-4 text-tertiary" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">{activity.subject}</p>
                        </div>
                        {activity.score && (
                          <Badge variant="outline" className="text-xs">
                            {activity.score}%
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="subjects" className="mt-6">
          <div className="space-y-4">
            {mockGrades.map((subject) => (
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
                      <Badge variant={subject.trend === "up" ? "default" : subject.trend === "down" ? "destructive" : "secondary"}>
                        {subject.trend === "up" ? "↑ Improving" : subject.trend === "down" ? "↓ Needs Attention" : "→ Stable"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{subject.lessonsCompleted}</p>
                      <p className="text-sm text-muted-foreground">Lessons Done</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{Math.round((subject.lessonsCompleted / subject.totalLessons) * 100)}%</p>
                      <p className="text-sm text-muted-foreground">Progress</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{subject.totalLessons - subject.lessonsCompleted}</p>
                      <p className="text-sm text-muted-foreground">Remaining</p>
                    </div>
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
                {mockActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === "quiz" ? "bg-primary/20" :
                      activity.type === "lesson" ? "bg-secondary/20" :
                      activity.type === "achievement" ? "bg-star/20" :
                      "bg-tertiary/20"
                    }`}>
                      {activity.type === "quiz" && <Trophy className="w-5 h-5 text-primary" />}
                      {activity.type === "lesson" && <BookOpen className="w-5 h-5 text-secondary" />}
                      {activity.type === "achievement" && <Star className="w-5 h-5 text-star" />}
                      {activity.type === "assignment" && <CheckCircle className="w-5 h-5 text-tertiary" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.subject} • {activity.date}</p>
                    </div>
                    {activity.score && (
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

        <TabsContent value="achievements" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Quiz Master", icon: "🏆", description: "Completed 10 quizzes", earned: true },
              { name: "Bookworm", icon: "📚", description: "Read 20 lessons", earned: true },
              { name: "7-Day Streak", icon: "🔥", description: "Studied 7 days in a row", earned: true },
              { name: "Math Wizard", icon: "🧮", description: "90% in Math", earned: true },
              { name: "Science Star", icon: "⭐", description: "Complete all Science", earned: false },
              { name: "Perfect Score", icon: "💯", description: "100% on any quiz", earned: false },
              { name: "Early Bird", icon: "🐦", description: "Study before 7am", earned: true },
              { name: "Team Player", icon: "🤝", description: "Join 5 live classes", earned: false },
            ].map((achievement, i) => (
              <Card key={i} className={!achievement.earned ? "opacity-50" : ""}>
                <CardContent className="p-4 text-center">
                  <span className="text-4xl">{achievement.icon}</span>
                  <h4 className="font-semibold mt-2">{achievement.name}</h4>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  {achievement.earned && (
                    <Badge className="mt-2 bg-secondary text-secondary-foreground">Earned</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

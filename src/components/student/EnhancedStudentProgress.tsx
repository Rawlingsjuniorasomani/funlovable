import { 
  TrendingUp, BookOpen, Trophy, Target, Flame, Calendar,
  CheckCircle, Clock, Award, Star
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/contexts/AuthContext";
import { mockSubjects } from "@/data/mockData";

interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  icon: string;
  lessonsCompleted: number;
  totalLessons: number;
  quizzesCompleted: number;
  totalQuizzes: number;
  avgScore: number;
  timeSpent: string;
}

const mockSubjectProgress: SubjectProgress[] = [
  { subjectId: "math", subjectName: "Mathematics", icon: "📐", lessonsCompleted: 12, totalLessons: 20, quizzesCompleted: 8, totalQuizzes: 10, avgScore: 85, timeSpent: "12h 30m" },
  { subjectId: "science", subjectName: "Science", icon: "🔬", lessonsCompleted: 8, totalLessons: 15, quizzesCompleted: 5, totalQuizzes: 8, avgScore: 78, timeSpent: "8h 45m" },
  { subjectId: "english", subjectName: "English", icon: "📚", lessonsCompleted: 15, totalLessons: 18, quizzesCompleted: 7, totalQuizzes: 9, avgScore: 92, timeSpent: "10h 15m" },
  { subjectId: "social", subjectName: "Social Studies", icon: "🌍", lessonsCompleted: 6, totalLessons: 12, quizzesCompleted: 4, totalQuizzes: 6, avgScore: 88, timeSpent: "5h 20m" },
];

const weeklyActivity = [
  { day: "Mon", lessons: 3, quizzes: 1 },
  { day: "Tue", lessons: 2, quizzes: 2 },
  { day: "Wed", lessons: 4, quizzes: 1 },
  { day: "Thu", lessons: 1, quizzes: 0 },
  { day: "Fri", lessons: 3, quizzes: 2 },
  { day: "Sat", lessons: 2, quizzes: 1 },
  { day: "Sun", lessons: 0, quizzes: 0 },
];

export function EnhancedStudentProgress() {
  const { user } = useAuthContext();

  const totalLessons = mockSubjectProgress.reduce((acc, s) => acc + s.lessonsCompleted, 0);
  const totalQuizzes = mockSubjectProgress.reduce((acc, s) => acc + s.quizzesCompleted, 0);
  const overallAvgScore = Math.round(
    mockSubjectProgress.reduce((acc, s) => acc + s.avgScore, 0) / mockSubjectProgress.length
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">My Progress</h2>
        <p className="text-muted-foreground">Track your learning journey and achievements</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalLessons}</p>
                <p className="text-xs text-muted-foreground">Lessons Done</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalQuizzes}</p>
                <p className="text-xs text-muted-foreground">Quizzes Passed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-tertiary/10 to-tertiary/5 border-tertiary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-tertiary/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-tertiary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{overallAvgScore}%</p>
                <p className="text-xs text-muted-foreground">Avg Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-quaternary/10 to-quaternary/5 border-quaternary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-quaternary/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-quaternary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">7</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Progress */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Subject Progress
          </h3>
          
          <div className="space-y-4">
            {mockSubjectProgress.map((subject) => {
              const lessonProgress = (subject.lessonsCompleted / subject.totalLessons) * 100;
              const quizProgress = (subject.quizzesCompleted / subject.totalQuizzes) * 100;
              
              return (
                <Card key={subject.subjectId}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{subject.icon}</span>
                        <div>
                          <h4 className="font-semibold text-foreground">{subject.subjectName}</h4>
                          <p className="text-sm text-muted-foreground">{subject.timeSpent} spent</p>
                        </div>
                      </div>
                      <Badge 
                        variant={subject.avgScore >= 80 ? "default" : "secondary"}
                        className={subject.avgScore >= 80 ? "bg-secondary text-secondary-foreground" : ""}
                      >
                        {subject.avgScore}% avg
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Lessons</span>
                          <span className="font-medium">{subject.lessonsCompleted}/{subject.totalLessons}</span>
                        </div>
                        <Progress value={lessonProgress} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Quizzes</span>
                          <span className="font-medium">{subject.quizzesCompleted}/{subject.totalQuizzes}</span>
                        </div>
                        <Progress value={quizProgress} className="h-2 bg-secondary/20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Weekly Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-tertiary" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end h-32">
                {weeklyActivity.map((day, i) => (
                  <div key={day.day} className="flex flex-col items-center gap-1">
                    <div className="flex flex-col gap-0.5">
                      <div 
                        className="w-6 bg-primary/80 rounded-t"
                        style={{ height: `${day.lessons * 15}px` }}
                      />
                      <div 
                        className="w-6 bg-secondary/80 rounded-b"
                        style={{ height: `${day.quizzes * 15}px` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{day.day}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-primary/80" />
                  <span className="text-muted-foreground">Lessons</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-secondary/80" />
                  <span className="text-muted-foreground">Quizzes</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="w-4 h-4 text-star" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-star/20 flex items-center justify-center">
                  <Star className="w-4 h-4 text-star" />
                </div>
                <div>
                  <p className="text-sm font-medium">Quiz Master</p>
                  <p className="text-xs text-muted-foreground">Completed 10 quizzes</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-medium">7-Day Streak</p>
                  <p className="text-xs text-muted-foreground">Keep it going!</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">First Module</p>
                  <p className="text-xs text-muted-foreground">Completed Math basics</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Goals */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-tertiary" />
                Weekly Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Complete 10 lessons</span>
                  <span className="font-medium">8/10</span>
                </div>
                <Progress value={80} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Pass 5 quizzes</span>
                  <span className="font-medium">4/5</span>
                </div>
                <Progress value={80} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Study 5 hours</span>
                  <span className="font-medium">3.5/5h</span>
                </div>
                <Progress value={70} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

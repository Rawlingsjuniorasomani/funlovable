import { TrendingUp, Target, Clock, Award, BookOpen, Brain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, BarChart, Bar, ResponsiveContainer, LineChart, Line, RadialBarChart, RadialBar } from "recharts";

const weeklyProgress: Array<{ day: string; quizzes: number; lessons: number; xp: number }> = [];

const subjectPerformance: Array<{ subject: string; score: number; progress: number }> = [];

const monthlyXP: Array<{ week: string; xp: number }> = [];

export function StudentAnalytics() {
  const totalXP = 0;
  const level = 1;
  const xpToNextLevel = 500;
  const quizzesCompleted = 0;
  const averageScore = 0;
  const streak = 0;

  const chartConfig = {
    quizzes: { label: "Quizzes", color: "hsl(var(--primary))" },
    lessons: { label: "Lessons", color: "hsl(var(--secondary))" },
    xp: { label: "XP Earned", color: "hsl(var(--tertiary))" },
  };

  const radialData = [{ name: "Progress", value: 72, fill: "hsl(var(--primary))" }];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">My Analytics</h1>
        <p className="text-muted-foreground">Track your learning progress and achievements</p>
      </div>

      { }
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-5 h-5 text-primary" />
              <span className="text-xs text-green-500">Level {level}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalXP}</p>
            <p className="text-xs text-muted-foreground">Total XP Earned</p>
            <Progress value={(500 - xpToNextLevel) / 5} className="mt-2 h-1" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Brain className="w-5 h-5 text-secondary" />
              <span className="text-xs text-green-500">+3 this week</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{quizzesCompleted}</p>
            <p className="text-xs text-muted-foreground">Quizzes Completed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-tertiary" />
              <span className="text-xs text-green-500">+5%</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{averageScore}%</p>
            <p className="text-xs text-muted-foreground">Average Score</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <span className="text-xs text-orange-500">🔥 Hot!</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{streak} days</p>
            <p className="text-xs text-muted-foreground">Current Streak</p>
          </CardContent>
        </Card>
      </div>

      { }
      <div className="grid md:grid-cols-2 gap-6">
        { }
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <BarChart data={weeklyProgress}>
                <XAxis dataKey="day" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="quizzes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lessons" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        { }
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-tertiary" /> XP Earned This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <AreaChart data={monthlyXP}>
                <defs>
                  <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--tertiary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--tertiary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="xp" stroke="hsl(var(--tertiary))" fill="url(#xpGradient)" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      { }
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" /> Subject Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subjectPerformance.map((subject) => (
              <div key={subject.subject} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{subject.subject}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">Score: {subject.score}%</span>
                    <span className="text-sm text-primary font-medium">{subject.progress}% complete</span>
                  </div>
                </div>
                <Progress value={subject.progress} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      { }
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Overall Course Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={radialData} startAngle={90} endAngle={-270}>
                  <RadialBar dataKey="value" cornerRadius={10} fill="hsl(var(--primary))" />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-bold text-foreground">72%</span>
                <span className="text-sm text-muted-foreground">Complete</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Learning Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm font-medium text-green-600">🎯 Strong in English</p>
                <p className="text-xs text-muted-foreground mt-1">You're performing 15% above average</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-sm font-medium text-yellow-600">📚 Focus on Social Studies</p>
                <p className="text-xs text-muted-foreground mt-1">Consider spending more time on this subject</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm font-medium text-primary">🔥 Great streak!</p>
                <p className="text-xs text-muted-foreground mt-1">Keep it up! You're building great habits</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

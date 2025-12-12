import { BarChart3, TrendingUp, TrendingDown, Users, Target, BookOpen, Award, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockStudents, mockSubjects } from "@/data/mockData";
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--tertiary))", "hsl(var(--quaternary))"];

const weeklyData = [
  { day: "Mon", students: 0, quizzes: 0 },
  { day: "Tue", students: 0, quizzes: 0 },
  { day: "Wed", students: 0, quizzes: 0 },
  { day: "Thu", students: 0, quizzes: 0 },
  { day: "Fri", students: 0, quizzes: 0 },
  { day: "Sat", students: 0, quizzes: 0 },
  { day: "Sun", students: 0, quizzes: 0 },
];

export function TeacherAnalytics() {
  const avgScore = 0;
  const totalQuizzes = 0;
  const totalLessons = 0;
  const avgXP = 0;

  const topPerformers: typeof mockStudents = [];
  const needsAttention: typeof mockStudents = [];

  const subjectPerformance: any[] = [];

  const subjectPieData: any[] = [];

  const chartConfig = {
    students: { label: "Active Students", color: "hsl(var(--primary))" },
    quizzes: { label: "Quizzes", color: "hsl(var(--secondary))" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Analytics & Reports</h2>
          <p className="text-muted-foreground">Detailed insights into student performance</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Avg Score", value: `${avgScore}%`, icon: Target, color: "text-primary", trend: "+3%" },
          { label: "Total Quizzes", value: totalQuizzes, icon: BarChart3, color: "text-secondary", trend: "+12%" },
          { label: "Total Lessons", value: totalLessons, icon: BookOpen, color: "text-tertiary", trend: "+8%" },
          { label: "Avg XP", value: avgXP.toLocaleString(), icon: Award, color: "text-accent", trend: "+15%" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={cn("w-5 h-5", stat.color)} />
                <span className="text-xs text-green-500 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {stat.trend}
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Weekly Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <LineChart data={weeklyData}>
                <XAxis dataKey="day" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="students" stroke="hsl(var(--primary))" strokeWidth={2} dot />
                <Line type="monotone" dataKey="quizzes" stroke="hsl(var(--secondary))" strokeWidth={2} dot />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" /> Students by Subject
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={subjectPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name }) => name}>
                    {subjectPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="bg-green-500/5">
            <CardTitle className="flex items-center gap-2 text-green-600">
              <TrendingUp className="w-5 h-5" /> Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {topPerformers.map((student, index) => (
                <div key={student.id} className="p-4 flex items-center gap-4">
                  <span className="text-lg font-bold text-muted-foreground w-6">#{index + 1}</span>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-tertiary flex items-center justify-center text-primary-foreground font-bold">
                    {student.avatar}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{student.name}</h4>
                    <p className="text-xs text-muted-foreground">{student.grade}</p>
                  </div>
                  <span className="font-bold text-green-600">{student.avgScore}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-amber-500/5">
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <TrendingDown className="w-5 h-5" /> Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {needsAttention.map((student) => (
                <div key={student.id} className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-primary-foreground font-bold">
                    {student.avatar}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{student.name}</h4>
                    <p className="text-xs text-muted-foreground">{student.grade}</p>
                  </div>
                  <span className="font-bold text-amber-600">{student.avgScore}%</span>
                  <Button size="sm" variant="outline">Contact</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { TrendingUp, Users, Clock, Award, BookOpen, DollarSign, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, BarChart, Bar, ResponsiveContainer, LineChart, Line } from "recharts";

// Mock children performance data
const childrenData = [
  { name: "Kwame", avgScore: 85, progress: 78, streak: 12, totalXP: 2450 },
  { name: "Ama", avgScore: 92, progress: 85, streak: 8, totalXP: 1890 },
];

const weeklyActivity = [
  { day: "Mon", kwame: 45, ama: 60 },
  { day: "Tue", kwame: 30, ama: 45 },
  { day: "Wed", kwame: 60, ama: 55 },
  { day: "Thu", kwame: 40, ama: 50 },
  { day: "Fri", kwame: 55, ama: 65 },
  { day: "Sat", kwame: 20, ama: 25 },
  { day: "Sun", kwame: 35, ama: 40 },
];

const monthlyPayments = [
  { month: "Sep", amount: 150 },
  { month: "Oct", amount: 150 },
  { month: "Nov", amount: 175 },
  { month: "Dec", amount: 150 },
];

const subjectBreakdown = [
  { subject: "Mathematics", kwame: 82, ama: 95 },
  { subject: "Science", kwame: 78, ama: 88 },
  { subject: "English", kwame: 90, ama: 92 },
  { subject: "Social Studies", kwame: 75, ama: 85 },
];

export function ParentAnalytics() {
  const totalSpent = 625;
  const avgChildScore = 88;

  const chartConfig = {
    kwame: { label: "Kwame", color: "hsl(var(--primary))" },
    ama: { label: "Ama", color: "hsl(var(--secondary))" },
    amount: { label: "Payment", color: "hsl(var(--tertiary))" },
  };

  const formatCurrency = (value: number) => `GH₵${value}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Family Analytics</h1>
        <p className="text-muted-foreground">Monitor your children's learning progress and account activity</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{childrenData.length}</p>
            <p className="text-xs text-muted-foreground">Children Enrolled</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-5 h-5 text-secondary" />
              <span className="text-xs text-green-500">+3%</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{avgChildScore}%</p>
            <p className="text-xs text-muted-foreground">Average Score</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-tertiary" />
            </div>
            <p className="text-2xl font-bold text-foreground">285 min</p>
            <p className="text-xs text-muted-foreground">Learning Time (Week)</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-quaternary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(totalSpent)}</p>
            <p className="text-xs text-muted-foreground">Total Invested</p>
          </CardContent>
        </Card>
      </div>

      {/* Children Progress Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {childrenData.map((child) => (
          <Card key={child.name}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold">
                    {child.name.charAt(0)}
                  </div>
                  {child.name}'s Progress
                </span>
                <span className="text-sm font-normal text-muted-foreground">{child.totalXP} XP</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Course Progress</span>
                    <span className="font-medium">{child.progress}%</span>
                  </div>
                  <Progress value={child.progress} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-foreground">{child.avgScore}%</p>
                    <p className="text-xs text-muted-foreground">Avg Score</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-foreground">{child.streak} 🔥</p>
                    <p className="text-xs text-muted-foreground">Day Streak</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly Study Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Weekly Study Time (minutes)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <LineChart data={weeklyActivity}>
                <XAxis dataKey="day" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="kwame" stroke="hsl(var(--primary))" strokeWidth={2} dot />
                <Line type="monotone" dataKey="ama" stroke="hsl(var(--secondary))" strokeWidth={2} dot />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-tertiary" /> Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <BarChart data={monthlyPayments}>
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(val) => `GH₵${val}`} />
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
                <Bar dataKey="amount" fill="hsl(var(--tertiary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Subject Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" /> Subject Performance Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <BarChart data={subjectBreakdown} layout="vertical">
              <XAxis type="number" domain={[0, 100]} />
              <YAxis type="category" dataKey="subject" width={100} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="kwame" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              <Bar dataKey="ama" fill="hsl(var(--secondary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" /> Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium text-foreground">Mathematics Quiz - Kwame</p>
                <p className="text-sm text-muted-foreground">Chapter 5: Fractions</p>
              </div>
              <span className="text-sm text-primary">Tomorrow</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium text-foreground">Science Live Class - Ama</p>
                <p className="text-sm text-muted-foreground">Topic: Solar System</p>
              </div>
              <span className="text-sm text-muted-foreground">Dec 15</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium text-foreground">Subscription Renewal</p>
                <p className="text-sm text-muted-foreground">Monthly Plan</p>
              </div>
              <span className="text-sm text-tertiary">Dec 20</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

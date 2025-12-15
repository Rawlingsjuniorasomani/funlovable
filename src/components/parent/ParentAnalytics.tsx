import { useState, useEffect } from "react";
import { TrendingUp, Users, Clock, Award, BookOpen, DollarSign, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, BarChart, Bar, ResponsiveContainer, LineChart, Line } from "recharts";
import { analyticsAPI } from "@/config/api";
import { toast } from "sonner";

export function ParentAnalytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const result = await analyticsAPI.getParent();
      setData(result);
    } catch (error) {
      console.error("Failed to load analytics:", error);
      toast.error("Could not load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => `GH₵${value}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  const { overview, children, weeklyActivity, monthlyPayments, subjectBreakdown, recentActivity } = data;

  // Generate dynamic chart colors and config
  const chartConfig: any = {
    amount: { label: "Payment", color: "hsl(var(--tertiary))" },
  };

  const colors = [
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "hsl(var(--accent))",
    "hsl(var(--destructive))",
  ];

  children.forEach((child: any, index: number) => {
    const key = child.name.toLowerCase().split(' ')[0];
    chartConfig[key] = {
      label: child.name,
      color: colors[index % colors.length]
    };
  });

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
            <p className="text-2xl font-bold text-foreground">{overview?.totalEnrolled || 0}</p>
            <p className="text-xs text-muted-foreground">Children Enrolled</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-5 h-5 text-secondary" />
              {/* <span className="text-xs text-green-500">+3%</span> */}
            </div>
            <p className="text-2xl font-bold text-foreground">{overview?.avgScore || 0}%</p>
            <p className="text-xs text-muted-foreground">Average Score</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-tertiary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{overview?.weeklyLearningMinutes || 0} min</p>
            <p className="text-xs text-muted-foreground">Learning Time (Week)</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-quaternary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(overview?.totalInvested || 0)}</p>
            <p className="text-xs text-muted-foreground">Total Invested</p>
          </CardContent>
        </Card>
      </div>

      {/* Children Progress Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {children.map((child: any) => (
          <Card key={child.id}>
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
                {children.map((child: any, i: number) => {
                  const key = child.name.toLowerCase().split(' ')[0];
                  return (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={colors[i % colors.length]}
                      strokeWidth={2}
                      dot
                    />
                  );
                })}
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
                <XAxis dataKey="month_label" />
                <YAxis tickFormatter={(val) => `GH₵${val}`} />
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
                <Bar dataKey="amount" fill="hsl(var(--tertiary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Subject Comparison */}
      {subjectBreakdown.length > 0 && (
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
                {children.map((child: any, i: number) => {
                  const key = child.name.toLowerCase().split(' ')[0];
                  return (
                    <Bar
                      key={key}
                      dataKey={key}
                      fill={colors[i % colors.length]}
                      radius={[0, 4, 4, 0]}
                    />
                  );
                })}
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" /> Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((activity: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-foreground">{activity.name} - {activity.student_name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{activity.type}</p>
                  </div>
                  <span className="text-sm text-primary">
                    {new Date(activity.date).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">No recent activity</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

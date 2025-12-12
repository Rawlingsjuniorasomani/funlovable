import { BarChart3, TrendingUp, Users, DollarSign, Target, Clock, Download, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAnalyticsData, getOverviewMetrics } from "@/data/analyticsData";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--tertiary))", "hsl(var(--quaternary))"];

export function AdminAnalytics() {
  const { dailyStats } = getAnalyticsData();
  const metrics = getOverviewMetrics();

  const last14Days = dailyStats.slice(-14);
  const last7Days = dailyStats.slice(-7);

  const userTypeData = [
    { name: "Students", value: 0 },
    { name: "Parents", value: 0 },
    { name: "Teachers", value: 0 },
  ];

  const chartConfig = {
    registrations: { label: "Registrations", color: "hsl(var(--primary))" },
    payments: { label: "Payments", color: "hsl(var(--secondary))" },
    revenue: { label: "Revenue", color: "hsl(var(--tertiary))" },
    activeUsers: { label: "Active Users", color: "hsl(var(--quaternary))" },
  };

  const formatCurrency = (value: number) => `GH₵${value}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">Platform performance insights and metrics</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-primary" />
              <span className={`text-xs ${metrics.registrations.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {metrics.registrations.change >= 0 ? '+' : ''}{metrics.registrations.change}%
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{metrics.registrations.value}</p>
            <p className="text-xs text-muted-foreground">New Registrations (7d)</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-secondary" />
              <span className={`text-xs ${metrics.revenue.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {metrics.revenue.change >= 0 ? '+' : ''}{metrics.revenue.change}%
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(metrics.revenue.value)}</p>
            <p className="text-xs text-muted-foreground">Revenue (7d)</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-tertiary" />
              <span className={`text-xs ${metrics.activeUsers.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {metrics.activeUsers.change >= 0 ? '+' : ''}{metrics.activeUsers.change}%
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{metrics.activeUsers.value}</p>
            <p className="text-xs text-muted-foreground">Daily Active Users (avg)</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-quaternary" />
              <span className={`text-xs ${metrics.quizzes.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {metrics.quizzes.change >= 0 ? '+' : ''}{metrics.quizzes.change}%
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{metrics.quizzes.value}</p>
            <p className="text-xs text-muted-foreground">Quizzes Completed (7d)</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Registration Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Registration Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <AreaChart data={last14Days}>
                <defs>
                  <linearGradient id="registrationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="registrations" stroke="hsl(var(--primary))" fill="url(#registrationGradient)" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-secondary" /> Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <BarChart data={last14Days}>
                <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} />
                <YAxis tickFormatter={(val) => `GH₵${val}`} />
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
                <Bar dataKey="revenue" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* User Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" /> User Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {userTypeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Activity Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" /> Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-48 w-full">
              <LineChart data={last7Days}>
                <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { weekday: 'short' })} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="activeUsers" stroke="hsl(var(--primary))" strokeWidth={2} dot />
                <Line type="monotone" dataKey="quizzes" stroke="hsl(var(--tertiary))" strokeWidth={2} dot />
                <Line type="monotone" dataKey="lessonsViewed" stroke="hsl(var(--quaternary))" strokeWidth={2} dot />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" /> Recent Activity Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {last7Days.slice(-3).reverse().map((day) => (
              <div key={day.date} className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm font-medium text-foreground mb-2">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>{day.registrations} new registrations</p>
                  <p>{day.payments} payments ({formatCurrency(day.revenue)})</p>
                  <p>{day.activeUsers} active users</p>
                  <p>{day.quizzes} quizzes completed</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

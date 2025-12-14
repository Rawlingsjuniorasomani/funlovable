import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, DollarSign, Target, Clock, Download, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { analyticsAPI } from "@/config/api";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--tertiary))", "hsl(var(--quaternary))"];

export function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await analyticsAPI.getAdmin();
      setData(res);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return <AnalyticsSkeleton />;
  }

  // Transform User Counts for Pie Chart
  const userTypeData = (data.userCounts || []).map((item: any) => ({
    name: item.role.charAt(0).toUpperCase() + item.role.slice(1) + 's',
    value: parseInt(item.count)
  }));


  // Merge Dates for Trends (Revenue & Registrations)
  // Create a map of last 14 days
  const last14DaysMap = new Map();
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
    last14DaysMap.set(dateStr, { date: dateStr, registrations: 0, revenue: 0 });
  }

  // Fill Registrations
  (data.newUsers || []).forEach((item: any) => {
    const key = new Date(item.date).toISOString().split('T')[0];
    if (last14DaysMap.has(key)) {
      last14DaysMap.get(key).registrations = parseInt(item.count);
    }
  });

  // Fill Revenue
  (data.dailyRevenue || []).forEach((item: any) => {
    const key = new Date(item.date).toISOString().split('T')[0];
    if (last14DaysMap.has(key)) {
      last14DaysMap.get(key).revenue = parseFloat(item.revenue);
    }
  });

  const last14Days = Array.from(last14DaysMap.values());
  const last7Days = last14Days.slice(-7);

  const chartConfig = {
    registrations: { label: "Registrations", color: "hsl(var(--primary))" },
    payments: { label: "Payments", color: "hsl(var(--secondary))" },
    revenue: { label: "Revenue", color: "hsl(var(--tertiary))" },
    activeUsers: { label: "Active Users", color: "hsl(var(--quaternary))" },
  };

  const formatCurrency = (value: number) => `GH₵${value}`;

  // Calculate totals for cards
  const totalRegistrationsLast7 = last7Days.reduce((acc, curr) => acc + curr.registrations, 0);
  const totalRevenueLast7 = last7Days.reduce((acc, curr) => acc + curr.revenue, 0);

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
              <span className="text-xs text-muted-foreground">Last 7 Days</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalRegistrationsLast7}</p>
            <p className="text-xs text-muted-foreground">New Registrations</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-secondary" />
              <span className="text-xs text-muted-foreground">Last 7 Days</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(totalRevenueLast7)}</p>
            <p className="text-xs text-muted-foreground">Revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-tertiary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{data.paymentStats?.successful_payments || 0}</p>
            <p className="text-xs text-muted-foreground">Total Payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-quaternary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{data.quizStats?.total_attempts || 0}</p>
            <p className="text-xs text-muted-foreground">Quizzes Taken</p>
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
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              {userTypeData.map((entry: any, index: number) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-sm text-muted-foreground">{entry.name}: {entry.value}</span>
                </div>
              ))}
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
                  <p>{day.revenue} payments ({formatCurrency(day.revenue)})</p>
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

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-1/3" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-64" />
    </div>
  )
}

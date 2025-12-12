import { Users, GraduationCap, UserCheck, BookOpen, Target, Video, CreditCard, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { label: "Total Parents", value: "0", icon: Users, color: "text-primary", bgColor: "bg-primary/10" },
  { label: "Total Students", value: "0", icon: GraduationCap, color: "text-secondary", bgColor: "bg-secondary/10" },
  { label: "Total Teachers", value: "0", icon: UserCheck, color: "text-tertiary", bgColor: "bg-tertiary/10" },
  { label: "Subjects", value: "0", icon: BookOpen, color: "text-accent", bgColor: "bg-accent/10" },
  { label: "Active Quizzes", value: "0", icon: Target, color: "text-primary", bgColor: "bg-primary/10" },
  { label: "Live Classes", value: "0", icon: Video, color: "text-destructive", bgColor: "bg-destructive/10" },
  { label: "Revenue (Month)", value: "$0", icon: CreditCard, color: "text-secondary", bgColor: "bg-secondary/10" },
  { label: "Growth", value: "0%", icon: TrendingUp, color: "text-tertiary", bgColor: "bg-tertiary/10" },
];

export function AdminOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of platform performance and metrics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={stat.label} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>No recent activity to display</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>No alerts at this time</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

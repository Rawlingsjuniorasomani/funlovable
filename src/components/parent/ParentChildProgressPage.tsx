import { useParams, Link } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { ArrowLeft, BookOpen, Brain, Award, Clock, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatsCard } from "@/components/dashboard/StatsCard";

export function ParentChildProgressPage() {
  const { childId } = useParams();
  const { user } = useAuthContext();

  const child = user?.children?.find(c => c.id === childId);

  if (!child) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Child not found</h2>
        <Link to="/parent/children">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Children
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      { }
      <div className="flex items-center gap-4">
        <Link to="/parent/children">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-tertiary text-primary-foreground flex items-center justify-center text-2xl font-bold">
            {child.avatar || child.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">{child.name}</h1>
            <p className="text-muted-foreground">{child.grade} • Age {child.age}</p>
          </div>
        </div>
      </div>

      { }
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard title="Lessons" value={0} icon={BookOpen} color="blue" />
        <StatsCard title="Quizzes" value={0} icon={Brain} color="purple" />
        <StatsCard title="Badges" value={0} icon={Award} color="green" />
        <StatsCard title="Study Time" value="0h" icon={Clock} color="orange" />
      </div>

      { }
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-display font-semibold mb-4">Enrolled Subjects</h3>
        {child.subjects.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {child.subjects.map((subjectId) => (
              <Link key={subjectId} to={`/parent/child/${childId}/subject/${subjectId}`}>
                <div className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border hover:border-primary/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium capitalize">{subjectId}</span>
                    <span className="text-sm text-muted-foreground">{/* Todo: fetch score */}View Details</span>
                  </div>
                  <Progress value={0} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">Click to view progress</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No subjects enrolled</p>
          </div>
        )}
      </div>

      { }
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Recent Activity
        </h3>
        <div className="text-center py-8 text-muted-foreground">
          <p>No recent activity</p>
          <p className="text-sm">Activity will appear here once {child.name} starts learning</p>
        </div>
      </div>
    </div>
  );
}

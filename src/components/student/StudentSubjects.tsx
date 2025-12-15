import { useState, useEffect } from "react";
import { BookOpen, ChevronRight, Loader2, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { subjectsAPI } from "@/config/api";
import { toast } from "sonner";

export function StudentSubjects() {
  const [enrolledSubjects, setEnrolledSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEnrolledSubjects();
  }, []);

  const loadEnrolledSubjects = async () => {
    try {
      const data = await subjectsAPI.getEnrolled();
      setEnrolledSubjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load enrolled subjects", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">My Subjects</h1>
          <p className="text-muted-foreground">Continue learning where you left off</p>
        </div>
        <Link to="/subjects">
          <Button variant="outline">
            Browse All Subjects
          </Button>
        </Link>
      </div>

      {enrolledSubjects.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-display text-xl font-semibold mb-2">No Subjects Enrolled</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            You haven't enrolled in any subjects yet. Browse available subjects to start your learning journey.
          </p>
          <Link to="/subjects">
            <Button size="lg" className="btn-bounce">
              Browse Available Subjects
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledSubjects.map((subject) => (
            <div key={subject.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-32 bg-secondary/10 flex items-center justify-center">
                <span className="text-4xl">{subject.icon || "📚"}</span>
              </div>
              <div className="p-6">
                <h3 className="font-display font-semibold text-lg mb-2">{subject.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{subject.description}</p>
                <div className="flex items-center text-xs text-muted-foreground mb-4">
                  <BookOpen className="w-3 h-3 mr-1" />
                  {subject.lesson_count || 0} Lessons
                </div>
                <Link to={`/student/learning/${subject.id}`}>
                  <Button className="w-full">
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Continue Learning
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

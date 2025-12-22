import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, BookOpen, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { subjectsAPI } from "@/config/api";
import { toast } from "sonner";



const gradeFilters = ["All", "Primary", "JHS"];

const Subjects = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const data = await subjectsAPI.getAll();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load subjects", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (subjectId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role === 'student') {
      try {
        await subjectsAPI.enroll(subjectId);
        toast.success("Enrolled successfully!");
        navigate(`/student/learning/${subjectId}`);
      } catch (error: any) {
        if (error.response?.data?.message === 'Already enrolled') {
          navigate(`/student/learning/${subjectId}`);
        } else {
          toast.error("Failed to enroll");
        }
      }
    } else {
      
      toast.info("Enrollment is for students only");
    }
  };

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch = subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (subject.description && subject.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        { }
        <section className="py-16 bg-gradient-to-br from-primary/5 via-tertiary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
                Explore <span className="gradient-text">Subjects</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Discover our comprehensive curriculum designed to make learning engaging and effective.
              </p>

              { }
              <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search subjects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        { }
        <section className="py-16">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredSubjects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">No subjects found matching your search.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSubjects.map((subject, index) => (
                  <div
                    key={subject.id || index}
                    className="group bg-card rounded-2xl overflow-hidden border border-border card-hover animate-fade-in flex flex-col h-full"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >

                    <div className="p-8 flex flex-col flex-grow items-center text-center">
                      <h3 className="font-display font-semibold text-2xl mb-4">{subject.name}</h3>

                      <div className="flex items-center justify-center text-sm text-muted-foreground mb-6">
                        <span className="flex items-center gap-1 bg-secondary/10 px-3 py-1 rounded-full">
                          {subject.lessons || 0} lessons
                        </span>
                      </div>

                      <Button
                        onClick={() => handleAction(subject.id)}
                        className="w-full btn-bounce bg-gradient-to-r from-primary to-tertiary hover:opacity-90 mt-auto"
                      >
                        {user?.role === 'student' ? "Enroll & Start Learning" : "Start Learning"}
                        <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Subjects;

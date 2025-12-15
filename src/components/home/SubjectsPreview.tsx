import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, Book, FlaskConical, Calculator, Globe, Palette, Monitor } from "lucide-react";
import { useEffect, useState } from "react";
import { subjectsAPI } from "@/config/api";

const SUBJECT_IMAGES: Record<string, string> = {
  "Mathematics": "/images/subjects/mathematics.png",
  "Science": "/images/subjects/science.png",
  "English": "/images/subjects/english.png",
  "Social Studies": "/images/subjects/social-studies.png",
  "Creative Arts": "/images/subjects/creative-arts.png",
  "ICT": "/images/subjects/computing.png",
  "Computing": "/images/subjects/computing.png", // Alias for ICT if needed
};

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=600";

const COLORS = [
  "from-blue-500/20 to-blue-600/20 text-blue-600",
  "from-green-500/20 to-green-600/20 text-green-600",
  "from-purple-500/20 to-purple-600/20 text-purple-600",
  "from-orange-500/20 to-orange-600/20 text-orange-600",
  "from-pink-500/20 to-pink-600/20 text-pink-600",
  "from-teal-500/20 to-teal-600/20 text-teal-600",
];

export function SubjectsPreview() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const data = await subjectsAPI.getAll();
      setSubjects(data);
    } catch (error) {
      console.error("Failed to load subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Explore <span className="gradient-text">Subjects</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              Discover our wide range of subjects designed for comprehensive learning. Each course is crafted to engage and inspire.
            </p>
          </div>
          <Link to="/subjects">
            <Button variant="outline" className="btn-bounce rounded-full px-6">
              View All Subjects
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {subjects.map((subject, index) => {
            const image = subject.image_url || SUBJECT_IMAGES[subject.name] || FALLBACK_IMAGE;
            const colorClass = COLORS[index % COLORS.length];

            return (
              <div
                key={subject.id || index}
                className="group bg-card rounded-3xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 animate-fade-in flex flex-col h-full"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Image Header */}
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                  <img
                    src={image}
                    alt={subject.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className={`absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm ${colorClass.split(' ')[2]}`}>
                    {/* Fallback to simple icon if no specific emoji logic, or keep text emoji */}
                    <span className="text-xl">{subject.icon || "📚"}</span>
                  </div>
                  <div className="absolute bottom-4 left-4 z-20 text-white">
                    <span className="text-xs font-medium bg-primary/90 px-2 py-1 rounded-full backdrop-blur-sm">
                      {subject.lessons || 0} Lessons
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-display font-bold text-xl mb-2 group-hover:text-primary transition-colors">
                    {subject.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6 line-clamp-2 flex-grow">
                    {subject.description}
                  </p>

                  <Link to={`/subjects/${subject.id}`} className="mt-auto">
                    <Button className="w-full rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300" variant="secondary">
                      Start Learning
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

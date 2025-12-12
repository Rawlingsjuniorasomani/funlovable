import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const subjects = [
  {
    name: "Mathematics",
    emoji: "🔢",
    description: "Numbers, algebra, geometry, and problem-solving skills.",
    lessons: 45,
    color: "from-primary to-primary/60",
  },
  {
    name: "Science",
    emoji: "🔬",
    description: "Explore the wonders of biology, chemistry, and physics.",
    lessons: 38,
    color: "from-secondary to-secondary/60",
  },
  {
    name: "English",
    emoji: "📖",
    description: "Reading, writing, grammar, and communication skills.",
    lessons: 52,
    color: "from-tertiary to-tertiary/60",
  },
  {
    name: "Social Studies",
    emoji: "🌍",
    description: "History, geography, and understanding our world.",
    lessons: 30,
    color: "from-quaternary to-quaternary/60",
  },
  {
    name: "Creative Arts",
    emoji: "🎨",
    description: "Express creativity through art, music, and design.",
    lessons: 25,
    color: "from-accent to-accent/60",
  },
  {
    name: "ICT",
    emoji: "💻",
    description: "Computer skills and digital literacy for the modern world.",
    lessons: 28,
    color: "from-primary to-tertiary",
  },
];

export function SubjectsPreview() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Explore <span className="gradient-text">Subjects</span>
            </h2>
            <p className="text-muted-foreground">
              Discover our wide range of subjects designed for comprehensive learning.
            </p>
          </div>
          <Link to="/subjects">
            <Button variant="outline" className="btn-bounce">
              View All Subjects
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject, index) => (
            <div
              key={subject.name}
              className="group bg-card rounded-2xl overflow-hidden border border-border card-hover animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`h-24 flex items-center justify-center text-4xl ${subject.color}`}>
                {subject.emoji}
              </div>
              <div className="p-6">
                <h3 className="font-display font-semibold text-xl mb-2">{subject.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{subject.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {subject.lessons} Lessons
                  </span>
                  <Link to="/subjects">
                    <Button size="sm" variant="ghost" className="group-hover:text-orange-600">
                      Explore
                      <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

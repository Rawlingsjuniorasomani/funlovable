import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { subjectsAPI } from "@/config/api";

const COLORS = [
  "from-primary/20 to-primary/30 text-primary",
  "from-secondary/20 to-secondary/30 text-secondary",
  "from-tertiary/20 to-tertiary/30 text-tertiary",
  "from-quaternary/20 to-quaternary/30 text-quaternary",
  "from-accent/20 to-accent/30 text-accent-foreground",
  "from-primary/20 to-tertiary/30 text-primary",
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
    <motion.section
      className="py-20"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Explore <span className="gradient-text">Subjects</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              Discover our wide range of subjects designed for comprehensive learning.
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
            return (
              <motion.div
                key={subject.id || index}
                className="group bg-card rounded-3xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                whileHover={{ translateY: -4 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <div className="p-8 flex flex-col flex-grow items-center text-center">
                  <h3 className="font-display font-bold text-2xl mb-4 group-hover:text-primary transition-colors">
                    {subject.name}
                  </h3>

                  <span className="text-sm font-medium bg-secondary/10 text-secondary-foreground px-3 py-1 rounded-full mb-6">
                    {subject.lessons || 0} Lessons
                  </span>

                  <Link to={`/subjects/${subject.id}`} className="mt-auto w-full">
                    <Button className="w-full rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300" variant="secondary">
                      Start Learning
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}

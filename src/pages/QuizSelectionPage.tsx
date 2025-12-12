import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Clock, Zap, Trophy, ChevronRight, Filter } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { XPDisplay } from "@/components/gamification/XPDisplay";
import { AchievementBadges } from "@/components/gamification/AchievementBadges";
import { quizzes, subjects, Quiz } from "@/data/quizData";
import { cn } from "@/lib/utils";

const difficultyColors = {
  easy: "bg-secondary/10 text-secondary border-secondary/30",
  medium: "bg-accent/10 text-accent border-accent/30",
  hard: "bg-destructive/10 text-destructive border-destructive/30",
};

const subjectIcons: Record<string, string> = {
  Mathematics: "📐",
  Science: "🔬",
  English: "📚",
  "Social Studies": "🌍",
  ICT: "💻",
  French: "🇫🇷",
  "Religious & Moral Education": "🙏",
};

export default function QuizSelectionPage() {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const filteredQuizzes = selectedSubject
    ? quizzes.filter((q) => q.subject === selectedSubject)
    : quizzes;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header Section */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">Quiz Center</h1>
            <p className="text-muted-foreground">Test your knowledge and earn XP!</p>
          </div>

          {/* XP Display */}
          <div className="mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <XPDisplay />
          </div>

          {/* Achievements Preview */}
          <div className="mb-8 p-6 bg-card rounded-xl border border-border animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Trophy className="w-5 h-5 text-accent" />
                Your Achievements
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate("/achievements")}>
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <AchievementBadges maxDisplay={8} />
          </div>

          {/* Subject Filter */}
          <div className="mb-6 flex flex-wrap gap-2 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button
              variant={selectedSubject === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSubject(null)}
              className="btn-bounce"
            >
              <Filter className="w-4 h-4 mr-2" />
              All Subjects
            </Button>
            {subjects.map((subject) => (
              <Button
                key={subject}
                variant={selectedSubject === subject ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSubject(subject)}
                className="btn-bounce"
              >
                <span className="mr-2">{subjectIcons[subject] || "📖"}</span>
                {subject}
              </Button>
            ))}
          </div>

          {/* Quiz Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz, index) => (
              <QuizCard 
                key={quiz.id} 
                quiz={quiz} 
                onClick={() => navigate(`/quiz/${quiz.id}`)}
                delay={0.4 + index * 0.05}
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function QuizCard({ quiz, onClick, delay }: { quiz: Quiz; onClick: () => void; delay: number }) {
  const subjectIcons: Record<string, string> = {
    Mathematics: "📐",
    Science: "🔬",
    English: "📚",
    "Social Studies": "🌍",
    ICT: "💻",
    French: "🇫🇷",
    "Religious & Moral Education": "🙏",
  };

  return (
    <div
      className="group bg-card rounded-xl border border-border p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer animate-fade-in card-hover"
      style={{ animationDelay: `${delay}s` }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-tertiary/20 flex items-center justify-center text-2xl">
          {subjectIcons[quiz.subject] || "📖"}
        </div>
        <Badge variant="outline" className={cn("capitalize", difficultyColors[quiz.difficulty])}>
          {quiz.difficulty}
        </Badge>
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
        {quiz.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">{quiz.description}</p>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-1">
          <BookOpen className="w-4 h-4" />
          <span>{quiz.questions.length} questions</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{quiz.duration} min</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 text-accent">
          <Zap className="w-4 h-4" />
          <span className="text-sm font-bold">+{quiz.xpReward} XP</span>
        </div>
        <Button size="sm" variant="ghost" className="group-hover:bg-primary group-hover:text-primary-foreground">
          Start Quiz <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

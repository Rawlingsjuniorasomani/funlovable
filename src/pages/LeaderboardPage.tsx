import { useState } from "react";
import { Trophy, Medal, Flame, Zap, Star, Target, BookOpen, TrendingUp, Crown, ChevronDown } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { XPDisplay } from "@/components/gamification/XPDisplay";
import { cn } from "@/lib/utils";

// Types
export interface Student {
  id: string;
  name: string;
  avatar: string; // Emoji
  grade: string;
  xp: number;
  level: number;
  streak: number;
  quizzesCompleted: number;
  avgScore: number;
  badges: string[];
}

type SortBy = "xp" | "streak" | "quizzes" | "avgScore";
type FilterGrade = "all" | "Primary 5" | "Primary 6" | "JHS 1";

const rankColors = [
  "bg-gradient-to-br from-yellow-400 to-amber-500", // 1st - Gold
  "bg-gradient-to-br from-gray-300 to-gray-400", // 2nd - Silver  
  "bg-gradient-to-br from-amber-600 to-orange-700", // 3rd - Bronze
];

const rankIcons = [Crown, Medal, Medal];

export default function LeaderboardPage() {
  const [sortBy, setSortBy] = useState<SortBy>("xp");
  const [filterGrade, setFilterGrade] = useState<FilterGrade>("all");

  // TODO: Fetch leaderboard from API
  const sortedStudents: Student[] = [];


  const topThree = sortedStudents.slice(0, 3);
  const rest = sortedStudents.slice(3);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 mb-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">Leaderboard</h1>
            <p className="text-muted-foreground">See how you rank against other students!</p>
          </div>

          {/* Your Stats */}
          <div className="mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <XPDisplay />
          </div>

          {/* Filters & Sort */}
          <div className="flex flex-wrap gap-4 mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="flex gap-2">
              <span className="text-sm text-muted-foreground self-center">Sort by:</span>
              {[
                { key: "xp", label: "XP", icon: Zap },
                { key: "streak", label: "Streak", icon: Flame },
                { key: "quizzes", label: "Quizzes", icon: Target },
                { key: "avgScore", label: "Score", icon: Star },
              ].map(({ key, label, icon: Icon }) => (
                <Button
                  key={key}
                  size="sm"
                  variant={sortBy === key ? "default" : "outline"}
                  onClick={() => setSortBy(key as SortBy)}
                  className="btn-bounce"
                >
                  <Icon className="w-4 h-4 mr-1" />
                  {label}
                </Button>
              ))}
            </div>
            <div className="flex gap-2 ml-auto">
              <span className="text-sm text-muted-foreground self-center">Grade:</span>
              {["all", "Primary 5", "Primary 6", "JHS 1"].map((grade) => (
                <Button
                  key={grade}
                  size="sm"
                  variant={filterGrade === grade ? "default" : "outline"}
                  onClick={() => setFilterGrade(grade as FilterGrade)}
                  className="btn-bounce"
                >
                  {grade === "all" ? "All" : grade}
                </Button>
              ))}
            </div>
          </div>

          {/* Top 3 Podium */}
          <div className="flex justify-center items-end gap-4 mb-12 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            {/* 2nd Place */}
            {topThree[1] && (
              <div className="text-center">
                <div className={cn("w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-2xl shadow-lg", rankColors[1])}>
                  {topThree[1].avatar}
                </div>
                <div className="bg-card rounded-xl border border-border p-4 min-w-[140px]">
                  <Medal className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                  <h3 className="font-semibold text-foreground truncate">{topThree[1].name}</h3>
                  <p className="text-xs text-muted-foreground">{topThree[1].grade}</p>
                  <p className="text-lg font-bold text-primary mt-1">{topThree[1].xp.toLocaleString()} XP</p>
                </div>
                <div className="h-24 bg-gradient-to-t from-gray-300 to-gray-200 rounded-t-lg mt-2 flex items-end justify-center pb-2">
                  <span className="text-2xl font-bold text-gray-600">2</span>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {topThree[0] && (
              <div className="text-center -mt-8">
                <div className="relative">
                  <div className={cn("w-24 h-24 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-3xl shadow-xl animate-glow", rankColors[0])}>
                    {topThree[0].avatar}
                  </div>
                  <Crown className="w-8 h-8 text-yellow-500 absolute -top-3 left-1/2 -translate-x-1/2 animate-bounce-slow" />
                </div>
                <div className="bg-card rounded-xl border-2 border-yellow-400 p-4 min-w-[160px] shadow-lg">
                  <Trophy className="w-7 h-7 text-yellow-500 mx-auto mb-1" />
                  <h3 className="font-bold text-foreground truncate">{topThree[0].name}</h3>
                  <p className="text-xs text-muted-foreground">{topThree[0].grade}</p>
                  <p className="text-xl font-bold text-primary mt-1">{topThree[0].xp.toLocaleString()} XP</p>
                </div>
                <div className="h-32 bg-gradient-to-t from-yellow-400 to-amber-300 rounded-t-lg mt-2 flex items-end justify-center pb-2">
                  <span className="text-3xl font-bold text-yellow-700">1</span>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {topThree[2] && (
              <div className="text-center">
                <div className={cn("w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-2xl shadow-lg", rankColors[2])}>
                  {topThree[2].avatar}
                </div>
                <div className="bg-card rounded-xl border border-border p-4 min-w-[140px]">
                  <Medal className="w-6 h-6 text-amber-600 mx-auto mb-1" />
                  <h3 className="font-semibold text-foreground truncate">{topThree[2].name}</h3>
                  <p className="text-xs text-muted-foreground">{topThree[2].grade}</p>
                  <p className="text-lg font-bold text-primary mt-1">{topThree[2].xp.toLocaleString()} XP</p>
                </div>
                <div className="h-16 bg-gradient-to-t from-amber-600 to-orange-400 rounded-t-lg mt-2 flex items-end justify-center pb-2">
                  <span className="text-2xl font-bold text-amber-800">3</span>
                </div>
              </div>
            )}
          </div>

          {/* Rest of Rankings */}
          <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="p-4 bg-muted/30 border-b border-border">
              <h2 className="font-semibold text-foreground">Full Rankings</h2>
            </div>
            <div className="divide-y divide-border">
              {rest.map((student, index) => (
                <LeaderboardRow
                  key={student.id}
                  student={student}
                  rank={index + 4}
                  sortBy={sortBy}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function LeaderboardRow({ student, rank, sortBy }: { student: Student; rank: number; sortBy: SortBy }) {
  const getValue = () => {
    switch (sortBy) {
      case "xp": return `${student.xp.toLocaleString()} XP`;
      case "streak": return `${student.streak} days`;
      case "quizzes": return `${student.quizzesCompleted} quizzes`;
      case "avgScore": return `${student.avgScore}%`;
    }
  };

  return (
    <div className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
      <span className="text-lg font-bold text-muted-foreground w-8 text-center">#{rank}</span>
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-tertiary flex items-center justify-center text-primary-foreground font-bold">
        {student.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-foreground truncate">{student.name}</h4>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{student.grade}</span>
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3" />
            Level {student.level}
          </span>
          {student.streak > 0 && (
            <span className="flex items-center gap-1 text-destructive">
              <Flame className="w-3 h-3" />
              {student.streak}
            </span>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-foreground">{getValue()}</p>
        <div className="flex items-center gap-1 text-xs text-secondary">
          <TrendingUp className="w-3 h-3" />
          <span>+{Math.floor(Math.random() * 100 + 50)} this week</span>
        </div>
      </div>
    </div>
  );
}

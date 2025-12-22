import { Trophy, Star, Flame, BookOpen, Target } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { XPDisplay } from "@/components/gamification/XPDisplay";
import { ALL_ACHIEVEMENTS, useGamification } from "@/hooks/useGamification";
import { cn } from "@/lib/utils";

const typeIcons = {
  quizzes: Target,
  lessons: BookOpen,
  streak: Flame,
  perfect: Star,
  xp: Trophy,
};

export default function AchievementsPage() {
  const { achievements, quizzesCompleted, lessonsCompleted, perfectScores, streak, xp } = useGamification();

  const getProgress = (achievement: typeof ALL_ACHIEVEMENTS[0]) => {
    let current = 0;
    switch (achievement.type) {
      case "quizzes":
        current = quizzesCompleted;
        break;
      case "lessons":
        current = lessonsCompleted;
        break;
      case "perfect":
        current = perfectScores;
        break;
      case "streak":
        current = streak;
        break;
      case "xp":
        current = xp;
        break;
    }
    return Math.min(current / achievement.requirement * 100, 100);
  };

  const getCurrentValue = (achievement: typeof ALL_ACHIEVEMENTS[0]) => {
    switch (achievement.type) {
      case "quizzes":
        return quizzesCompleted;
      case "lessons":
        return lessonsCompleted;
      case "perfect":
        return perfectScores;
      case "streak":
        return streak;
      case "xp":
        return xp;
    }
  };

  const groupedAchievements = ALL_ACHIEVEMENTS.reduce((acc, achievement) => {
    if (!acc[achievement.type]) acc[achievement.type] = [];
    acc[achievement.type].push(achievement);
    return acc;
  }, {} as Record<string, typeof ALL_ACHIEVEMENTS>);

  const typeLabels = {
    quizzes: "Quiz Achievements",
    lessons: "Lesson Achievements",
    streak: "Streak Achievements",
    perfect: "Perfect Score Achievements",
    xp: "XP Achievements",
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          { }
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">Achievements</h1>
            <p className="text-muted-foreground">Track your learning milestones and unlock badges!</p>
          </div>

          { }
          <div className="mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <XPDisplay />
          </div>

          { }
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Quizzes Completed", value: quizzesCompleted, icon: Target, color: "text-primary" },
              { label: "Lessons Completed", value: lessonsCompleted, icon: BookOpen, color: "text-secondary" },
              { label: "Perfect Scores", value: perfectScores, icon: Star, color: "text-accent" },
              { label: "Day Streak", value: streak, icon: Flame, color: "text-destructive" },
            ].map((stat, index) => (
              <div 
                key={stat.label}
                className="bg-card rounded-xl border border-border p-4 text-center animate-fade-in"
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                <stat.icon className={cn("w-8 h-8 mx-auto mb-2", stat.color)} />
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          { }
          {Object.entries(groupedAchievements).map(([type, typeAchievements], groupIndex) => {
            const Icon = typeIcons[type as keyof typeof typeIcons];
            return (
              <div 
                key={type} 
                className="mb-8 animate-fade-in"
                style={{ animationDelay: `${0.5 + groupIndex * 0.1}s` }}
              >
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Icon className="w-5 h-5" />
                  {typeLabels[type as keyof typeof typeLabels]}
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {typeAchievements.map((achievement) => {
                    const unlocked = achievements.includes(achievement.id);
                    const progress = getProgress(achievement);
                    const currentValue = getCurrentValue(achievement);
                    
                    return (
                      <div
                        key={achievement.id}
                        className={cn(
                          "bg-card rounded-xl border p-4 transition-all duration-300",
                          unlocked 
                            ? "border-accent/50 bg-gradient-to-br from-accent/5 to-primary/5" 
                            : "border-border"
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0",
                            unlocked 
                              ? "bg-gradient-to-br from-accent/20 to-primary/20" 
                              : "bg-muted grayscale opacity-50"
                          )}>
                            {achievement.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={cn(
                              "font-semibold mb-0.5",
                              unlocked ? "text-foreground" : "text-muted-foreground"
                            )}>
                              {achievement.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                            
                            {!unlocked && (
                              <div className="space-y-1">
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-primary to-tertiary transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {currentValue} / {achievement.requirement}
                                </p>
                              </div>
                            )}
                            
                            {unlocked && (
                              <span className="inline-flex items-center gap-1 text-xs text-secondary font-medium">
                                <Trophy className="w-3 h-3" />
                                Unlocked!
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}

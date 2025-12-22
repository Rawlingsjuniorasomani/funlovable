import { useState, useEffect } from "react";
import { Brain, Clock, Trophy, Play, CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Quiz } from "@/data/quizData"; 
import { useQuizResults } from "@/hooks/useQuizResults";
import { MultiFormatQuizPlayer } from "@/components/quiz/MultiFormatQuizPlayer";
import { cn } from "@/lib/utils";
import { quizzesAPI } from "@/config/api";
import { useToast } from "@/hooks/use-toast";

export function StudentQuizzes() {
  const [loading, setLoading] = useState(true);
  const [quizzesList, setQuizzesList] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const { getBestResult, getStats, saveResult } = useQuizResults();
  const stats = getStats();
  const { toast } = useToast();

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const data = await quizzesAPI.getAvailable();
      
      
      
      const mappedQuizzes = (Array.isArray(data) ? data : []).map((q: any) => ({
        id: q.id,
        title: q.title,
        subject: q.subject_id || "General", 
        description: q.description || "",
        difficulty: q.difficulty || "medium",
        duration: q.time_limit_minutes || q.duration || 10,
        questions: [], 
        xpReward: q.xp_reward || 100,
        
      }));
      setQuizzesList(mappedQuizzes);
    } catch (error) {
      console.error("Failed to load quizzes", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async (quiz: Quiz) => {
    
    if (!quiz.questions || quiz.questions.length === 0) {
      try {
        const fullQuiz = await quizzesAPI.getById(quiz.id);
        
        
        
        const mappedQuestions = (fullQuiz.questions || []).map((q: any) => ({
          id: q.id,
          type: q.type || 'multiple-choice',
          question: q.text || q.question,
          options: q.options || [],
          correctAnswer: q.correct_answer || 0, 
          explanation: q.explanation
          
        }));

        const readyQuiz = {
          ...quiz,
          ...fullQuiz,
          title: fullQuiz.title || quiz.title,
          questions: mappedQuestions
        };
        setSelectedQuiz(readyQuiz as Quiz);
      } catch (e) {
        console.error("Failed to fetch quiz details", e);
        toast({ title: "Failed to load quiz content", variant: "destructive" });
        
        return;
      }
    } else {
      setSelectedQuiz(quiz);
    }
  };

  const handleQuizComplete = (score: number, total: number, xpEarned: number) => {
    if (selectedQuiz) {
      saveResult({
        quizId: selectedQuiz.id,
        score,
        totalQuestions: total,
        percentage: Math.round((score / total) * 100),
        xpEarned,
        timeSpent: selectedQuiz.duration * 60,
      });
    }
  };

  if (selectedQuiz) {
    return (
      <div className="space-y-6">
        <MultiFormatQuizPlayer
          quiz={selectedQuiz}
          onComplete={handleQuizComplete}
          onClose={() => setSelectedQuiz(null)}
        />
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-secondary/20 text-secondary';
      case 'medium': return 'bg-accent/20 text-accent';
      case 'hard': return 'bg-destructive/20 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) return <div className="p-8 text-center">Loading quizzes...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Quizzes</h1>
        <p className="text-muted-foreground">Test your knowledge with interactive quizzes</p>
      </div>

      { }
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-2xl font-bold text-foreground">{quizzesList.length}</p>
          <p className="text-sm text-muted-foreground">Available</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-2xl font-bold text-secondary">{stats.uniqueQuizzes}</p>
          <p className="text-sm text-muted-foreground">Completed</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-2xl font-bold text-primary">{stats.totalXP}</p>
          <p className="text-sm text-muted-foreground">XP Earned</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-2xl font-bold text-star">{stats.avgScore}%</p>
          <p className="text-sm text-muted-foreground">Avg Score</p>
        </div>
      </div>

      { }
      <div className="grid gap-4">
        {quizzesList.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">No quizzes available at the moment.</div>
        ) : (
          quizzesList.map((quiz) => {
            const bestResult = getBestResult(quiz.id);
            const isCompleted = !!bestResult;

            return (
              <div
                key={quiz.id}
                className={cn(
                  "bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-all duration-300",
                  isCompleted && "border-secondary/30"
                )}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-5 h-5 text-primary" />
                      <h3 className="font-display font-semibold text-lg text-foreground">
                        {quiz.title}
                      </h3>
                      {isCompleted && (
                        <CheckCircle className="w-5 h-5 text-secondary" />
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">{quiz.description}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{quiz.subject}</Badge>
                      <Badge className={getDifficultyColor(quiz.difficulty)}>
                        {quiz.difficulty}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {quiz.duration} min
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="w-4 h-4 text-star" />
                        {quiz.xpReward} XP
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {bestResult && (
                      <div className="text-right mb-2">
                        <div className="flex items-center gap-2">
                          <Trophy className={cn(
                            "w-5 h-5",
                            bestResult.percentage >= 80 ? "text-star" : "text-muted-foreground"
                          )} />
                          <span className="font-bold text-lg text-foreground">
                            {bestResult.percentage}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">Best Score</p>
                      </div>
                    )}
                    <Button
                      onClick={() => handleStartQuiz(quiz)}
                      variant={isCompleted ? "outline" : "default"}
                      className="w-full md:w-auto"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {isCompleted ? "Retake" : "Start Quiz"}
                    </Button>
                  </div>
                </div>

                {bestResult && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Your Progress</span>
                      <span className="font-medium text-foreground">
                        {bestResult.score}/{bestResult.totalQuestions} correct
                      </span>
                    </div>
                    <Progress value={bestResult.percentage} className="h-2" />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

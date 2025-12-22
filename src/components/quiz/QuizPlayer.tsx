import { useState, useEffect, useCallback } from "react";
import { Clock, CheckCircle, XCircle, ArrowRight, RotateCcw, Trophy, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuizProgress } from "@/hooks/useQuizProgress";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface QuizPlayerProps {
  quizId: string;
  title: string;
  subject: string;
  questions: QuizQuestion[];
  timeLimit?: number; 
  onComplete?: (score: number, total: number) => void;
  onClose?: () => void;
}

export function QuizPlayer({ quizId, title, subject, questions, timeLimit = 600, onComplete, onClose }: QuizPlayerProps) {
  const { progress, startQuiz, answerQuestion, completeQuiz, resetQuiz } = useQuizProgress(quizId);
  const { addNotification } = useNotifications();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizEnded, setQuizEnded] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;

  
  useEffect(() => {
    if (!progress && !quizStarted) {
      startQuiz(questions.length);
      setQuizStarted(true);
    } else if (progress && !progress.completed) {
      setCurrentIndex(progress.currentQuestion);
      setTimeLeft(timeLimit - progress.timeSpent);
      setQuizStarted(true);
    } else if (progress?.completed) {
      setQuizEnded(true);
    }
  }, [progress, questions.length, startQuiz, timeLimit, quizStarted]);

  
  useEffect(() => {
    if (!quizStarted || quizEnded || showResult) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleQuizEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, quizEnded, showResult]);

  const handleQuizEnd = useCallback(() => {
    const result = completeQuiz();
    setQuizEnded(true);
    
    if (result) {
      const percentage = Math.round((result.score / result.totalQuestions) * 100);
      addNotification({
        type: "quiz",
        title: "Quiz Completed!",
        description: `You scored ${result.score}/${result.totalQuestions} (${percentage}%) on ${title}`,
        actionUrl: "/student/quizzes",
      });
      onComplete?.(result.score, result.totalQuestions);
    }
  }, [completeQuiz, addNotification, title, onComplete]);

  const handleAnswerSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    
    const correct = selectedAnswer === currentQuestion.correctAnswer;
    answerQuestion(currentQuestion.id, selectedAnswer, correct);
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      handleQuizEnd();
    }
  };

  const handleRetake = () => {
    resetQuiz();
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(timeLimit);
    setQuizEnded(false);
    setQuizStarted(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  
  if (quizEnded && progress) {
    const percentage = Math.round((progress.score / progress.totalQuestions) * 100);
    const grade = percentage >= 90 ? "A+" : percentage >= 80 ? "A" : percentage >= 70 ? "B" : percentage >= 60 ? "C" : percentage >= 50 ? "D" : "F";
    
    return (
      <div className="bg-card rounded-2xl border border-border p-8 max-w-2xl mx-auto animate-scale-in">
        <div className="text-center mb-8">
          <div className={cn(
            "w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center",
            percentage >= 70 ? "bg-secondary/20" : percentage >= 50 ? "bg-accent/20" : "bg-destructive/20"
          )}>
            <Trophy className={cn(
              "w-12 h-12",
              percentage >= 70 ? "text-secondary" : percentage >= 50 ? "text-accent" : "text-destructive"
            )} />
          </div>
          <h2 className="text-3xl font-display font-bold text-foreground mb-2">Quiz Complete!</h2>
          <p className="text-muted-foreground">{title}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <p className="text-4xl font-bold text-foreground">{grade}</p>
            <p className="text-sm text-muted-foreground">Grade</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <p className="text-4xl font-bold text-primary">{progress.score}/{progress.totalQuestions}</p>
            <p className="text-sm text-muted-foreground">Score</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <p className="text-4xl font-bold text-tertiary">{percentage}%</p>
            <p className="text-sm text-muted-foreground">Accuracy</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" className="flex-1" onClick={handleRetake}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Retake Quiz
          </Button>
          <Button className="flex-1" onClick={onClose}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden max-w-3xl mx-auto">
      { }
      <div className="bg-gradient-to-r from-primary to-tertiary p-6 text-primary-foreground">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-80">{subject}</p>
            <h2 className="text-xl font-display font-bold">{title}</h2>
          </div>
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full",
            timeLeft < 60 ? "bg-destructive/20 text-destructive-foreground animate-pulse" : "bg-white/20"
          )}>
            <Clock className="w-5 h-5" />
            <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>
        </div>
        
        { }
        <div className="flex items-center gap-4">
          <Progress value={((currentIndex + (showResult ? 1 : 0)) / questions.length) * 100} className="h-2 flex-1 [&>div]:bg-white/80" />
          <span className="text-sm font-medium">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
      </div>

      { }
      <div className="p-8">
        <div className="mb-8 animate-fade-in" key={currentIndex}>
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Question {currentIndex + 1}</span>
          </div>
          <h3 className="text-xl font-semibold text-foreground">{currentQuestion?.question}</h3>
        </div>

        { }
        <div className="space-y-3 mb-8">
          {currentQuestion?.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrectAnswer = index === currentQuestion.correctAnswer;
            
            let optionStyle = "border-border hover:border-primary/50 hover:bg-primary/5";
            if (showResult) {
              if (isCorrectAnswer) {
                optionStyle = "border-secondary bg-secondary/10";
              } else if (isSelected && !isCorrectAnswer) {
                optionStyle = "border-destructive bg-destructive/10";
              }
            } else if (isSelected) {
              optionStyle = "border-primary bg-primary/10";
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showResult}
                className={cn(
                  "w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-4",
                  optionStyle,
                  !showResult && "cursor-pointer"
                )}
              >
                <span className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                  isSelected && !showResult && "bg-primary text-primary-foreground",
                  showResult && isCorrectAnswer && "bg-secondary text-secondary-foreground",
                  showResult && isSelected && !isCorrectAnswer && "bg-destructive text-destructive-foreground",
                  !isSelected && !showResult && "bg-muted text-muted-foreground"
                )}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1 text-foreground">{option}</span>
                {showResult && isCorrectAnswer && <CheckCircle className="w-5 h-5 text-secondary" />}
                {showResult && isSelected && !isCorrectAnswer && <XCircle className="w-5 h-5 text-destructive" />}
              </button>
            );
          })}
        </div>

        { }
        {showResult && currentQuestion?.explanation && (
          <div className="p-4 rounded-xl bg-muted/50 border border-border mb-6 animate-fade-in">
            <p className="text-sm font-medium text-foreground mb-1">Explanation:</p>
            <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
          </div>
        )}

        { }
        <div className="flex justify-end gap-4">
          {!showResult ? (
            <Button onClick={handleSubmitAnswer} disabled={selectedAnswer === null} className="btn-bounce">
              Submit Answer
            </Button>
          ) : (
            <Button onClick={handleNextQuestion} className="btn-bounce">
              {currentIndex < questions.length - 1 ? (
                <>
                  Next Question
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                "See Results"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

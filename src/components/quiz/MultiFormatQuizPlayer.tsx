import { useState, useEffect, useCallback } from "react";
import { Clock, ArrowRight, RotateCcw, Trophy, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuizProgress } from "@/hooks/useQuizProgress";
import { useGamification } from "@/hooks/useGamification";
import { useNotifications } from "@/hooks/useNotifications";
import { FillInBlankQuestion, FillInBlankQuestionData } from "./FillInBlankQuestion";
import { MatchingQuestion, MatchingQuestionData } from "./MatchingQuestion";
import { AnyQuestion, Quiz } from "@/data/quizData";
import { cn } from "@/lib/utils";

interface MultiFormatQuizPlayerProps {
  quiz: Quiz;
  onComplete?: (score: number, total: number, xpEarned: number) => void;
  onClose?: () => void;
}

export function MultiFormatQuizPlayer({ quiz, onComplete, onClose }: MultiFormatQuizPlayerProps) {
  const { progress, startQuiz, answerQuestion, completeQuiz, resetQuiz, loading } = useQuizProgress(quiz.id);
  const { completeQuiz: awardXP } = useGamification();
  const { addNotification } = useNotifications();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(quiz.duration * 60);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizEnded, setQuizEnded] = useState(false);
  const [currentCorrect, setCurrentCorrect] = useState<boolean | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const currentQuestion = quiz.questions[currentIndex];
  const timeLimit = quiz.duration * 60;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }


  useEffect(() => {
    if (!progress && !quizStarted) {
      startQuiz(quiz.questions.length);
      setQuizStarted(true);
    } else if (progress && !progress.completed) {
      setCurrentIndex(progress.currentQuestion);
      setTimeLeft(timeLimit - progress.timeSpent);
      setQuizStarted(true);
    } else if (progress?.completed) {
      setQuizEnded(true);
    }
  }, [progress, quiz.questions.length, startQuiz, timeLimit, quizStarted]);


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

  const handleQuizEnd = useCallback(async () => {
    const result = await completeQuiz();
    setQuizEnded(true);

    if (result) {
      const earned = awardXP(result.score, result.totalQuestions);
      setXpEarned(earned);

      const percentage = Math.round((result.score / result.totalQuestions) * 100);
      addNotification({
        type: "quiz",
        title: "Quiz Completed!",
        description: `You scored ${result.score}/${result.totalQuestions} (${percentage}%) on ${quiz.title} and earned ${earned} XP!`,
        actionUrl: "/quizzes",
      });
      onComplete?.(result.score, result.totalQuestions, earned);
    }
  }, [completeQuiz, awardXP, addNotification, quiz.title, onComplete]);

  const handleAnswerSubmit = (correct: boolean) => {
    setCurrentCorrect(correct);
    answerQuestion(currentQuestion.id, correct ? 1 : 0, correct);
    setShowResult(true);
  };

  const handleMultipleChoiceSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleMultipleChoiceSubmit = () => {
    if (selectedAnswer === null) return;
    const question = currentQuestion as { correctAnswer: number };
    const correct = selectedAnswer === question.correctAnswer;
    handleAnswerSubmit(correct);
  };

  const handleNextQuestion = () => {
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowResult(false);
      setCurrentCorrect(null);
      setSelectedAnswer(null);
    } else {
      handleQuizEnd();
    }
  };

  const handleRetake = () => {
    resetQuiz();
    setCurrentIndex(0);
    setShowResult(false);
    setCurrentCorrect(null);
    setSelectedAnswer(null);
    setTimeLeft(timeLimit);
    setQuizEnded(false);
    setQuizStarted(false);
    setXpEarned(0);
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
          <p className="text-muted-foreground">{quiz.title}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
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

        { }
        <div className="bg-gradient-to-r from-accent/20 to-primary/20 rounded-xl p-4 mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Zap className="w-6 h-6 text-accent" />
            <span className="text-2xl font-bold text-foreground">+{xpEarned} XP</span>
          </div>
          <p className="text-sm text-muted-foreground">Experience points earned!</p>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" className="flex-1" onClick={handleRetake}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Retake Quiz
          </Button>
          <Button className="flex-1" onClick={onClose}>
            Back to Quizzes
          </Button>
        </div>
      </div>
    );
  }

  const questionType = (currentQuestion as any).type || "multiple-choice";

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden max-w-3xl mx-auto">
      { }
      <div className="bg-gradient-to-r from-primary to-tertiary p-6 text-primary-foreground">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-80">{quiz.subject}</p>
            <h2 className="text-xl font-display font-bold">{quiz.title}</h2>
          </div>
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full",
            timeLeft < 60 ? "bg-destructive/20 text-destructive-foreground animate-pulse" : "bg-white/20"
          )}>
            <Clock className="w-5 h-5" />
            <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Progress value={((currentIndex + (showResult ? 1 : 0)) / quiz.questions.length) * 100} className="h-2 flex-1 [&>div]:bg-white/80" />
          <span className="text-sm font-medium">
            {currentIndex + 1} / {quiz.questions.length}
          </span>
        </div>
      </div>

      { }
      <div className="p-8">
        <div className="mb-6 animate-fade-in" key={currentIndex}>
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Question {currentIndex + 1}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground capitalize">
              {questionType.replace("-", " ")}
            </span>
          </div>
        </div>

        { }
        {questionType === "fill-blank" && (
          <FillInBlankQuestion
            question={currentQuestion as FillInBlankQuestionData}
            onSubmit={handleAnswerSubmit}
            showResult={showResult}
          />
        )}

        {questionType === "matching" && (
          <MatchingQuestion
            question={currentQuestion as MatchingQuestionData}
            onSubmit={handleAnswerSubmit}
            showResult={showResult}
          />
        )}

        {(questionType === "multiple-choice" || !questionType) && (
          <MultipleChoiceRenderer
            question={currentQuestion as { question: string; options: string[]; correctAnswer: number; explanation?: string }}
            selectedAnswer={selectedAnswer}
            showResult={showResult}
            onSelect={handleMultipleChoiceSelect}
            onSubmit={handleMultipleChoiceSubmit}
          />
        )}

        { }
        {showResult && (
          <div className="flex justify-end mt-6">
            <Button onClick={handleNextQuestion} className="btn-bounce">
              {currentIndex < quiz.questions.length - 1 ? (
                <>
                  Next Question
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                "See Results"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}


function MultipleChoiceRenderer({
  question,
  selectedAnswer,
  showResult,
  onSelect,
  onSubmit,
}: {
  question: { question: string; options: string[]; correctAnswer: number; explanation?: string };
  selectedAnswer: number | null;
  showResult: boolean;
  onSelect: (index: number) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="animate-fade-in">
      <h3 className="text-xl font-semibold text-foreground mb-6">{question.question}</h3>

      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrectAnswer = index === question.correctAnswer;

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
              onClick={() => onSelect(index)}
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
            </button>
          );
        })}
      </div>

      {showResult && question.explanation && (
        <div className="p-4 rounded-xl bg-muted/50 border border-border mb-6 animate-fade-in">
          <p className="text-sm font-medium text-foreground mb-1">Explanation:</p>
          <p className="text-sm text-muted-foreground">{question.explanation}</p>
        </div>
      )}

      {!showResult && (
        <Button onClick={onSubmit} disabled={selectedAnswer === null} className="btn-bounce">
          Submit Answer
        </Button>
      )}
    </div>
  );
}

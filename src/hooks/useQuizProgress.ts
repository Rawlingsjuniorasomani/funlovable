import { useState, useCallback, useEffect } from "react";

export interface QuizAnswer {
  questionId: string;
  selectedAnswer: number;
  correct: boolean;
}

export interface QuizProgress {
  quizId: string;
  answers: QuizAnswer[];
  currentQuestion: number;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  completed: boolean;
  startedAt: string;
  completedAt?: string;
}

const STORAGE_KEY = "lovable_quiz_progress";

export function useQuizProgress(quizId: string) {
  const [progress, setProgress] = useState<QuizProgress | null>(null);

  useEffect(() => {
    const allProgress = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (allProgress[quizId]) {
      setProgress(allProgress[quizId]);
    }
  }, [quizId]);

  const saveProgress = useCallback((newProgress: QuizProgress) => {
    const allProgress = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    allProgress[quizId] = newProgress;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
    setProgress(newProgress);
  }, [quizId]);

  const startQuiz = useCallback((totalQuestions: number) => {
    const newProgress: QuizProgress = {
      quizId,
      answers: [],
      currentQuestion: 0,
      score: 0,
      totalQuestions,
      timeSpent: 0,
      completed: false,
      startedAt: new Date().toISOString(),
    };
    saveProgress(newProgress);
    return newProgress;
  }, [quizId, saveProgress]);

  const answerQuestion = useCallback((questionId: string, selectedAnswer: number, correct: boolean) => {
    if (!progress) return;
    
    const newAnswer: QuizAnswer = { questionId, selectedAnswer, correct };
    const newProgress: QuizProgress = {
      ...progress,
      answers: [...progress.answers, newAnswer],
      currentQuestion: progress.currentQuestion + 1,
      score: correct ? progress.score + 1 : progress.score,
    };
    saveProgress(newProgress);
    return newProgress;
  }, [progress, saveProgress]);

  const updateTimeSpent = useCallback((timeSpent: number) => {
    if (!progress) return;
    saveProgress({ ...progress, timeSpent });
  }, [progress, saveProgress]);

  const completeQuiz = useCallback(() => {
    if (!progress) return;
    const completed: QuizProgress = {
      ...progress,
      completed: true,
      completedAt: new Date().toISOString(),
    };
    saveProgress(completed);
    return completed;
  }, [progress, saveProgress]);

  const resetQuiz = useCallback(() => {
    const allProgress = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    delete allProgress[quizId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
    setProgress(null);
  }, [quizId]);

  return {
    progress,
    startQuiz,
    answerQuestion,
    updateTimeSpent,
    completeQuiz,
    resetQuiz,
  };
}

// Get all quiz results
export function getAllQuizResults(): QuizProgress[] {
  const allProgress = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  return Object.values(allProgress).filter((p: any) => p.completed) as QuizProgress[];
}

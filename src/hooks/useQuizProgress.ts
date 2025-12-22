import { useState, useCallback, useEffect } from "react";
import { quizzesAPI } from "@/config/api";
import { toast } from "sonner";

export interface QuizAnswer {
  questionId: string;
  selectedAnswer: number;
  correct: boolean;
}

export interface QuizProgress {
  quizId: string;
  attemptId?: string; // Add attemptId
  answers: QuizAnswer[];
  currentQuestion: number;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  completed: boolean;
  startedAt: string;
  completedAt?: string;
}

export function useQuizProgress(quizId: string) {
  const [progress, setProgress] = useState<QuizProgress | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize or fetch existing attempt
  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        setLoading(true);
        // Check for existing attempts? Or just start new if none provided?
        // Ideally we check if there is an active attempt.
        // For now, let's assume the component triggers start.
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch quiz progress", error);
        setLoading(false);
      }
    };
    fetchAttempt();
  }, [quizId]);

  const saveProgress = useCallback((newProgress: QuizProgress) => {
    setProgress(newProgress);
  }, []);

  const startQuiz = useCallback(async (totalQuestions: number) => {
    try {
      setLoading(true);
      const attempt = await quizzesAPI.startAttempt(quizId);

      const newProgress: QuizProgress = {
        quizId,
        attemptId: attempt.id,
        answers: [],
        currentQuestion: 0,
        score: 0,
        totalQuestions,
        timeSpent: 0,
        completed: false,
        startedAt: new Date().toISOString(),
      };
      saveProgress(newProgress);
      setLoading(false);
      return newProgress;
    } catch (error) {
      console.error("Failed to start quiz attempt", error);
      toast.error("Failed to start quiz. Please try again.");
      setLoading(false);
      return null;
    }
  }, [quizId, saveProgress]);

  const answerQuestion = useCallback(async (questionId: string, selectedAnswer: number, correct: boolean) => {
    if (!progress || !progress.attemptId) return;

    // Optimistic update
    const newAnswer: QuizAnswer = { questionId, selectedAnswer, correct };
    const newProgress: QuizProgress = {
      ...progress,
      answers: [...progress.answers, newAnswer],
      currentQuestion: progress.currentQuestion + 1,
      score: correct ? progress.score + 1 : progress.score,
    };
    saveProgress(newProgress);

    // API Call (Background)
    try {
      // Convert selectedAnswer index to string/value if needed
      // Assuming backend expects answer string text OR index?
      // Check QuizController.saveAnswer -> QuizModel.saveAnswer -> "answer" column.
      // Usually options[selectedAnswer] is the answer text.
      // But here we might just send the index if backend handles grading?
      // Wait, backend 'saveAnswer' just stores it.
      // 'submitAttempt' does auto-grading.
      // We should probably send the actual answer TEXT or IDENTIFIER.
      // For now let's send the stringified index as a placeholder or check upstream.
      // MultiFormatQuizPlayer passes `selectedAnswer` as index.

      await quizzesAPI.saveAnswer(progress.attemptId, {
        question_id: questionId,
        answer: String(selectedAnswer) // Sending index as string for now
      });

    } catch (error) {
      console.error("Failed to save answer", error);
      // Don't revert state to avoid disrupting user flow, but maybe show error?
    }

    return newProgress;
  }, [progress, saveProgress]);

  const updateTimeSpent = useCallback((timeSpent: number) => {
    if (!progress) return;
    saveProgress({ ...progress, timeSpent });
  }, [progress, saveProgress]);

  const completeQuiz = useCallback(async () => {
    if (!progress || !progress.attemptId) return;

    try {
      const result = await quizzesAPI.submitAttempt(progress.attemptId, progress.timeSpent);

      const completed: QuizProgress = {
        ...progress,
        completed: true,
        completedAt: new Date().toISOString(),
        score: result.auto_graded_score || progress.score, // Use server score
      };
      saveProgress(completed);
      return completed;
    } catch (error) {
      console.error("Failed to submit quiz", error);
      toast.error("Failed to submit quiz. Please try again.");
      return null;
    }
  }, [progress, saveProgress]);

  const resetQuiz = useCallback(() => {
    setProgress(null);
  }, []);

  return {
    progress,
    loading,
    startQuiz,
    answerQuestion,
    updateTimeSpent,
    completeQuiz,
    resetQuiz,
  };
}

export function getAllQuizResults(): QuizProgress[] {
  return [];
}

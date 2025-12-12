import { useState, useEffect, useCallback } from 'react';

export interface QuizResult {
  quizId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  xpEarned: number;
  completedAt: string;
  timeSpent: number; // in seconds
}

const STORAGE_KEY = 'quiz_results';

export function useQuizResults() {
  const [results, setResults] = useState<QuizResult[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setResults(JSON.parse(stored));
      } catch {
        setResults([]);
      }
    }
  }, []);

  const saveResult = useCallback((result: Omit<QuizResult, 'completedAt'>) => {
    const newResult: QuizResult = {
      ...result,
      completedAt: new Date().toISOString(),
    };

    setResults(prev => {
      const updated = [...prev, newResult];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    return newResult;
  }, []);

  const getResultsByQuiz = useCallback((quizId: string) => {
    return results.filter(r => r.quizId === quizId);
  }, [results]);

  const getBestResult = useCallback((quizId: string) => {
    const quizResults = results.filter(r => r.quizId === quizId);
    if (quizResults.length === 0) return null;
    return quizResults.reduce((best, current) => 
      current.percentage > best.percentage ? current : best
    );
  }, [results]);

  const getStats = useCallback(() => {
    const completed = results.length;
    const uniqueQuizzes = new Set(results.map(r => r.quizId)).size;
    const totalXP = results.reduce((sum, r) => sum + r.xpEarned, 0);
    const avgScore = completed > 0 
      ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / completed)
      : 0;
    return { completed, uniqueQuizzes, totalXP, avgScore };
  }, [results]);

  const clearResults = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setResults([]);
  }, []);

  return {
    results,
    saveResult,
    getResultsByQuiz,
    getBestResult,
    getStats,
    clearResults,
  };
}

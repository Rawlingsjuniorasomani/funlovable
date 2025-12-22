import { useState, useEffect, useCallback } from 'react';

export interface QuizResult {
  quizId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  xpEarned: number;
  completedAt: string;
  timeSpent: number; 
}



export function useQuizResults() {
  const [results, setResults] = useState<QuizResult[]>([]);

  

  const saveResult = useCallback((result: Omit<QuizResult, 'completedAt'>) => {
    const newResult: QuizResult = {
      ...result,
      completedAt: new Date().toISOString(),
    };

    setResults(prev => {
      
      return [...prev, newResult];
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

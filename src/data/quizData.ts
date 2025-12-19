import { QuizQuestion } from "@/components/quiz/QuizPlayer";
import { FillInBlankQuestionData } from "@/components/quiz/FillInBlankQuestion";
import { MatchingQuestionData } from "@/components/quiz/MatchingQuestion";

export type AnyQuestion = 
  | (QuizQuestion & { type?: "multiple-choice" })
  | FillInBlankQuestionData
  | MatchingQuestionData;

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  duration: number; // in minutes
  questions: AnyQuestion[];
  xpReward: number;
}

// DEPRECATED: All quiz data should be fetched from backend API
// Backend Endpoints:
// GET /api/quizzes - Get all quizzes
// GET /api/quizzes/:id - Get a specific quiz
// GET /api/quizzes?subject=subject_name - Get quizzes by subject
export const quizzes: Quiz[] = [];

/**
 * Get quizzes for a specific subject
 * @deprecated Use backend API instead: GET /api/quizzes?subject={subject}
 */
export const getQuizzesBySubject = (subject: string) => 
  quizzes.filter((q) => q.subject === subject);

/**
 * Get a quiz by ID
 * @deprecated Use backend API instead: GET /api/quizzes/{id}
 */
export const getQuizById = (id: string) => 
  quizzes.find((q) => q.id === id);

/**
 * Get list of all subjects
 * @deprecated Use backend API to fetch from quizzes
 */
export const subjects = [...new Set(quizzes.map((q) => q.subject))];

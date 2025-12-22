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
  duration: number; 
  questions: AnyQuestion[];
  xpReward: number;
}






export const quizzes: Quiz[] = [];

 
export const getQuizzesBySubject = (subject: string) => 
  quizzes.filter((q) => q.subject === subject);

 
export const getQuizById = (id: string) => 
  quizzes.find((q) => q.id === id);

 
export const subjects = [...new Set(quizzes.map((q) => q.subject))];

import { useNavigate } from "react-router-dom";
import { QuizPlayer, QuizQuestion } from "@/components/quiz/QuizPlayer";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// Sample quiz data
const sampleQuiz: QuizQuestion[] = [
  {
    id: "q1",
    question: "What is 3/4 + 1/2?",
    options: ["1 1/4", "1 1/2", "1", "3/4"],
    correctAnswer: 0,
    explanation: "To add fractions, find a common denominator. 3/4 + 2/4 = 5/4 = 1 1/4",
  },
  {
    id: "q2",
    question: "Convert 0.75 to a fraction.",
    options: ["1/2", "3/4", "2/3", "7/5"],
    correctAnswer: 1,
    explanation: "0.75 = 75/100 = 3/4 when simplified.",
  },
  {
    id: "q3",
    question: "What is 2/3 × 3/4?",
    options: ["6/7", "1/2", "5/12", "6/12"],
    correctAnswer: 1,
    explanation: "Multiply numerators: 2×3=6, multiply denominators: 3×4=12. 6/12 simplifies to 1/2.",
  },
  {
    id: "q4",
    question: "Which fraction is equivalent to 0.25?",
    options: ["1/5", "1/4", "1/3", "2/5"],
    correctAnswer: 1,
    explanation: "0.25 = 25/100 = 1/4 when simplified.",
  },
  {
    id: "q5",
    question: "What is 5/6 - 1/3?",
    options: ["4/3", "1/2", "2/3", "1/6"],
    correctAnswer: 1,
    explanation: "Convert 1/3 to 2/6, then 5/6 - 2/6 = 3/6 = 1/2.",
  },
  {
    id: "q6",
    question: "Which decimal is equal to 2/5?",
    options: ["0.25", "0.4", "0.5", "0.2"],
    correctAnswer: 1,
    explanation: "2 ÷ 5 = 0.4",
  },
  {
    id: "q7",
    question: "What is 1/4 ÷ 1/2?",
    options: ["1/8", "1/2", "2", "1/4"],
    correctAnswer: 1,
    explanation: "Dividing by a fraction is the same as multiplying by its reciprocal: 1/4 × 2/1 = 2/4 = 1/2",
  },
  {
    id: "q8",
    question: "Arrange in ascending order: 1/2, 2/3, 1/4",
    options: ["1/4, 1/2, 2/3", "1/2, 1/4, 2/3", "2/3, 1/2, 1/4", "1/4, 2/3, 1/2"],
    correctAnswer: 0,
    explanation: "Converting to decimals: 1/4 = 0.25, 1/2 = 0.5, 2/3 ≈ 0.67. Ascending: 0.25 < 0.5 < 0.67",
  },
  {
    id: "q9",
    question: "What percentage is 3/5?",
    options: ["30%", "50%", "60%", "65%"],
    correctAnswer: 2,
    explanation: "3/5 = 0.6 = 60%",
  },
  {
    id: "q10",
    question: "Simplify: 12/18",
    options: ["2/3", "3/4", "4/6", "6/9"],
    correctAnswer: 0,
    explanation: "GCD of 12 and 18 is 6. 12÷6 = 2, 18÷6 = 3. So 12/18 = 2/3",
  },
];

export default function QuizPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto">
          <QuizPlayer
            quizId="fractions-decimals-quiz"
            title="Fractions & Decimals"
            subject="Mathematics"
            questions={sampleQuiz}
            timeLimit={600}
            onComplete={(score, total) => {
              console.log(`Quiz completed: ${score}/${total}`);
            }}
            onClose={() => navigate("/student")}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}

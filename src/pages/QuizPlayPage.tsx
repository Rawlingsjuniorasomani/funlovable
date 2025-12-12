import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { MultiFormatQuizPlayer } from "@/components/quiz/MultiFormatQuizPlayer";
import { getQuizById } from "@/data/quizData";

export default function QuizPlayPage() {
  const navigate = useNavigate();
  const { quizId } = useParams<{ quizId: string }>();
  
  const quiz = quizId ? getQuizById(quizId) : null;

  if (!quiz) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 py-12 px-4 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Quiz Not Found</h1>
            <p className="text-muted-foreground mb-6">The quiz you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/quizzes")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Quizzes
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/quizzes")} 
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quiz Center
          </Button>
          
          <MultiFormatQuizPlayer
            quiz={quiz}
            onComplete={(score, total, xpEarned) => {
              console.log(`Quiz completed: ${score}/${total}, XP earned: ${xpEarned}`);
            }}
            onClose={() => navigate("/quizzes")}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}

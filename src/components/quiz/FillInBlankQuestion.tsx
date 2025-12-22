import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FillInBlankQuestionData {
  id: string;
  type: "fill-blank";
  question: string;
  blanks: string[]; 
  explanation?: string;
}

interface FillInBlankQuestionProps {
  question: FillInBlankQuestionData;
  onSubmit: (correct: boolean) => void;
  showResult: boolean;
}

export function FillInBlankQuestion({ question, onSubmit, showResult }: FillInBlankQuestionProps) {
  const [answers, setAnswers] = useState<string[]>(new Array(question.blanks.length).fill(""));
  const [submitted, setSubmitted] = useState(false);

  const questionParts = question.question.split("___");

  const handleSubmit = () => {
    const correct = answers.every((answer, index) => 
      answer.toLowerCase().trim() === question.blanks[index].toLowerCase().trim()
    );
    setSubmitted(true);
    onSubmit(correct);
  };

  const isCorrect = answers.every((answer, index) => 
    answer.toLowerCase().trim() === question.blanks[index].toLowerCase().trim()
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-lg text-foreground leading-relaxed flex flex-wrap items-center gap-2">
        {questionParts.map((part, index) => (
          <span key={index} className="inline-flex items-center gap-2">
            <span>{part}</span>
            {index < question.blanks.length && (
              <span className="relative inline-block">
                <Input
                  value={answers[index]}
                  onChange={(e) => {
                    const newAnswers = [...answers];
                    newAnswers[index] = e.target.value;
                    setAnswers(newAnswers);
                  }}
                  disabled={showResult}
                  className={cn(
                    "w-32 inline-block text-center font-medium",
                    showResult && isCorrect && "border-secondary bg-secondary/10",
                    showResult && !isCorrect && "border-destructive bg-destructive/10"
                  )}
                  placeholder="..."
                />
                {showResult && (
                  <span className="absolute -right-6 top-1/2 -translate-y-1/2">
                    {answers[index].toLowerCase().trim() === question.blanks[index].toLowerCase().trim() ? (
                      <CheckCircle className="w-5 h-5 text-secondary" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive" />
                    )}
                  </span>
                )}
              </span>
            )}
          </span>
        ))}
      </div>

      {showResult && !isCorrect && (
        <div className="p-4 rounded-xl bg-muted/50 border border-border animate-fade-in">
          <p className="text-sm font-medium text-foreground mb-1">Correct Answer(s):</p>
          <p className="text-sm text-secondary font-medium">{question.blanks.join(", ")}</p>
        </div>
      )}

      {showResult && question.explanation && (
        <div className="p-4 rounded-xl bg-muted/50 border border-border animate-fade-in">
          <p className="text-sm font-medium text-foreground mb-1">Explanation:</p>
          <p className="text-sm text-muted-foreground">{question.explanation}</p>
        </div>
      )}

      {!showResult && (
        <Button 
          onClick={handleSubmit} 
          disabled={answers.some((a) => !a.trim())}
          className="btn-bounce"
        >
          Submit Answer
        </Button>
      )}
    </div>
  );
}

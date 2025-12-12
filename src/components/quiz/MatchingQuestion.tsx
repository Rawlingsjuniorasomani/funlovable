import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface MatchingQuestionData {
  id: string;
  type: "matching";
  question: string;
  pairs: { left: string; right: string }[];
  explanation?: string;
}

interface MatchingQuestionProps {
  question: MatchingQuestionData;
  onSubmit: (correct: boolean) => void;
  showResult: boolean;
}

export function MatchingQuestion({ question, onSubmit, showResult }: MatchingQuestionProps) {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matches, setMatches] = useState<Map<number, number>>(new Map());
  const [shuffledRight, setShuffledRight] = useState<string[]>([]);

  useEffect(() => {
    // Shuffle the right column on mount
    const rightItems = question.pairs.map((p) => p.right);
    setShuffledRight(rightItems.sort(() => Math.random() - 0.5));
  }, [question.pairs]);

  const handleLeftClick = (index: number) => {
    if (showResult) return;
    setSelectedLeft(selectedLeft === index ? null : index);
  };

  const handleRightClick = (index: number) => {
    if (showResult || selectedLeft === null) return;
    
    const newMatches = new Map(matches);
    // Remove any existing match for this left item
    newMatches.forEach((rightIdx, leftIdx) => {
      if (rightIdx === index) newMatches.delete(leftIdx);
    });
    newMatches.set(selectedLeft, index);
    setMatches(newMatches);
    setSelectedLeft(null);
  };

  const handleSubmit = () => {
    const correctCount = Array.from(matches.entries()).filter(([leftIdx, rightIdx]) => {
      const leftItem = question.pairs[leftIdx].left;
      const rightItem = shuffledRight[rightIdx];
      return question.pairs.find((p) => p.left === leftItem)?.right === rightItem;
    }).length;
    
    const allCorrect = correctCount === question.pairs.length;
    onSubmit(allCorrect);
  };

  const isMatchCorrect = (leftIdx: number) => {
    const rightIdx = matches.get(leftIdx);
    if (rightIdx === undefined) return null;
    
    const leftItem = question.pairs[leftIdx].left;
    const rightItem = shuffledRight[rightIdx];
    return question.pairs.find((p) => p.left === leftItem)?.right === rightItem;
  };

  const getMatchColor = (leftIdx: number) => {
    const colors = [
      "bg-primary/20 border-primary",
      "bg-secondary/20 border-secondary",
      "bg-tertiary/20 border-tertiary",
      "bg-accent/20 border-accent",
      "bg-pink-500/20 border-pink-500",
    ];
    return colors[leftIdx % colors.length];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <p className="text-lg text-foreground font-medium">{question.question}</p>
      <p className="text-sm text-muted-foreground">Click an item on the left, then click its match on the right.</p>

      <div className="grid grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-3">
          {question.pairs.map((pair, index) => {
            const isMatched = matches.has(index);
            const correct = showResult ? isMatchCorrect(index) : null;
            
            return (
              <button
                key={`left-${index}`}
                onClick={() => handleLeftClick(index)}
                disabled={showResult}
                className={cn(
                  "w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
                  selectedLeft === index && "ring-2 ring-primary ring-offset-2",
                  isMatched && !showResult && getMatchColor(index),
                  showResult && correct === true && "border-secondary bg-secondary/10",
                  showResult && correct === false && "border-destructive bg-destructive/10",
                  !isMatched && !selectedLeft && "border-border hover:border-primary/50",
                  !showResult && "cursor-pointer"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-foreground">{pair.left}</span>
                  {showResult && correct !== null && (
                    correct ? (
                      <CheckCircle className="w-5 h-5 text-secondary" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive" />
                    )
                  )}
                  {isMatched && !showResult && (
                    <Link2 className="w-4 h-4 text-primary" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          {shuffledRight.map((item, index) => {
            const matchedByLeft = Array.from(matches.entries()).find(([_, r]) => r === index)?.[0];
            const isMatched = matchedByLeft !== undefined;
            
            return (
              <button
                key={`right-${index}`}
                onClick={() => handleRightClick(index)}
                disabled={showResult}
                className={cn(
                  "w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
                  isMatched && !showResult && matchedByLeft !== undefined && getMatchColor(matchedByLeft),
                  !isMatched && "border-border hover:border-primary/50",
                  selectedLeft !== null && !isMatched && "hover:bg-primary/5",
                  !showResult && "cursor-pointer"
                )}
              >
                <span className="text-foreground">{item}</span>
              </button>
            );
          })}
        </div>
      </div>

      {showResult && question.explanation && (
        <div className="p-4 rounded-xl bg-muted/50 border border-border animate-fade-in">
          <p className="text-sm font-medium text-foreground mb-1">Explanation:</p>
          <p className="text-sm text-muted-foreground">{question.explanation}</p>
        </div>
      )}

      {!showResult && (
        <Button 
          onClick={handleSubmit} 
          disabled={matches.size !== question.pairs.length}
          className="btn-bounce"
        >
          Submit Answer ({matches.size}/{question.pairs.length} matched)
        </Button>
      )}
    </div>
  );
}

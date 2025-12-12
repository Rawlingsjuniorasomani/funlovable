import { useState } from "react";
import { Plus, Trash2, Save, Eye, GripVertical, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface QuizQuestion {
  id: string;
  question: string;
  type: "multiple-choice" | "true-false" | "fill-blank";
  options: string[];
  correctAnswer: number;
  explanation?: string;
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  subject: string;
  description: string;
  timeLimit: number;
  questions: QuizQuestion[];
  status: "draft" | "published";
}

export function QuizCreator() {
  const { toast } = useToast();
  const [quiz, setQuiz] = useState<Partial<Quiz>>({
    title: "",
    subject: "",
    description: "",
    timeLimit: 30,
    questions: [],
    status: "draft",
  });
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const addQuestion = (type: QuizQuestion["type"]) => {
    const newQuestion: QuizQuestion = {
      id: Date.now().toString(),
      question: "",
      type,
      options: type === "true-false" ? ["True", "False"] : ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
      points: 10,
    };
    setQuiz(prev => ({
      ...prev,
      questions: [...(prev.questions || []), newQuestion],
    }));
  };

  const updateQuestion = (index: number, updates: Partial<QuizQuestion>) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions?.map((q, i) => (i === index ? { ...q, ...updates } : q)),
    }));
  };

  const removeQuestion = (index: number) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions?.filter((_, i) => i !== index),
    }));
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions?.map((q, i) =>
        i === qIndex ? { ...q, options: q.options.map((o, j) => (j === oIndex ? value : o)) } : q
      ),
    }));
  };

  const handleSave = (publish: boolean = false) => {
    if (!quiz.title || !quiz.subject || !quiz.questions?.length) {
      toast({ title: "Error", description: "Please fill in all required fields and add at least one question.", variant: "destructive" });
      return;
    }
    setQuiz(prev => ({ ...prev, status: publish ? "published" : "draft" }));
    toast({ title: publish ? "Quiz Published!" : "Quiz Saved", description: `${quiz.title} has been ${publish ? "published" : "saved as draft"}.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Create Quiz</h2>
          <p className="text-muted-foreground">Build assessments for your students</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => { setPreviewIndex(0); setIsPreviewOpen(true); }} disabled={!quiz.questions?.length}>
            <Eye className="w-4 h-4 mr-2" /> Preview
          </Button>
          <Button variant="outline" onClick={() => handleSave(false)}>
            <Save className="w-4 h-4 mr-2" /> Save Draft
          </Button>
          <Button onClick={() => handleSave(true)}>Publish Quiz</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quiz Details */}
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Quiz Details</h3>
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input placeholder="Quiz title" value={quiz.title} onChange={(e) => setQuiz({ ...quiz, title: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Subject *</Label>
                <Select value={quiz.subject} onValueChange={(v) => setQuiz({ ...quiz, subject: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="social-studies">Social Studies</SelectItem>
                    <SelectItem value="ict">ICT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea placeholder="Brief description..." value={quiz.description} onChange={(e) => setQuiz({ ...quiz, description: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Time Limit (minutes)</Label>
                <Input type="number" min={5} max={180} value={quiz.timeLimit} onChange={(e) => setQuiz({ ...quiz, timeLimit: parseInt(e.target.value) || 30 })} className="mt-1" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Add Question</h3>
            <div className="grid grid-cols-1 gap-3">
              <Button variant="outline" onClick={() => addQuestion("multiple-choice")} className="justify-start">
                <Plus className="w-4 h-4 mr-2" /> Multiple Choice
              </Button>
              <Button variant="outline" onClick={() => addQuestion("true-false")} className="justify-start">
                <Plus className="w-4 h-4 mr-2" /> True/False
              </Button>
              <Button variant="outline" onClick={() => addQuestion("fill-blank")} className="justify-start">
                <Plus className="w-4 h-4 mr-2" /> Fill in the Blank
              </Button>
            </div>
          </div>

          <div className="bg-muted/50 rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Total Questions:</strong> {quiz.questions?.length || 0}<br />
              <strong>Total Points:</strong> {quiz.questions?.reduce((sum, q) => sum + q.points, 0) || 0}<br />
              <strong>Estimated Time:</strong> {quiz.timeLimit} min
            </p>
          </div>
        </div>

        {/* Questions Editor */}
        <div className="lg:col-span-2 space-y-4">
          {quiz.questions?.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-12 text-center">
              <p className="text-muted-foreground mb-4">No questions yet. Add your first question to get started.</p>
              <Button onClick={() => addQuestion("multiple-choice")}>
                <Plus className="w-4 h-4 mr-2" /> Add Question
              </Button>
            </div>
          ) : (
            quiz.questions?.map((question, qIndex) => (
              <div key={question.id} className="bg-card rounded-xl border border-border p-6 animate-fade-in">
                <div className="flex items-start gap-4">
                  <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab mt-2" />
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Q{qIndex + 1}</Badge>
                        <Badge className="capitalize">{question.type.replace("-", " ")}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input type="number" min={1} max={100} value={question.points} onChange={(e) => updateQuestion(qIndex, { points: parseInt(e.target.value) || 10 })} className="w-20 h-8" />
                        <span className="text-sm text-muted-foreground">pts</span>
                        <Button variant="ghost" size="icon" onClick={() => removeQuestion(qIndex)} className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>Question *</Label>
                      <Textarea placeholder="Enter your question..." value={question.question} onChange={(e) => updateQuestion(qIndex, { question: e.target.value })} className="mt-1" />
                    </div>

                    {question.type !== "fill-blank" && (
                      <div>
                        <Label>Options (click to mark correct answer)</Label>
                        <div className="space-y-2 mt-2">
                          {question.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => updateQuestion(qIndex, { correctAnswer: oIndex })}
                                className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors",
                                  question.correctAnswer === oIndex
                                    ? "bg-secondary text-secondary-foreground"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                )}
                              >
                                {question.correctAnswer === oIndex ? <CheckCircle className="w-4 h-4" /> : String.fromCharCode(65 + oIndex)}
                              </button>
                              {question.type === "true-false" ? (
                                <span className="flex-1 p-2 bg-muted rounded">{option}</span>
                              ) : (
                                <Input
                                  placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                  value={option}
                                  onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                  className="flex-1"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {question.type === "fill-blank" && (
                      <div>
                        <Label>Correct Answer</Label>
                        <Input
                          placeholder="Enter the correct answer"
                          value={question.options[0]}
                          onChange={(e) => updateOption(qIndex, 0, e.target.value)}
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Use ___ in the question to indicate where the blank should appear.</p>
                      </div>
                    )}

                    <div>
                      <Label>Explanation (optional)</Label>
                      <Textarea placeholder="Explain the correct answer..." value={question.explanation} onChange={(e) => updateQuestion(qIndex, { explanation: e.target.value })} className="mt-1" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quiz Preview</DialogTitle>
          </DialogHeader>
          {quiz.questions && quiz.questions.length > 0 && (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <Badge>Question {previewIndex + 1} of {quiz.questions.length}</Badge>
                <Badge variant="outline">{quiz.questions[previewIndex].points} pts</Badge>
              </div>
              <h3 className="text-lg font-semibold">{quiz.questions[previewIndex].question || "No question text"}</h3>
              <div className="space-y-2">
                {quiz.questions[previewIndex].options.map((opt, i) => (
                  <div key={i} className={cn(
                    "p-3 rounded-lg border",
                    quiz.questions![previewIndex].correctAnswer === i ? "border-secondary bg-secondary/10" : "border-border"
                  )}>
                    <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                    {opt || "(empty)"}
                  </div>
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setPreviewIndex(Math.max(0, previewIndex - 1))} disabled={previewIndex === 0}>Previous</Button>
                <Button onClick={() => setPreviewIndex(Math.min(quiz.questions!.length - 1, previewIndex + 1))} disabled={previewIndex === quiz.questions.length - 1}>Next</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

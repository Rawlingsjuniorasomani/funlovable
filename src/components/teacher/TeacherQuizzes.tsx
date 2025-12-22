import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, Search, Filter, Clock, CheckCircle, XCircle, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { quizzesAPI, subjectsAPI, modulesAPI } from "@/config/api";
import { useToast } from "@/hooks/use-toast";

interface Quiz {
  id: string;
  title: string;
  subject: string;
  subjectId?: string;
  module: string;
  questions: number;
  duration: number;
  type: "multiple-choice" | "fill-blank" | "matching" | "mixed";
  status: "draft" | "published" | "archived";
  attempts: number;
  avgScore: number;
  createdAt: string;
}

const typeColors: Record<string, string> = {
  "multiple-choice": "bg-primary/10 text-primary",
  "fill-blank": "bg-secondary/10 text-secondary",
  "matching": "bg-tertiary/10 text-tertiary",
  "mixed": "bg-quaternary/10 text-quaternary",
};

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  published: "bg-secondary/10 text-secondary",
  archived: "bg-destructive/10 text-destructive",
};

export function TeacherQuizzes() {
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedQuizForQuestions, setSelectedQuizForQuestions] = useState<Quiz | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    subjectId: "",
    moduleId: "",
    type: "multiple-choice",
    duration: "",
    questions: "",
    description: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (formData.subjectId) {
      loadModules(formData.subjectId);
    } else {
      setModules([]);
    }
  }, [formData.subjectId]);

  const loadModules = async (subjectId: string) => {
    try {
      const data = await modulesAPI.getAll(subjectId);
      setModules(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load modules:", error);
      toast({ title: "Error", description: "Failed to load modules", variant: "destructive" });
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [quizzesData, subjectsData] = await Promise.all([
        quizzesAPI.getAll(),
        subjectsAPI.getTeacher()
      ]);

      const loadedSubjects = Array.isArray(subjectsData) ? subjectsData : [];
      setSubjects(loadedSubjects);

      setQuizzes((Array.isArray(quizzesData) ? quizzesData : []).map((q: any) => ({
        id: q.id,
        title: q.title,
        subject: loadedSubjects.find((s: any) => s.id === (q.subject_id || q.subjectId))?.name || "Unknown",
        subjectId: q.subject_id || q.subjectId,
        module: "General", 
        questions: q.total_questions || q.questions || 10,
        duration: q.duration_minutes || q.duration || 15,
        type: q.type || "multiple-choice",
        status: q.is_active ? "published" : "draft",
        attempts: q.attempts_count || 0,
        avgScore: q.avg_score || 0,
        createdAt: new Date(q.created_at || Date.now()).toLocaleDateString()
      })));
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({ title: "Error loading data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.subjectId || !formData.moduleId) {
      toast({ title: "Missing fields", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    try {
      await quizzesAPI.create({
        title: formData.title,
        module_id: formData.moduleId,
        quiz_type: formData.type,
        duration_minutes: parseInt(formData.duration) || 15,
        total_questions: parseInt(formData.questions) || 10,
        description: formData.description,
        is_active: false 
      } as any);

      await loadData();
      setIsCreateOpen(false);
      setFormData({ title: "", subjectId: "", moduleId: "", type: "multiple-choice", duration: "", questions: "", description: "" });
      toast({ title: "Quiz created", description: "New quiz has been added successfully." });
    } catch (error) {
      console.error('Failed to create quiz:', error);
      toast({ title: "Failed to create quiz", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;
    try {
      await quizzesAPI.delete(id);
      await loadData();
      toast({ title: "Quiz deleted", description: "Quiz has been removed." });
    } catch (error) {
      console.error('Failed to delete quiz:', error);
      toast({ title: "Failed to delete quiz", variant: "destructive" });
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject === "all" || quiz.subject === filterSubject;
    const matchesStatus = filterStatus === "all" || quiz.status === filterStatus;
    return matchesSearch && matchesSubject && matchesStatus;
  });

  const uniqueSubjects = [...new Set(quizzes.map(q => q.subject))];

  return (
    <div className="space-y-6">
      { }
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Quizzes</h2>
          <p className="text-muted-foreground">Create and manage quizzes for your students</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Quiz
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Quiz</DialogTitle>
              <DialogDescription>Set up a new quiz for your students</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Quiz Title</Label>
                <Input
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Chapter 5 Review Quiz"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Subject</Label>
                  <Select
                    value={formData.subjectId}
                    onValueChange={val => setFormData({ ...formData, subjectId: val, moduleId: "" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Module</Label>
                  <Select
                    value={formData.moduleId}
                    onValueChange={val => setFormData({ ...formData, moduleId: val })}
                    disabled={!formData.subjectId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select module" />
                    </SelectTrigger>
                    <SelectContent>
                      {modules.map(m => (
                        <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Quiz Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={val => setFormData({ ...formData, type: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                      <SelectItem value="fill-blank">Fill in the Blank</SelectItem>
                      <SelectItem value="matching">Matching</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="15"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Description (Optional)</Label>
                <Textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the quiz..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Create Quiz</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      { }
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">Total Quizzes</p>
          <p className="text-2xl font-bold text-foreground">{quizzes.length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">Published</p>
          <p className="text-2xl font-bold text-secondary">{quizzes.filter(q => q.status === "published").length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">Total Attempts</p>
          <p className="text-2xl font-bold text-primary">{quizzes.reduce((acc, q) => acc + q.attempts, 0)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">Avg Score</p>
          <p className="text-2xl font-bold text-tertiary">
            {quizzes.length > 0 && quizzes.some(q => q.attempts > 0) ?
              Math.round(quizzes.filter(q => q.attempts > 0).reduce((acc, q) => acc + q.avgScore, 0) / quizzes.filter(q => q.attempts > 0).length) : 0}%
          </p>
        </div>
      </div>

      { }
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search quizzes..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterSubject} onValueChange={setFilterSubject}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {uniqueSubjects.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      { }
      <div className="grid gap-4">
        {filteredQuizzes.length === 0 ? (
          <div className="text-center py-10 bg-card/50 rounded-xl border border-dashed">
            <p className="text-muted-foreground">No quizzes found.</p>
          </div>
        ) : filteredQuizzes.map((quiz, index) => (
          <div
            key={quiz.id}
            className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-all animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-foreground text-lg">{quiz.title}</h3>
                  <Badge className={cn("text-xs", statusColors[quiz.status])}>
                    {quiz.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="outline">{quiz.subject}</Badge>
                  <Badge className={typeColors[quiz.type]}>{quiz.type}</Badge>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {quiz.duration} min
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {quiz.questions} questions
                  </span>
                </div>

                {quiz.status === "published" && (
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Attempts:</span>
                      <span className="font-medium text-foreground">{quiz.attempts}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Avg Score:</span>
                      <span className={cn(
                        "font-medium",
                        quiz.avgScore >= 80 ? "text-secondary" :
                          quiz.avgScore >= 60 ? "text-primary" : "text-destructive"
                      )}>
                        {quiz.avgScore}%
                      </span>
                    </div>
                    <div className="flex-1 max-w-32">
                      <Progress value={quiz.avgScore} className="h-2" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" title="Questions" onClick={() => setSelectedQuizForQuestions(quiz)}>
                  <CheckCircle className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" title="View Results">
                  <BarChart2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" title="Preview">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" title="Edit">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  title="Delete"
                  onClick={() => handleDelete(quiz.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedQuizForQuestions && (
        <QuizQuestionsSheet
          quiz={selectedQuizForQuestions}
          open={!!selectedQuizForQuestions}
          onOpenChange={(open) => !open && setSelectedQuizForQuestions(null)}
        />
      )}
    </div>
  );
}

function QuizQuestionsSheet({ quiz, open, onOpenChange }: { quiz: Quiz; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    type: "multiple-choice",
    options: ["", "", "", ""],
    correctAnswer: "",
    marks: 5
  });

  useEffect(() => {
    if (quiz && open) {
      loadQuestions();
    }
  }, [quiz, open]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await quizzesAPI.getQuestions(quiz.id);
      setQuestions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load questions", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.text || !newQuestion.correctAnswer) {
      toast({ title: "Validation Error", description: "Question text and correct answer are required.", variant: "destructive" });
      return;
    }

    try {
      await quizzesAPI.addQuestion(quiz.id, {
        question_text: newQuestion.text,
        question_type: newQuestion.type,
        options: JSON.stringify(newQuestion.options),
        correct_answer: newQuestion.correctAnswer,
        marks: newQuestion.marks
      });
      await loadQuestions();
      setNewQuestion({ text: "", type: "multiple-choice", options: ["", "", "", ""], correctAnswer: "", marks: 5 });
      toast({ title: "Question added" });
    } catch (error) {
      toast({ title: "Failed to add question", variant: "destructive" });
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      await quizzesAPI.deleteQuestion(id);
      await loadQuestions();
      toast({ title: "Question deleted" });
    } catch (error) {
      toast({ title: "Failed to delete question", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Questions: {quiz.title}</DialogTitle>
          <DialogDescription>Add or remove questions for this quiz.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          { }
          <div className="space-y-4 border p-4 rounded-lg bg-muted/20">
            <h3 className="font-semibold text-sm">Add New Question</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={newQuestion.type} onValueChange={(v) => setNewQuestion(prev => ({ ...prev, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                    <SelectItem value="true-false">True / False</SelectItem>
                    <SelectItem value="short-answer">Short Answer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Marks</Label>
                <Input type="number" value={newQuestion.marks} onChange={e => setNewQuestion(prev => ({ ...prev, marks: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Question Text</Label>
              <Textarea value={newQuestion.text} onChange={e => setNewQuestion(prev => ({ ...prev, text: e.target.value }))} placeholder="Enter question..." />
            </div>

            {newQuestion.type === 'multiple-choice' && (
              <div className="grid grid-cols-2 gap-2">
                {newQuestion.options.map((opt, idx) => (
                  <Input
                    key={idx}
                    value={opt}
                    onChange={e => {
                      const opts = [...newQuestion.options];
                      opts[idx] = e.target.value;
                      setNewQuestion(prev => ({ ...prev, options: opts }));
                    }}
                    placeholder={`Option ${idx + 1}`}
                  />
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Label>Correct Answer {(newQuestion.type === 'multiple-choice' || newQuestion.type === 'true-false') ? "(Exact Text)" : ""}</Label>
              {newQuestion.type === 'true-false' ? (
                <Select value={newQuestion.correctAnswer} onValueChange={(v) => setNewQuestion(prev => ({ ...prev, correctAnswer: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select Answer" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="True">True</SelectItem>
                    <SelectItem value="False">False</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input value={newQuestion.correctAnswer} onChange={e => setNewQuestion(prev => ({ ...prev, correctAnswer: e.target.value }))} placeholder="Correct answer..." />
              )}
            </div>

            <Button onClick={handleAddQuestion} className="w-full">Add Question</Button>
          </div>

          { }
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Questions ({questions.length})</h3>
            {questions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No questions yet.</p>
            ) : (
              questions.map((q, i) => (
                <div key={q.id} className="flex justify-between items-start border p-3 rounded-lg bg-card">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{i + 1}</Badge>
                      <Badge className={typeColors[q.question_type] || "bg-secondary"}>{q.question_type}</Badge>
                      <span className="text-xs text-muted-foreground">({q.marks} marks)</span>
                    </div>
                    <p className="text-sm font-medium">{q.question_text}</p>
                    <p className="text-xs text-muted-foreground mt-1">Answer: {q.correct_answer}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteQuestion(q.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

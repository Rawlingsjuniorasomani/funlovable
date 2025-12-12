import { useState } from "react";
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

interface Quiz {
  id: string;
  title: string;
  subject: string;
  module: string;
  questions: number;
  duration: number;
  type: "multiple-choice" | "fill-blank" | "matching" | "mixed";
  status: "draft" | "published" | "archived";
  attempts: number;
  avgScore: number;
  createdAt: string;
}

const mockQuizzes: Quiz[] = [
  { id: "1", title: "Fractions & Decimals", subject: "Mathematics", module: "Numbers", questions: 10, duration: 15, type: "mixed", status: "published", attempts: 45, avgScore: 78, createdAt: "Dec 10, 2024" },
  { id: "2", title: "Parts of Speech", subject: "English", module: "Grammar", questions: 15, duration: 20, type: "multiple-choice", status: "published", attempts: 38, avgScore: 82, createdAt: "Dec 9, 2024" },
  { id: "3", title: "Solar System", subject: "Science", module: "Space", questions: 12, duration: 18, type: "matching", status: "published", attempts: 42, avgScore: 75, createdAt: "Dec 8, 2024" },
  { id: "4", title: "Basic French Verbs", subject: "French", module: "Verbs", questions: 10, duration: 15, type: "fill-blank", status: "draft", attempts: 0, avgScore: 0, createdAt: "Dec 7, 2024" },
  { id: "5", title: "Ghana Independence", subject: "Social Studies", module: "History", questions: 8, duration: 12, type: "multiple-choice", status: "archived", attempts: 52, avgScore: 88, createdAt: "Nov 28, 2024" },
];

const typeColors: Record<Quiz["type"], string> = {
  "multiple-choice": "bg-primary/10 text-primary",
  "fill-blank": "bg-secondary/10 text-secondary",
  "matching": "bg-tertiary/10 text-tertiary",
  "mixed": "bg-quaternary/10 text-quaternary",
};

const statusColors: Record<Quiz["status"], string> = {
  draft: "bg-muted text-muted-foreground",
  published: "bg-secondary/10 text-secondary",
  archived: "bg-destructive/10 text-destructive",
};

export function TeacherQuizzes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filteredQuizzes = mockQuizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject === "all" || quiz.subject === filterSubject;
    const matchesStatus = filterStatus === "all" || quiz.status === filterStatus;
    return matchesSearch && matchesSubject && matchesStatus;
  });

  const subjects = [...new Set(mockQuizzes.map(q => q.subject))];

  return (
    <div className="space-y-6">
      {/* Header */}
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
                <Input placeholder="e.g., Chapter 5 Review Quiz" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Subject</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Quiz Type</Label>
                  <Select>
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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Duration (minutes)</Label>
                  <Input type="number" placeholder="15" />
                </div>
                <div className="grid gap-2">
                  <Label>Number of Questions</Label>
                  <Input type="number" placeholder="10" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Description (Optional)</Label>
                <Textarea placeholder="Brief description of the quiz..." />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsCreateOpen(false)}>Create Quiz</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">Total Quizzes</p>
          <p className="text-2xl font-bold text-foreground">{mockQuizzes.length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">Published</p>
          <p className="text-2xl font-bold text-secondary">{mockQuizzes.filter(q => q.status === "published").length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">Total Attempts</p>
          <p className="text-2xl font-bold text-primary">{mockQuizzes.reduce((acc, q) => acc + q.attempts, 0)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">Avg Score</p>
          <p className="text-2xl font-bold text-tertiary">
            {Math.round(mockQuizzes.filter(q => q.attempts > 0).reduce((acc, q) => acc + q.avgScore, 0) / mockQuizzes.filter(q => q.attempts > 0).length)}%
          </p>
        </div>
      </div>

      {/* Filters */}
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
            {subjects.map(s => (
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

      {/* Quiz List */}
      <div className="grid gap-4">
        {filteredQuizzes.map((quiz, index) => (
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
                <Button variant="ghost" size="icon" title="View Results">
                  <BarChart2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" title="Preview">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" title="Edit">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

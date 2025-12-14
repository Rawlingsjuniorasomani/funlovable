import { useState, useEffect } from "react";
import {
  Plus, FileText, Clock, Users, CheckCircle, AlertCircle,
  MoreVertical, Edit, Trash2, Eye, Download, Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { subjectsAPI, assignmentsAPI } from "@/config/api";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription
} from "@/components/ui/sheet";

const statusColors = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-secondary/10 text-secondary border-secondary/30",
  closed: "bg-destructive/10 text-destructive border-destructive/30",
};

export function TeacherAssignments() {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create/Edit Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: Basics, 2: Details, 3: Questions (if applicable), 4: Review

  const [formData, setFormData] = useState({
    title: "",
    question: "",
    description: "",
    subjectId: "",
    dueDate: "",
    totalPoints: 100,
    submissionType: "text", // text, file, both, questions, mixed
    resources: "",
    questions: [] as any[],
  });

  // Question Builder State
  const [currentQuestion, setCurrentQuestion] = useState<any>({
    type: 'mcq',
    text: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    marks: 5
  });

  // Grading Sheet State
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [gradingSubmission, setGradingSubmission] = useState<any>(null);
  const [gradingData, setGradingData] = useState({ score: 0, feedback: "" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subjectsData, assignmentsData] = await Promise.all([
        subjectsAPI.getTeacher(),
        assignmentsAPI.getAll()
      ]);
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      setAssignments((Array.isArray(assignmentsData) ? assignmentsData : []).map((a: any) => ({
        ...a,
        subjectId: a.subject_id || a.subjectId,
        totalPoints: a.total_points || a.totalPoints || 100,
        dueDate: a.due_date || a.dueDate,
        status: a.status || (a.is_active ? 'active' : 'draft'),
        submissions: Number(a.submission_count || 0),
        totalStudents: 35, // Placeholder
      })));
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({ title: "Error loading data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.subjectId) return;

    try {
      // Parse resources if user entered JSON, else treat as single URL or text
      let resources = [];
      try {
        resources = JSON.parse(formData.resources || "[]");
      } catch (e) {
        if (formData.resources.trim()) {
          resources = [{ name: 'Resource', url: formData.resources }];
        }
      }

      // Validation: Ensure questions are added for quiz types
      if ((formData.submissionType === 'questions' || formData.submissionType === 'mixed') && formData.questions.length === 0) {
        toast({
          title: "Questions Required",
          description: "Please add at least one question before creating this assignment.",
          variant: "destructive"
        });
        return;
      }

      // Create Assignment first
      const newAssignment = await assignmentsAPI.create({
        title: formData.title,
        description: `**Instructions:**\n${formData.description}`, // We use separate question entities now, so just desc
        subject_id: formData.subjectId,
        due_date: formData.dueDate,
        total_points: formData.totalPoints,
        submission_type: formData.submissionType,
        resources: resources,
        status: 'active'
      });

      // Then add questions if any
      if (formData.questions.length > 0) {
        await Promise.all(formData.questions.map((q, index) =>
          assignmentsAPI.addQuestion(newAssignment.id, {
            question_text: q.text,
            question_type: q.type,
            options: JSON.stringify(q.options),
            correct_answer: q.correctAnswer,
            marks: q.marks,
            order_index: index
          })
        ));
      }

      await loadData();
      toast({ title: "Assignment created successfully" });
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create assignment:', error);
      toast({ title: "Failed to create assignment", variant: "destructive" });
    }
  };

  const addQuestion = () => {
    if (!currentQuestion.text) return;
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion }]
    }));
    setCurrentQuestion({
      type: 'mcq',
      text: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      marks: 5
    });
  };

  const removeQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "", question: "", description: "", subjectId: "", dueDate: "",
      totalPoints: 100, submissionType: "text", resources: "", questions: []
    });
    setStep(1);
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleDelete = async (id: string) => {
    try {
      await assignmentsAPI.delete(id);
      await loadData();
      toast({ title: "Assignment deleted", variant: "destructive" });
    } catch (error) {
      toast({ title: "Failed to delete assignment", variant: "destructive" });
    }
  };

  const openSubmissions = async (assignment: any) => {
    setSelectedAssignment(assignment);
    try {
      const data = await assignmentsAPI.getSubmissions(assignment.id);
      setSubmissions(data);
    } catch (error) {
      toast({ title: "Failed to load submissions", variant: "destructive" });
    }
  };

  const handleGrade = async () => {
    if (!gradingSubmission) return;
    try {
      await assignmentsAPI.gradeSubmission(gradingSubmission.id, {
        score: Number(gradingData.score),
        feedback: gradingData.feedback
      });

      // Update local state
      setSubmissions(prev => prev.map(s =>
        s.id === gradingSubmission.id
          ? { ...s, score: gradingData.score, feedback: gradingData.feedback, status: 'graded' }
          : s
      ));

      setGradingSubmission(null);
      toast({ title: "Submission graded" });
    } catch (error) {
      toast({ title: "Failed to grade", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Assignments</h2>
          <p className="text-muted-foreground">Create and manage student assignments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Assignment - Step {step} of 4</DialogTitle>
            </DialogHeader>

            <div className="py-4">
              {/* Step 1: Basics */}
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Assignment title"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject</label>
                    <Select value={formData.subjectId} onValueChange={(v) => setFormData(prev => ({ ...prev, subjectId: v }))}>
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Due Date</label>
                    <Input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Details & Config */}
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Instructions / Description</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Detailed instructions..."
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Submission Type</label>
                      <Select value={formData.submissionType} onValueChange={(v) => setFormData(prev => ({ ...prev, submissionType: v }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text Only</SelectItem>
                          <SelectItem value="file">File Upload</SelectItem>
                          <SelectItem value="both">Text & File</SelectItem>
                          <SelectItem value="questions">Questions / Quiz</SelectItem>
                          <SelectItem value="mixed">Mixed (Questions + Upload)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Points</label>
                      <Input
                        type="number"
                        value={formData.totalPoints}
                        onChange={(e) => setFormData(prev => ({ ...prev, totalPoints: Number(e.target.value) }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Resources (JSON or URL)</label>
                    <Input
                      value={formData.resources}
                      onChange={(e) => setFormData(prev => ({ ...prev, resources: e.target.value }))}
                      placeholder='[{"name": "Guide", "url": "..."}]'
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Questions (Conditional) */}
              {step === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  {(formData.submissionType === 'questions' || formData.submissionType === 'mixed') ? (
                    <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                      <h3 className="font-semibold text-sm">Question Builder ({formData.questions.length})</h3>

                      {/* Question Form */}
                      <div className="space-y-3 p-3 bg-background rounded-md border">
                        <div className="flex gap-2">
                          <Select value={currentQuestion.type} onValueChange={(v) => setCurrentQuestion({ ...currentQuestion, type: v })}>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mcq">Multiple Choice</SelectItem>
                              <SelectItem value="true_false">True / False</SelectItem>
                              <SelectItem value="short_answer">Short Answer</SelectItem>
                              <SelectItem value="long_answer">Long Answer</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            placeholder="Marks"
                            className="w-20"
                            value={currentQuestion.marks}
                            onChange={e => setCurrentQuestion({ ...currentQuestion, marks: Number(e.target.value) })}
                          />
                        </div>

                        <Textarea
                          placeholder="Question text..."
                          value={currentQuestion.text}
                          onChange={e => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
                        />

                        {currentQuestion.type === 'mcq' && (
                          <div className="grid grid-cols-2 gap-2">
                            {currentQuestion.options.map((opt: string, idx: number) => (
                              <Input
                                key={idx}
                                placeholder={`Option ${idx + 1}`}
                                value={opt}
                                onChange={e => {
                                  const newOpts = [...currentQuestion.options];
                                  newOpts[idx] = e.target.value;
                                  setCurrentQuestion({ ...currentQuestion, options: newOpts });
                                }}
                              />
                            ))}
                          </div>
                        )}

                        {(currentQuestion.type === 'mcq' || currentQuestion.type === 'true_false') && (
                          <Input
                            placeholder="Correct Answer (Exact text)"
                            value={currentQuestion.correctAnswer}
                            onChange={e => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                          />
                        )}

                        <Button type="button" onClick={addQuestion} variant="secondary" className="w-full">
                          <Plus className="w-4 h-4 mr-2" /> Add Question
                        </Button>
                      </div>

                      {/* Question List Preview */}
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {formData.questions.map((q, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2 bg-muted rounded text-sm group">
                            <div className="truncate flex-1">
                              <Badge variant="outline" className="mr-2 text-xs">{q.type}</Badge>
                              {q.text}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100"
                              onClick={() => removeQuestion(idx)}
                            >
                              <Trash2 className="w-3 h-3 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground animate-in fade-in zoom-in-95">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                      <p className="text-lg font-medium text-foreground">Questions are not enabled</p>
                      <p className="text-sm mb-4">You selected <strong>{formData.submissionType}</strong> type.</p>
                      <div className="flex justify-center gap-3">
                        <Button variant="outline" onClick={prevStep}>
                          Go Back & Change
                        </Button>
                        <Button variant="secondary" onClick={() => setFormData(prev => ({ ...prev, submissionType: 'questions' }))}>
                          Switch to Quiz Mode
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Review */}
              {step === 4 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <div className="border rounded-lg p-4 space-y-3 bg-muted/10">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-muted-foreground">Title:</span>
                      <span className="font-medium">{formData.title}</span>

                      <span className="text-muted-foreground">Subject:</span>
                      <span className="font-medium">{subjects.find(s => s.id === formData.subjectId)?.name || 'Unknown'}</span>

                      <span className="text-muted-foreground">Due Date:</span>
                      <span className="font-medium">{formData.dueDate}</span>

                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium capitalize">{formData.submissionType}</span>

                      <span className="text-muted-foreground">Questions:</span>
                      <span className="font-medium">{formData.questions.length}</span>
                    </div>

                    <div className="pt-2 border-t">
                      <span className="text-sm text-muted-foreground">Instructions:</span>
                      <p className="text-sm mt-1 max-h-20 overflow-y-auto whitespace-pre-wrap">{formData.description || "None"}</p>
                    </div>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-3 text-xs text-yellow-600 flex gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Notifications will be sent to all students efficiently upon creation.
                  </div>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="flex justify-between mt-6 pt-4 border-t">
                {step > 1 ? (
                  <Button variant="outline" onClick={prevStep}>Previous</Button>
                ) : (
                  <div /> // Spacer
                )}

                {step < 4 ? (
                  <Button onClick={nextStep}>Next</Button>
                ) : (
                  <Button onClick={handleCreate} disabled={loading}>Create Assignment</Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Assignment List */}
      <div className="space-y-4">
        {assignments.map((assignment, index) => {
          const subject = subjects.find(s => s.id === assignment.subjectId);
          return (
            <div
              key={assignment.id}
              className="bg-card rounded-xl border border-border p-5 card-hover animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{assignment.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {subject?.name} • Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No date'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn("capitalize", statusColors[assignment.status as keyof typeof statusColors] || statusColors.draft)}>
                    {assignment.status}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => openSubmissions(assignment)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Submissions
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(assignment.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
                <div className="text-center">
                  <p className="text-2xl font-bold">{assignment.submissions}</p>
                  <p className="text-xs text-muted-foreground">Submitted</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{assignment.totalPoints}</p>
                  <p className="text-xs text-muted-foreground">Points</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submissions Sheet */}
      <Sheet open={!!selectedAssignment} onOpenChange={(open) => !open && setSelectedAssignment(null)}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>{selectedAssignment?.title} - Submissions</SheetTitle>
            <SheetDescription>
              View and grade student work.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6">
            {submissions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No submissions yet.</p>
              </div>
            ) : (
              submissions.map(sub => (
                <div key={sub.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-sm font-bold text-secondary">
                        {sub.student_name?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{sub.student_name}</p>
                        <p className="text-xs text-muted-foreground">{new Date(sub.submitted_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <Badge variant={sub.status === 'graded' ? 'default' : 'outline'}>
                      {sub.status}
                    </Badge>
                  </div>

                  <div className="bg-muted p-3 rounded text-sm whitespace-pre-wrap">
                    {sub.content || "No text content."}
                  </div>

                  {sub.file_url && (
                    <Button variant="outline" size="sm" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download Attachment
                    </Button>
                  )}

                  {gradingSubmission?.id === sub.id ? (
                    <div className="bg-background border rounded p-4 space-y-3 mt-2 animate-in fade-in zoom-in-95">
                      <h4 className="font-medium text-sm">Grade Submission</h4>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Score"
                          className="w-24"
                          value={gradingData.score}
                          onChange={(e) => setGradingData(prev => ({ ...prev, score: Number(e.target.value) }))}
                        />
                        <span className="text-sm text-muted-foreground">/ {selectedAssignment.totalPoints}</span>
                      </div>
                      <Textarea
                        placeholder="Feedback"
                        value={gradingData.feedback}
                        onChange={(e) => setGradingData(prev => ({ ...prev, feedback: e.target.value }))}
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setGradingSubmission(null)}>Cancel</Button>
                        <Button size="sm" onClick={handleGrade}>Save Grade</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center pt-2">
                      <div className="text-sm">
                        {sub.score !== null ? <span className="font-bold text-green-600">Score: {sub.score}</span> : <span className="text-muted-foreground">Not graded</span>}
                      </div>
                      <Button size="sm" onClick={() => {
                        setGradingSubmission(sub);
                        setGradingData({ score: sub.score || 0, feedback: sub.feedback || "" });
                      }}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Grade
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div >
  );
}

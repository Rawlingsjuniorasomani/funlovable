import { useState, useEffect } from "react";
import {
  Plus, FileText, Clock, Users, CheckCircle, AlertCircle,
  MoreVertical, Edit, Trash2, Eye, Download, Upload, Search, Filter,
  ChevronDown, ChevronUp, Save, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { subjectsAPI, assignmentsAPI, modulesAPI } from "@/config/api";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthContext } from "@/contexts/AuthContext";

const statusColors = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-secondary/10 text-secondary border-secondary/30",
  closed: "bg-destructive/10 text-destructive border-destructive/30",
};

export function TeacherAssignments() {
  const { toast } = useToast();
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState("all");
  const [assignments, setAssignments] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedModule, setSelectedModule] = useState<string>("all");

  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subjectId: "",
    moduleId: "", 
    dueDate: "",
    totalPoints: 100,
    submissionType: "text", 
    resources: "",
    questions: [] as any[],
  });

  
  const [currentQuestion, setCurrentQuestion] = useState<any>({
    type: 'mcq',
    text: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    marks: 5
  });

  
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [gradingSubmission, setGradingSubmission] = useState<any>(null);
  const [gradingData, setGradingData] = useState({ score: 0, feedback: "" });
  const [submissionAnswers, setSubmissionAnswers] = useState<any[]>([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedSubject && selectedSubject !== 'all') {
      loadModules(selectedSubject);
    } else {
      setModules([]);
    }
  }, [selectedSubject]);

  useEffect(() => {
    
    if (formData.subjectId) {
      loadModules(formData.subjectId);
    }
  }, [formData.subjectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subjectsData, assignmentsData] = await Promise.all([
        subjectsAPI.getTeacher(),
        
        assignmentsAPI.getAll(user?.id ? { teacherId: user.id } : undefined)
      ]);
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      setAssignments((Array.isArray(assignmentsData) ? assignmentsData : []).map((a: any) => ({
        ...a,
        subjectId: a.subject_id || a.subjectId,
        totalPoints: a.total_points || a.totalPoints || 100,
        dueDate: a.due_date || a.dueDate,
        status: a.status || (a.is_active ? 'active' : 'draft'),
        submissions: Number(a.submission_count || 0),
        totalStudents: 35, 
      })));
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({ title: "Error loading data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadModules = async (subjectId: string) => {
    try {
      const data = await modulesAPI.getAll(subjectId);
      setModules(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load modules:', error);
    }
  };

  const handleEdit = async (assignment: any) => {
    setEditingId(assignment.id);
    setLoading(true);
    try {
      
      const [details, questions] = await Promise.all([
        assignmentsAPI.getById(assignment.id),
        assignmentsAPI.getQuestions(assignment.id)
      ]);

      setFormData({
        title: details.title,
        description: details.description || "",
        subjectId: details.subject_id || details.subjectId,
        moduleId: "", 
        dueDate: details.due_date ? new Date(details.due_date).toISOString().split('T')[0] : "",
        totalPoints: details.max_score || details.total_points || 100,
        submissionType: details.submission_type || "text",
        resources: typeof details.resources === 'string' ? details.resources : JSON.stringify(details.resources || []),
        questions: Array.isArray(questions) ? questions.map((q: any) => ({
          id: q.id,
          text: q.question_text,
          type: q.question_type,
          options: JSON.parse(q.options || "[]"),
          correctAnswer: q.correct_answer,
          marks: q.marks,
        })) : []
      });

      setStep(1);
      setIsDialogOpen(true);
    } catch (error) {
      toast({ title: "Failed to load assignment details", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async () => {
    if (!formData.title || !formData.subjectId) return;

    try {
      let resources = [];
      try {
        resources = JSON.parse(formData.resources || "[]");
      } catch (e) {
        if (formData.resources.trim()) {
          resources = [{ name: 'Resource', url: formData.resources }];
        }
      }

      if ((formData.submissionType === 'questions' || formData.submissionType === 'mixed') && formData.questions.length === 0) {
        toast({ title: "Questions Required", description: "Please add at least one question.", variant: "destructive" });
        return;
      }

      let assignmentId = editingId;

      if (editingId) {
        
        await assignmentsAPI.update(editingId, {
          title: formData.title,
          description: formData.description,
          due_date: formData.dueDate,
          total_points: formData.totalPoints,
          submission_type: formData.submissionType,
          resources: resources,
          status: 'active'
        });

        
        
        
        
        
        
        
        
        
        
        
      } else {
        
        const newAssignment = await assignmentsAPI.create({
          title: formData.title,
          description: formData.description,
          subject_id: formData.subjectId,
          due_date: formData.dueDate,
          total_points: formData.totalPoints,
          submission_type: formData.submissionType,
          resources: resources,
          status: 'active'
        });
        assignmentId = newAssignment.id;
      }

      if (assignmentId) {
        
        
        
        await Promise.all(formData.questions.map((q, index) => {
          const qData = {
            question_text: q.text,
            question_type: q.type,
            options: JSON.stringify(q.options),
            correct_answer: q.correctAnswer,
            marks: q.marks,
            order_index: index
          };

          if (q.id && editingId) {
            return assignmentsAPI.updateQuestion(q.id, qData);
          } else {
            return assignmentsAPI.addQuestion(assignmentId!, qData);
          }
        }));
      }

      await loadData();
      toast({ title: `Assignment ${editingId ? 'updated' : 'created'} successfully` });
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save assignment:', error);
      toast({ title: "Failed to save assignment", variant: "destructive" });
    }
  };

  const deleteQuestionFromList = async (index: number) => {
    const q = formData.questions[index];
    if (q.id) {
      
      try {
        await assignmentsAPI.deleteQuestion(q.id);
      } catch (e) {
        toast({ title: "Failed to delete question", variant: "destructive" });
        return;
      }
    }
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
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

  const resetForm = () => {
    setFormData({
      title: "", description: "", subjectId: "", moduleId: "", dueDate: "",
      totalPoints: 100, submissionType: "text", resources: "", questions: []
    });
    setEditingId(null);
    setStep(1);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure? This will delete all submissions.")) {
      try {
        await assignmentsAPI.delete(id);
        await loadData();
        toast({ title: "Assignment deleted", variant: "destructive" });
      } catch (error) {
        toast({ title: "Failed to delete assignment", variant: "destructive" });
      }
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

  const viewSubmissionDetails = async (sub: any) => {
    setGradingSubmission(sub);
    setGradingData({ score: sub.score || 0, feedback: sub.feedback || "" });
    setSubmissionAnswers([]);

    
    if (selectedAssignment.submission_type === 'questions' || selectedAssignment.submission_type === 'mixed') {
      try {
        setLoadingAnswers(true);
        const answers = await assignmentsAPI.getAnswers(sub.id);
        setSubmissionAnswers(answers || []);

        
        
        if (sub.status !== 'graded' && answers) {
          const autoScore = answers.reduce((acc: number, ans: any) => acc + (ans.marks_awarded || 0), 0);
          setGradingData(prev => ({ ...prev, score: autoScore }));
        }
      } catch (error) {
        console.error("Failed to load answers");
      } finally {
        setLoadingAnswers(false);
      }
    }
  };

  const filteredAssignments = assignments.filter(a => {
    if (selectedSubject !== 'all' && a.subjectId !== selectedSubject) return false;

    if (activeTab === 'active') {
      return a.status === 'active';
    }

    if (activeTab === 'completed') {
      
      return a.status === 'closed';
    }

    
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Assignments</h2>
          <p className="text-muted-foreground">Manage assignments and grading</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Create Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Assignment" : "Create Assignment"} - Step {step} of 4</DialogTitle>
              </DialogHeader>

              <div className="py-4">
                { }
                {step === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Assignment title"
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
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          className="h-[150px]"
                          placeholder="Instructions for students..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                { }
                {step === 2 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
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
                        <label className="text-sm font-medium">Total Points</label>
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

                { }
                {step === 3 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    {['questions', 'mixed'].includes(formData.submissionType) ? (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
                        { }
                        <div className="lg:col-span-1 space-y-4 border-r pr-4 overflow-y-auto">
                          <h3 className="font-semibold text-sm">Add Question</h3>
                          <div className="space-y-3">
                            <Select value={currentQuestion.type} onValueChange={(v) => setCurrentQuestion({ ...currentQuestion, type: v })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="mcq">Multiple Choice</SelectItem>
                                <SelectItem value="true_false">True / False</SelectItem>
                                <SelectItem value="short_answer">Short Answer</SelectItem>
                              </SelectContent>
                            </Select>

                            <Textarea
                              placeholder="Question Text"
                              value={currentQuestion.text}
                              onChange={e => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
                            />

                            <div className="flex items-center gap-2">
                              <label className="text-xs font-medium">Marks:</label>
                              <Input
                                type="number"
                                value={currentQuestion.marks}
                                onChange={e => setCurrentQuestion({ ...currentQuestion, marks: Number(e.target.value) })}
                                className="w-20"
                              />
                            </div>

                            {currentQuestion.type === 'mcq' && (
                              <div className="space-y-2">
                                <label className="text-xs font-medium">Options</label>
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
                                    className="h-8 text-sm"
                                  />
                                ))}
                              </div>
                            )}

                            {['mcq', 'true_false'].includes(currentQuestion.type) && (
                              <Input
                                placeholder="Correct Answer (Exact Match)"
                                value={currentQuestion.correctAnswer}
                                onChange={e => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                                className="h-9"
                              />
                            )}

                            <Button onClick={addQuestion} className="w-full" size="sm">
                              <Plus className="w-4 h-4 mr-2" /> Add
                            </Button>
                          </div>
                        </div>

                        { }
                        <div className="lg:col-span-2 space-y-4 overflow-y-auto pl-2">
                          <h3 className="font-semibold text-sm">Questions ({formData.questions.length})</h3>
                          {formData.questions.length === 0 && <p className="text-muted-foreground text-sm italic">No questions added yet.</p>}
                          {formData.questions.map((q, idx) => (
                            <div key={idx} className="border p-3 rounded-lg relative group bg-card hover:shadow-sm transition-all">
                              <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => deleteQuestionFromList(idx)}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-[10px]">{q.type}</Badge>
                                <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{q.marks} pts</span>
                              </div>
                              <p className="text-sm font-medium">{q.text}</p>
                              {q.type === 'mcq' && (
                                <div className="ml-4 mt-2 space-y-1">
                                  {q.options.map((opt: string, i: number) => (
                                    <div key={i} className={cn("text-xs flex items-center gap-2", opt === q.correctAnswer && "text-green-600 font-medium")}>
                                      <div className={cn("w-2 h-2 rounded-full border", opt === q.correctAnswer ? "bg-green-600 border-green-600" : "border-muted-foreground")} />
                                      {opt}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-20 text-muted-foreground">
                        <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p>Questions are not enabled for this submission type.</p>
                      </div>
                    )}
                  </div>
                )}

                { }
                {step === 4 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <Card>
                      <CardContent className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground block">Title</span>
                            <span className="font-semibold">{formData.title}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block">Due Date</span>
                            <span className="font-semibold">{formData.dueDate || "No date"}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block">Type</span>
                            <span className="font-semibold capitalize">{formData.submissionType}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block">Items</span>
                            <span className="font-semibold">{formData.questions.length} questions</span>
                          </div>
                        </div>
                        <div className="pt-4 border-t">
                          <span className="text-muted-foreground block text-sm mb-1">Description</span>
                          <p className="text-sm text-foreground/80">{formData.description || "No description."}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>

              { }
              <div className="flex justify-between items-center pt-4 border-t mt-4">
                <Button variant="outline" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}>
                  Previous
                </Button>
                <div className="flex gap-2">
                  {step < 4 ? (
                    <Button onClick={() => setStep(s => Math.min(4, s + 1))}>Next</Button>
                  ) : (
                    <Button onClick={handleCreateOrUpdate}>
                      {editingId ? "Save Changes" : "Create Assignment"}
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Assignments</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4 mt-4">
          {filteredAssignments.map((assignment, index) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              subjectName={subjects.find(s => s.id === assignment.subjectId)?.name}
              onEdit={() => handleEdit(assignment)}
              onDelete={() => handleDelete(assignment.id)}
              onViewSubmissions={() => openSubmissions(assignment)}
              index={index}
            />
          ))}
        </TabsContent>
        { }
      </Tabs>

      { }
      <Sheet open={!!selectedAssignment} onOpenChange={(open) => !open && setSelectedAssignment(null)}>
        <SheetContent className="sm:max-w-3xl overflow-y-auto w-full">
          <SheetHeader className="mb-6">
            <SheetTitle>{selectedAssignment?.title} - Submissions</SheetTitle>
            <SheetDescription>
              Review student work and provide grades.
            </SheetDescription>
          </SheetHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            { }
            <div className="md:col-span-1 border-r pr-4 space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground">Students ({submissions.length})</h3>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {submissions.map(sub => (
                  <div
                    key={sub.id}
                    onClick={() => viewSubmissionDetails(sub)}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer hover:bg-muted transition-colors text-sm",
                      gradingSubmission?.id === sub.id ? "bg-muted border-primary" : "bg-card"
                    )}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium">{sub.student_name}</span>
                      <Badge variant={sub.status === 'graded' ? 'default' : 'secondary'} className="text-[10px]">
                        {sub.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(sub.submitted_at).toLocaleDateString()}</p>
                    {sub.score !== null && <p className="text-xs font-bold text-green-600 mt-1">{sub.score} / {selectedAssignment?.totalPoints}</p>}
                  </div>
                ))}
                {submissions.length === 0 && <p className="text-sm text-muted-foreground">No submissions yet.</p>}
              </div>
            </div>

            { }
            <div className="md:col-span-2 space-y-6">
              {gradingSubmission ? (
                <div className="animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">{gradingSubmission.student_name}'s Submission</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setGradingSubmission(null)}>Close</Button>
                    </div>
                  </div>

                  {/* Submission Content */}
                  <Card className="mb-6">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Student Work</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {gradingSubmission.content && (
                        <div className="bg-muted/30 p-4 rounded-md text-sm whitespace-pre-wrap font-serif">
                          {gradingSubmission.content}
                        </div>
                      )}

                      {gradingSubmission.file_url && (
                        <Button variant="outline" className="w-full" asChild>
                          <a href={gradingSubmission.file_url} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 mr-2" /> Download Attached File
                          </a>
                        </Button>
                      )}

                      {/* Question Answers Table */}
                      {submissionAnswers.length > 0 && (
                        <div className="space-y-4 mt-4">
                          <h4 className="font-medium text-sm">Question Answers</h4>
                          {loadingAnswers ? <p>Loading answers...</p> : (
                            <div className="space-y-4">
                              {submissionAnswers.map((ans, idx) => (
                                <div key={ans.id} className="border p-3 rounded text-sm space-y-2">
                                  <div className="flex justify-between">
                                    <span className="font-semibold">Q{idx + 1}: {ans.question_text}</span>
                                    <Badge variant={ans.is_correct ? 'default' : 'destructive'}>
                                      {ans.marks_awarded} / {ans.max_marks} pts
                                    </Badge>
                                  </div>
                                  <div className="bg-muted p-2 rounded">
                                    <span className="text-xs text-muted-foreground block">Answer:</span>
                                    {ans.answer_text}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Grading Form */}
                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Grade & Feedback</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold uppercase">Total Score</label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={gradingData.score}
                              onChange={e => setGradingData(prev => ({ ...prev, score: Number(e.target.value) }))}
                              className="w-24 font-bold text-lg"
                            />
                            <span className="text-muted-foreground">/ {selectedAssignment.totalPoints}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase">Feedback</label>
                        <Textarea
                          value={gradingData.feedback}
                          onChange={e => setGradingData(prev => ({ ...prev, feedback: e.target.value }))}
                          placeholder="Great job, consider..."
                          className="bg-background"
                        />
                      </div>
                      <Button onClick={handleGrade} className="w-full">
                        <CheckCircle className="w-4 h-4 mr-2" /> Save Grade
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-muted/10 rounded-xl border border-dashed">
                  <FileText className="w-12 h-12 mb-4 opacity-20" />
                  <p>Select a student submission from the left list to view details and grade.</p>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function AssignmentCard({ assignment, subjectName, onEdit, onDelete, onViewSubmissions, index }: any) {
  return (
    <div
      className="bg-card rounded-xl border border-border p-5 card-hover animate-fade-in group"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{assignment.title}</h3>
            <p className="text-sm text-muted-foreground">
              {subjectName} • Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No date'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("capitalize", statusColors[assignment.status as keyof typeof statusColors] || statusColors.draft)}>
            {assignment.status}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onViewSubmissions}>
                <Eye className="w-4 h-4 mr-2" /> Submissions
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
        <div className="col-span-2 flex items-center justify-end">
          <Button variant="outline" size="sm" className="w-full" onClick={onViewSubmissions}>
            View Submissions
          </Button>
        </div>
      </div>
    </div>
  );
}

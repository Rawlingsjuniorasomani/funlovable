import { useState, useEffect } from "react";
import { Plus, Search, MoreVertical, Edit, Trash2, Eye, Target, Play, CheckCircle, Clock, BarChart3, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { subjectsAPI, modulesAPI, quizzesAPI } from "@/config/api";

export function AdminQuizzes() {
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "", subjectId: "", moduleId: "", questionCount: "10", duration: "15"
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subjectsData, modulesData, quizzesData] = await Promise.all([
        subjectsAPI.getAll(),
        modulesAPI.getAll(),
        quizzesAPI.getAll()
      ]);
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      
      const normalizedModules = (Array.isArray(modulesData) ? modulesData : []).map((m: any) => ({
        ...m,
        subjectId: m.subject_id || m.subjectId,
      }));
      setModules(normalizedModules);
      setQuizzes((Array.isArray(quizzesData) ? quizzesData : []).map((q: any) => ({
        ...q,
        subjectId: q.subject_id || q.subjectId, 
        moduleId: q.module_id || q.moduleId,
        questionCount: q.questions_count || 10, 
        duration: q.time_limit_minutes || q.duration || 15,
        status: q.is_active ? 'active' : 'draft', 
        attempts: q.attempts_count || 0,
        avgScore: q.avg_score || 0,
      })));
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({ title: "Error loading data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.title || !formData.subjectId) {
      toast({ title: "Missing Fields", variant: "destructive" });
      return;
    }

    try {
      await quizzesAPI.create({
        title: formData.title,
        module_id: formData.moduleId || undefined,
        subject_id: formData.subjectId,
        questions_count: parseInt(formData.questionCount, 10) || 10,
        time_limit_minutes: parseInt(formData.duration, 10) || 15,
        passing_score: 70,
      });
      await loadData();
      setIsAddOpen(false);
      setFormData({ title: "", subjectId: "", moduleId: "", questionCount: "10", duration: "15" });
      toast({ title: "Quiz Created" });
    } catch (error) {
      console.error('Failed to create quiz:', error);
      toast({ title: "Failed to create quiz", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await quizzesAPI.delete(id);
      await loadData();
      toast({ title: "Quiz Deleted", variant: "destructive" });
    } catch (error) {
      console.error('Failed to delete quiz:', error);
      toast({ title: "Failed to delete quiz", variant: "destructive" });
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    const isActive = status === 'active';
    try {
      await quizzesAPI.update(id, { is_active: isActive });
      await loadData();
      toast({ title: isActive ? "Quiz Published" : "Status Updated" });
    } catch (error) {
      console.error('Failed to update status:', error);
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  };

  const filtered = quizzes.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = quizzes.filter(q => q.status === 'active').length;
  const draftCount = quizzes.filter(q => q.status === 'draft').length;
  const totalAttempts = quizzes.reduce((sum, q) => sum + q.attempts, 0);
  const avgScore = quizzes.length ? Math.round(quizzes.reduce((sum, q) => sum + q.avgScore, 0) / quizzes.length) : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-secondary/10 text-secondary border-secondary/30"><CheckCircle className="w-3 h-3 mr-1" /> Active</Badge>;
      case 'closed': return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Closed</Badge>;
      default: return <Badge variant="outline">Draft</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Quizzes Management</h1>
          <p className="text-muted-foreground">Create and manage quizzes across all subjects</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Create Quiz</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Quiz</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Quiz Title *</Label>
                <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Fractions Quiz" />
              </div>
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Select value={formData.subjectId} onValueChange={v => setFormData({ ...formData, subjectId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.icon} {s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Module (Optional)</Label>
                <Select value={formData.moduleId} onValueChange={v => setFormData({ ...formData, moduleId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select module" /></SelectTrigger>
                  <SelectContent>
                    {modules.filter(m => m.subjectId === formData.subjectId).map(m => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Questions</Label>
                  <Select value={formData.questionCount} onValueChange={v => setFormData({ ...formData, questionCount: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 questions</SelectItem>
                      <SelectItem value="10">10 questions</SelectItem>
                      <SelectItem value="15">15 questions</SelectItem>
                      <SelectItem value="20">20 questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Time Limit</Label>
                  <Select value={formData.duration} onValueChange={v => setFormData({ ...formData, duration: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="20">20 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd}>Create Quiz</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Quizzes</p>
                <p className="text-2xl font-bold text-secondary">{activeCount}</p>
              </div>
              <Target className="w-8 h-8 text-secondary opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Drafts</p>
                <p className="text-2xl font-bold">{draftCount}</p>
              </div>
              <Clock className="w-8 h-8 text-muted-foreground opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Attempts</p>
                <p className="text-2xl font-bold text-primary">{totalAttempts}</p>
              </div>
              <Users className="w-8 h-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold text-tertiary">{avgScore}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-tertiary opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Input placeholder="Search quizzes..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-xl border p-12 text-center">
          <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No Quizzes Found</h3>
          <Button onClick={() => setIsAddOpen(true)}><Plus className="w-4 h-4 mr-2" /> Create First Quiz</Button>
        </div>
      ) : (
        <div className="bg-card rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quiz</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Avg Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(quiz => {
                const subject = subjects.find(s => s.id === quiz.subjectId);
                return (
                  <TableRow key={quiz.id}>
                    <TableCell className="font-medium">{quiz.title}</TableCell>
                    <TableCell><Badge variant="outline">{subject?.icon} {subject?.name}</Badge></TableCell>
                    <TableCell>{quiz.questionCount}</TableCell>
                    <TableCell>{quiz.duration} min</TableCell>
                    <TableCell>{quiz.attempts}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={quiz.avgScore} className="w-16 h-2" />
                        <span className={quiz.avgScore >= 70 ? 'text-secondary' : 'text-muted-foreground'}>{quiz.avgScore}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(quiz.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Eye className="w-4 h-4 mr-2" /> Preview</DropdownMenuItem>
                          <DropdownMenuItem><BarChart3 className="w-4 h-4 mr-2" /> View Results</DropdownMenuItem>
                          <DropdownMenuItem><Edit className="w-4 h-4 mr-2" /> Edit Questions</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {quiz.status === 'draft' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(quiz.id, 'active')} className="text-secondary">
                              <Play className="w-4 h-4 mr-2" /> Publish
                            </DropdownMenuItem>
                          )}
                          {quiz.status === 'active' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(quiz.id, 'closed')}>
                              <Clock className="w-4 h-4 mr-2" /> Close Quiz
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDelete(quiz.id)} className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { lessonsAPI, subjectsAPI, modulesAPI } from "@/config/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, FileText, CheckCircle, Loader2, Plus, Trash2, Edit, BookOpen, Clock } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";

export function TeacherLessonsPage() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [lessons, setLessons] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    subject_id: "",
    module_id: "",
    student_class: "",
    topic: "",
    description: "",
    duration_minutes: "",
    objectives: [""],
    file: null as File | null
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (formData.subject_id) {
      loadModules(formData.subject_id);
    }
  }, [formData.subject_id]);

  const loadData = async () => {
    try {
      const [subjectsData, lessonsData] = await Promise.all([
        subjectsAPI.getTeacher(),
        lessonsAPI.getAll(user?.id ? { teacherId: user.id } : undefined)
      ]);
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      setLessons(Array.isArray(lessonsData) ? lessonsData : []);
    } catch (error) {
      toast.error("Failed to load data");
    }
  };

  const loadModules = async (subjectId: string) => {
    try {
      const data = await modulesAPI.getAll(subjectId);
      setModules(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load modules");
    }
  };

  const addObjective = () => {
    setFormData(prev => ({ ...prev, objectives: [...prev.objectives, ""] }));
  };

  const updateObjective = (index: number, value: string) => {
    const newObjectives = [...formData.objectives];
    newObjectives[index] = value;
    setFormData(prev => ({ ...prev, objectives: newObjectives }));
  };

  const removeObjective = (index: number) => {
    const newObjectives = formData.objectives.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, objectives: newObjectives }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.module_id || !formData.subject_id) {
      toast.error("Please fill in all required fields (Title, Subject, Module)");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('module_id', formData.module_id);
      data.append('title', formData.title);
      data.append('topic', formData.topic);
      data.append('content', formData.description);
      data.append('student_class', formData.student_class);
      data.append('duration_minutes', formData.duration_minutes);
      data.append('learning_objectives', JSON.stringify(formData.objectives.filter(o => o.trim())));

      if (formData.file) {
        data.append('file', formData.file);
      }

      await lessonsAPI.createWithFile(data);
      toast.success("Lesson created successfully!");

      
      setFormData({
        title: "",
        subject_id: "",
        module_id: "",
        student_class: "",
        topic: "",
        description: "",
        duration_minutes: "",
        objectives: [""],
        file: null
      });
      setIsCreateOpen(false);
      loadData(); 
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create lesson");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;

    try {
      await lessonsAPI.delete(id);
      toast.success("Lesson deleted");
      loadData();
    } catch (error) {
      toast.error("Failed to delete lesson");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">My Lessons</h2>
          <p className="text-muted-foreground">Manage your lessons and course content</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Lesson
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Lesson</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subject *</Label>
                  <Select value={formData.subject_id} onValueChange={v => setFormData({ ...formData, subject_id: v, module_id: "" })}>
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
                  <Label>Module *</Label>
                  <Select value={formData.module_id} onValueChange={v => setFormData({ ...formData, module_id: v })} disabled={!formData.subject_id}>
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

              <div className="space-y-2">
                <Label>Lesson Title *</Label>
                <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Introduction to Variables" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Topic</Label>
                  <Input value={formData.topic} onChange={e => setFormData({ ...formData, topic: e.target.value })} placeholder="e.g., Programming Basics" />
                </div>
                <div className="space-y-2">
                  <Label>Class</Label>
                  <Input value={formData.student_class} onChange={e => setFormData({ ...formData, student_class: e.target.value })} placeholder="e.g., Grade 10" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input type="number" value={formData.duration_minutes} onChange={e => setFormData({ ...formData, duration_minutes: e.target.value })} placeholder="45" />
              </div>

              <div className="space-y-2">
                <Label>Description/Content</Label>
                <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Lesson content..." className="h-32" />
              </div>

              <div className="space-y-2">
                <Label>Learning Objectives</Label>
                {formData.objectives.map((obj, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input value={obj} onChange={e => updateObjective(idx, e.target.value)} placeholder={`Objective ${idx + 1}`} />
                    {formData.objectives.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeObjective(idx)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addObjective}>
                  <Plus className="w-4 h-4 mr-2" /> Add Objective
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Attachment (optional)</Label>
                <Input type="file" onChange={e => setFormData({ ...formData, file: e.target.files?.[0] || null })} />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : <><CheckCircle className="w-4 h-4 mr-2" /> Create Lesson</>}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {lessons.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Lessons Yet</h3>
            <p className="text-muted-foreground mb-4">Create your first lesson to get started</p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Lesson
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Attachment</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lessons.map(lesson => (
                <TableRow key={lesson.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{lesson.title}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">{lesson.content}</p>
                    </div>
                  </TableCell>
                  <TableCell>{lesson.topic || "-"}</TableCell>
                  <TableCell>{lesson.student_class || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      {lesson.duration_minutes || 0} mins
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {lesson.attachment_url ? (
                      <Badge variant="secondary">
                        <FileText className="w-3 h-3 mr-1" />
                        File
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(lesson.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

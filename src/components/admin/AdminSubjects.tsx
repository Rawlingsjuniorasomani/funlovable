import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, BookOpen, Users, Layers, MoreVertical, CheckCircle } from "lucide-react";
import { IconRenderer } from "@/components/shared/IconRenderer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { subjectsAPI } from "@/config/api";

interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
  teacherCount: number;
  studentCount: number;
  moduleCount: number;
  status?: string;
}

const iconOptions = ["BookOpen", "Calculator", "Beaker", "Globe", "Monitor", "Music", "Palette", "Dna", "Languages", "FileText"];

export function AdminSubjects() {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", icon: "BookOpen" });

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const data = await subjectsAPI.getAll();
      const uniqueData = (Array.isArray(data) ? data : []).reduce((acc: any[], current: any) => {
        const x = acc.find(item => item.name === current.name);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);
      setSubjects(uniqueData.map((s: any) => ({
        id: s.id,
        name: s.name,
        description: s.description || "",
        icon: s.icon || "BookOpen",
        teacherCount: s.teacher_count || 0,
        studentCount: s.student_count || 0,
        moduleCount: s.module_count || 0
      })));
    } catch (error) {
      console.error('Failed to load subjects:', error);
      toast({ title: "Error", description: "Failed to load subjects", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (subjectData?: Partial<Subject>) => {
    
    
    const dataToSave = subjectData || formData;
    const isNameValid = subjectData ? true : !!formData.name;

    if (!isNameValid && !subjectData) return;

    try {
      if (editingSubject || (subjectData && (subjectData as any).id)) {
        const id = editingSubject?.id || (subjectData as any).id;
        await subjectsAPI.update(id, {
          name: dataToSave.name || (subjects.find(s => s.id === id)?.name),
          description: dataToSave.description,
          icon: (dataToSave as any).icon,
          status: (dataToSave as any).status
        } as any);
        toast({ title: "Subject Updated", description: "Changes saved successfully." });
      } else {
        await subjectsAPI.create({
          name: formData.name,
          description: formData.description,
          icon: formData.icon
        });
        toast({ title: "Subject Created", description: `${formData.name} has been created.` });
      }

      await loadSubjects();
      if (!subjectData) {
        setFormData({ name: "", description: "", icon: "BookOpen" });
        setEditingSubject(null);
        setIsAddOpen(false);
      }
    } catch (error) {
      console.error('Failed to save subject:', error);
      toast({ title: "Error", description: "Failed to save subject", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (!isAddOpen) {
      setEditingSubject(null);
      setFormData({ name: "", description: "", icon: "BookOpen" });
    }
  }, [isAddOpen]);

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({ name: subject.name, description: subject.description, icon: subject.icon });
    setIsAddOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subject?")) return;
    try {
      await subjectsAPI.delete(id);
      await loadSubjects();
      toast({ title: "Subject Deleted", variant: "destructive" });
    } catch (error) {
      console.error('Failed to delete subject:', error);
      toast({ title: "Error", description: "Failed to delete subject", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Subjects Management</h1>
          <p className="text-muted-foreground">Manage all subjects across the platform</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Subject</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingSubject ? "Edit Subject" : "Add New Subject"}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Icon</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {iconOptions.map((icon) => (
                    <button key={icon} onClick={() => setFormData({ ...formData, icon })} className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${formData.icon === icon ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>
                      <IconRenderer iconName={icon} className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>
              <div><Label>Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1" /></div>
              <div><Label>Description</Label><Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="mt-1" /></div>
              <Button onClick={() => handleSave()} className="w-full">{editingSubject ? "Update" : "Create"} Subject</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading subjects...</div>
      ) : subjects.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-foreground mb-2">No Subjects Found</h3>
          <p className="text-muted-foreground mb-4">Create your first subject to get started.</p>
          <Button onClick={() => setIsAddOpen(true)}><Plus className="w-4 h-4 mr-2" /> Add Subject</Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject, index) => (
            <div key={subject.id} className="bg-card rounded-xl border border-border p-6 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-tertiary/20 flex items-center justify-center text-3xl">
                  <IconRenderer iconName={subject.icon} />
                </div>
                <div className="flex gap-2">
                  { }
                  <Badge variant={subject.status === 'Draft' || subject.status === 'Pending Approval' ? "secondary" : "default"}>
                    {subject.status || "Published"}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {subject.status !== "Published" && (
                        <DropdownMenuItem onClick={() => handleSave({ ...subject, status: "Published" } as any)}>
                          <CheckCircle className="w-4 h-4 mr-2" /> Approve
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleEdit(subject)}><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(subject.id)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">{subject.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{subject.description || "No description"}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1"><Layers className="w-4 h-4" /><span>{subject.moduleCount} modules</span></div>
                <div className="flex items-center gap-1"><Users className="w-4 h-4" /><span>{subject.studentCount} students</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

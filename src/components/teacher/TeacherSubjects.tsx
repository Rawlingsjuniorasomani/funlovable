import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Users, BookOpen, MoreVertical, Layers, BarChart } from "lucide-react";
import { IconRenderer } from "@/components/shared/IconRenderer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subjectsAPI } from "@/config/api";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
  moduleCount?: number;
  studentCount?: number;
  level?: string;
  status?: string;
}

const LEVELS = ["Nursery", "Kindergarten", "Lower Primary", "Upper Primary", "JHS", "SHS"];

export function TeacherSubjects() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", icon: "📚", level: "Nursery", status: "Draft" });

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const data = await subjectsAPI.getTeacher();
      
      const uniqueSubjects = (Array.isArray(data) ? data : []).reduce((acc: Subject[], current: Subject) => {
        const x = acc.find(item => item.id === current.id);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);
      setSubjects(uniqueSubjects);
    } catch (error) {
      console.error('Failed to load subjects:', error);
      toast({
        title: "Error",
        description: "Failed to load subjects. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    try {
      if (editingSubject) {
        await subjectsAPI.update(editingSubject.id, {
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
          level: formData.level,
          status: formData.status
        });
        toast({ title: "Subject updated", description: `${formData.name} has been updated.` });
      } else {
        await subjectsAPI.create({
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
          level: formData.level,
          status: formData.status
        });
        toast({ title: "Subject created", description: `${formData.name} has been created.` });
      }

      await loadSubjects();
      setIsDialogOpen(false);
      setEditingSubject(null);
      setFormData({ name: "", description: "", icon: "📚", level: "Nursery", status: "Draft" });
    } catch (error) {
      console.error('Failed to save subject:', error);
      toast({
        title: "Error",
        description: "Failed to save subject. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      description: subject.description,
      icon: subject.icon,
      level: subject.level || "Nursery",
      status: subject.status || "Draft"
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const subject = subjects.find(s => s.id === id);
    try {
      await subjectsAPI.delete(id);
      await loadSubjects();
      toast({ title: "Subject deleted", description: `${subject?.name} has been removed.`, variant: "destructive" });
    } catch (error) {
      console.error('Failed to delete subject:', error);
      toast({
        title: "Error",
        description: "Failed to delete subject. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleManageContent = (subjectId: string) => {
    navigate(`/teacher/modules?subject=${subjectId}`);
  };

  const iconOptions = ["📐", "🔬", "📚", "🌍", "💻", "🇫🇷", "🙏", "🎨", "🎵", "⚽"];

  
  const groupedSubjects = LEVELS.reduce((acc, level) => {
    const levelSubjects = subjects.filter(s => (s.level || "Nursery") === level);
    if (levelSubjects.length > 0) {
      acc[level] = levelSubjects;
    }
    return acc;
  }, {} as Record<string, Subject[]>);

  
  const otherSubjects = subjects.filter(s => !LEVELS.includes(s.level || ""));
  if (otherSubjects.length > 0) {
    groupedSubjects["Other"] = otherSubjects;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Subject Management</h2>
          <p className="text-muted-foreground">Create and manage your specific curriculum subjects</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingSubject(null); setFormData({ name: "", description: "", icon: "📚", level: "Nursery", status: "Draft" }); }}>
              <Plus className="w-4 h-4 mr-2" />
              New Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSubject ? "Edit Subject" : "Create New Subject"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-foreground">Icon</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {iconOptions.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setFormData(prev => ({ ...prev, icon }))}
                      className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${formData.icon === icon ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                        }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Mathematics, Science"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Subject description and objectives"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Educational Level</label>
                  <Select value={formData.level} onValueChange={(v) => setFormData(prev => ({ ...prev, level: v }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVELS.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Pending Approval">Pending Approval</SelectItem>
                      <SelectItem value="Published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleSave} className="w-full">
                {editingSubject ? "Update Subject" : "Create Subject"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {Object.entries(groupedSubjects).length === 0 && !loading ? (
        <div className="text-center py-12 bg-muted/20 rounded-xl">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold">No Subjects Created</h3>
          <p className="text-muted-foreground">Start by creating a subject for a specific level.</p>
        </div>
      ) : (
        Object.entries(groupedSubjects).map(([level, levelSubjects]) => (
          <div key={level} className="space-y-4">
            <h3 className="text-lg font-display font-bold flex items-center gap-2 text-primary">
              <Layers className="w-5 h-5" />
              {level}
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {levelSubjects.map((subject, index) => (
                <div
                  key={subject.id}
                  className="bg-card rounded-xl border border-border p-6 card-hover animate-fade-in flex flex-col"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-tertiary/20 flex items-center justify-center text-3xl">
                      <IconRenderer iconName={subject.icon} />
                    </div>
                    <div className="flex gap-2">
                      {subject.status && (
                        <Badge variant={subject.status === "Published" ? "default" : subject.status === "Pending Approval" ? "secondary" : "outline"}>
                          {subject.status}
                        </Badge>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(subject)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(subject.id)} className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-1">{subject.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{subject.description}</p>

                  <div className="mt-auto space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{subject.moduleCount || 0} modules</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{subject.studentCount || 0} students</span>
                      </div>
                    </div>

                    <Button className="w-full" variant="outline" onClick={() => handleManageContent(subject.id)}>
                      <Layers className="w-4 h-4 mr-2" />
                      Manage Content
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

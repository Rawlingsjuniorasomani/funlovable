import { useState } from "react";
import { Plus, Edit, Trash2, BookOpen, Users, Layers, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
  teacherCount: number;
  studentCount: number;
  moduleCount: number;
}

const iconOptions = ["📐", "🔬", "📚", "🌍", "💻", "🇫🇷", "🙏", "🎨", "🎵", "⚽"];

export function AdminSubjects() {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", icon: "📚" });

  const handleSave = () => {
    if (!formData.name) return;
    if (editingSubject) {
      setSubjects(subjects.map((s) => s.id === editingSubject.id ? { ...s, ...formData } : s));
      toast({ title: "Subject Updated", description: `${formData.name} has been updated.` });
    } else {
      const newSubject: Subject = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        teacherCount: 0,
        studentCount: 0,
        moduleCount: 0,
      };
      setSubjects([...subjects, newSubject]);
      toast({ title: "Subject Created", description: `${formData.name} has been created.` });
    }
    setFormData({ name: "", description: "", icon: "📚" });
    setEditingSubject(null);
    setIsAddOpen(false);
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({ name: subject.name, description: subject.description, icon: subject.icon });
    setIsAddOpen(true);
  };

  const handleDelete = (id: string) => {
    setSubjects(subjects.filter((s) => s.id !== id));
    toast({ title: "Subject Deleted", variant: "destructive" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Subjects Management</h1>
          <p className="text-muted-foreground">Manage all subjects across the platform</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) { setEditingSubject(null); setFormData({ name: "", description: "", icon: "📚" }); } }}>
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
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div><Label>Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1" /></div>
              <div><Label>Description</Label><Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="mt-1" /></div>
              <Button onClick={handleSave} className="w-full">{editingSubject ? "Update" : "Create"} Subject</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {subjects.length === 0 ? (
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
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-tertiary/20 flex items-center justify-center text-3xl">{subject.icon}</div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(subject)}><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(subject.id)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">{subject.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{subject.description || "No description"}</p>
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

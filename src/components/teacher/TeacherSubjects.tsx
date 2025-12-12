import { useState } from "react";
import { Plus, Edit, Trash2, Users, BookOpen, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockSubjects, Subject } from "@/data/mockData";
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
import { useToast } from "@/hooks/use-toast";

export function TeacherSubjects() {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", icon: "📚" });

  const handleSave = () => {
    if (!formData.name.trim()) return;

    if (editingSubject) {
      setSubjects(prev => prev.map(s =>
        s.id === editingSubject.id
          ? { ...s, name: formData.name, description: formData.description, icon: formData.icon }
          : s
      ));
      toast({ title: "Subject updated", description: `${formData.name} has been updated.` });
    } else {
      const newSubject: Subject = {
        id: `s${Date.now()}`,
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        teacherId: "t1",
        moduleCount: 0,
        studentCount: 0,
      };
      setSubjects(prev => [...prev, newSubject]);
      toast({ title: "Subject created", description: `${formData.name} has been created.` });
    }

    setIsDialogOpen(false);
    setEditingSubject(null);
    setFormData({ name: "", description: "", icon: "📚" });
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({ name: subject.name, description: subject.description, icon: subject.icon });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const subject = subjects.find(s => s.id === id);
    setSubjects(prev => prev.filter(s => s.id !== id));
    toast({ title: "Subject deleted", description: `${subject?.name} has been removed.`, variant: "destructive" });
  };

  const iconOptions = ["📐", "🔬", "📚", "🌍", "💻", "🇫🇷", "🙏", "🎨", "🎵", "⚽"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Subjects</h2>
          <p className="text-muted-foreground">Manage your teaching subjects</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingSubject(null); setFormData({ name: "", description: "", icon: "📚" }); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSubject ? "Edit Subject" : "Create Subject"}</DialogTitle>
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
                  placeholder="Subject name"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description"
                  className="mt-1"
                />
              </div>
              <Button onClick={handleSave} className="w-full">
                {editingSubject ? "Update Subject" : "Create Subject"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject, index) => (
          <div
            key={subject.id}
            className="bg-card rounded-xl border border-border p-6 card-hover animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-tertiary/20 flex items-center justify-center text-3xl">
                {subject.icon}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(subject)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(subject.id)} className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-1">{subject.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{subject.description}</p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{subject.moduleCount} modules</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{subject.studentCount} students</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

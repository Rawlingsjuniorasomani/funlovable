import { useState } from "react";
import { Plus, FileText, Clock, Users, CheckCircle, AlertCircle, MoreVertical, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { mockAssignments, mockSubjects, Assignment } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusColors = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-secondary/10 text-secondary border-secondary/30",
  closed: "bg-destructive/10 text-destructive border-destructive/30",
};

export function TeacherAssignments() {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subjectId: "",
    dueDate: "",
    totalPoints: 100,
  });

  const handleCreate = () => {
    if (!formData.title || !formData.subjectId) return;

    const newAssignment: Assignment = {
      id: `a${Date.now()}`,
      title: formData.title,
      description: formData.description,
      subjectId: formData.subjectId,
      dueDate: formData.dueDate,
      totalPoints: formData.totalPoints,
      status: "draft",
      submissions: 0,
      totalStudents: 35,
    };

    setAssignments(prev => [...prev, newAssignment]);
    toast({ title: "Assignment created", description: `${formData.title} has been created.` });
    setIsDialogOpen(false);
    setFormData({ title: "", description: "", subjectId: "", dueDate: "", totalPoints: 100 });
  };

  const handleStatusChange = (id: string, status: Assignment["status"]) => {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    toast({ title: "Status updated" });
  };

  const handleDelete = (id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
    toast({ title: "Assignment deleted", variant: "destructive" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Assignments</h2>
          <p className="text-muted-foreground">Create and manage student assignments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Assignment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Assignment title"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Select value={formData.subjectId} onValueChange={(v) => setFormData(prev => ({ ...prev, subjectId: v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockSubjects.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.icon} {s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Due Date</label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Points</label>
                  <Input
                    type="number"
                    value={formData.totalPoints}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalPoints: Number(e.target.value) }))}
                    className="mt-1"
                  />
                </div>
              </div>
              <Button onClick={handleCreate} className="w-full">Create Assignment</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: assignments.length, icon: FileText, color: "text-primary" },
          { label: "Active", value: assignments.filter(a => a.status === "active").length, icon: CheckCircle, color: "text-secondary" },
          { label: "Pending Review", value: 12, icon: AlertCircle, color: "text-accent" },
          { label: "Avg Completion", value: "76%", icon: Users, color: "text-tertiary" },
        ].map((stat, i) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-4 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
            <stat.icon className={cn("w-5 h-5 mb-2", stat.color)} />
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Assignment List */}
      <div className="space-y-4">
        {assignments.map((assignment, index) => {
          const subject = mockSubjects.find(s => s.id === assignment.subjectId);
          const completionRate = Math.round((assignment.submissions / assignment.totalStudents) * 100);

          return (
            <div
              key={assignment.id}
              className="bg-card rounded-xl border border-border p-5 card-hover animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-tertiary/20 flex items-center justify-center text-2xl">
                    {subject?.icon || "📝"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{assignment.title}</h3>
                    <p className="text-sm text-muted-foreground">{subject?.name} • Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn("capitalize", statusColors[assignment.status])}>
                    {assignment.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Eye className="w-4 h-4 mr-2" />View Submissions</DropdownMenuItem>
                      <DropdownMenuItem><Edit className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                      {assignment.status === "draft" && (
                        <DropdownMenuItem onClick={() => handleStatusChange(assignment.id, "active")}>
                          <CheckCircle className="w-4 h-4 mr-2" />Publish
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleDelete(assignment.id)} className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4">{assignment.description}</p>

              <div className="flex items-center gap-6">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Submissions</span>
                    <span className="font-medium text-foreground">{assignment.submissions}/{assignment.totalStudents}</span>
                  </div>
                  <Progress value={completionRate} className="h-2" />
                </div>
                <div className="text-center px-4 py-2 rounded-lg bg-muted/50">
                  <p className="text-lg font-bold text-foreground">{assignment.totalPoints}</p>
                  <p className="text-xs text-muted-foreground">Points</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

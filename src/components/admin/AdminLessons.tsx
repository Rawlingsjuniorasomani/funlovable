import { useState } from "react";
import { FileText, Plus, Edit, Trash2, MoreVertical, Video, BookOpen, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { mockSubjects, mockModules, mockLessons, Lesson } from "@/data/mockData";

export function AdminLessons() {
  const { toast } = useToast();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", moduleId: "", type: "video" as const, duration: "" });

  const handleAdd = () => {
    if (!formData.title || !formData.moduleId) {
      toast({ title: "Missing Fields", variant: "destructive" });
      return;
    }
    const newLesson: Lesson = {
      id: `l${Date.now()}`,
      ...formData,
      order: lessons.filter(l => l.moduleId === formData.moduleId).length + 1,
    };
    setLessons([...lessons, newLesson]);
    setIsAddOpen(false);
    setFormData({ title: "", description: "", moduleId: "", type: "video", duration: "" });
    toast({ title: "Lesson Created" });
  };

  const handleDelete = (id: string) => {
    setLessons(lessons.filter(l => l.id !== id));
    toast({ title: "Lesson Deleted", variant: "destructive" });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4 text-primary" />;
      case 'interactive': return <Play className="w-4 h-4 text-secondary" />;
      default: return <BookOpen className="w-4 h-4 text-tertiary" />;
    }
  };

  const filtered = lessons.filter(l => {
    const matchesSearch = l.title.toLowerCase().includes(search.toLowerCase());
    const matchesModule = moduleFilter === "all" || l.moduleId === moduleFilter;
    return matchesSearch && matchesModule;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Lessons Management</h1>
          <p className="text-muted-foreground">Create and manage lesson content</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Lesson</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Lesson</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Module *</Label>
                <Select value={formData.moduleId} onValueChange={v => setFormData({ ...formData, moduleId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select module" /></SelectTrigger>
                  <SelectContent>
                    {mockModules.map(m => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="interactive">Interactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Input value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} placeholder="e.g., 15 min" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd}>Create Lesson</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <Input placeholder="Search lessons..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
        <Select value={moduleFilter} onValueChange={setModuleFilter}>
          <SelectTrigger className="w-56"><SelectValue placeholder="Filter by module" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modules</SelectItem>
            {mockModules.map(m => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-xl border p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No Lessons Found</h3>
          <Button onClick={() => setIsAddOpen(true)}><Plus className="w-4 h-4 mr-2" /> Create First Lesson</Button>
        </div>
      ) : (
        <div className="bg-card rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lesson</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(lesson => {
                const module = mockModules.find(m => m.id === lesson.moduleId);
                return (
                  <TableRow key={lesson.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{lesson.title}</p>
                        <p className="text-xs text-muted-foreground">{lesson.description}</p>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{module?.title}</Badge></TableCell>
                    <TableCell><div className="flex items-center gap-2">{getTypeIcon(lesson.type)} {lesson.type}</div></TableCell>
                    <TableCell>{lesson.duration}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(lesson.id)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
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

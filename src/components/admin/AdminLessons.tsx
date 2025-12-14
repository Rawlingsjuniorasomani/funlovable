import { useState, useEffect } from "react";
import { BookOpen, Plus, Edit, Trash2, MoreVertical, PlayCircle, FileText, CheckCircle } from "lucide-react";
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

import { subjectsAPI, modulesAPI, lessonsAPI } from "@/config/api";

export function AdminLessons() {
  const { toast } = useToast();
  const [lessons, setLessons] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    moduleId: "",
    videoUrl: "",
    duration: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subjectsData, modulesData, lessonsData] = await Promise.all([
        subjectsAPI.getAll(),
        modulesAPI.getAll(),
        lessonsAPI.getAll()
      ]);
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      setModules(Array.isArray(modulesData) ? modulesData : []);

      const mappedLessons = (Array.isArray(lessonsData) ? lessonsData : []).map((l: any) => ({
        ...l,
        moduleId: l.module_id || l.moduleId,
        videoUrl: l.video_url || l.videoUrl,
        duration: l.duration_minutes ? `${l.duration_minutes} mins` : (l.duration || "N/A"),
      }));
      setLessons(mappedLessons);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({ title: "Error loading data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.title || !formData.moduleId) {
      toast({ title: "Missing Fields", variant: "destructive" });
      return;
    }

    try {
      await lessonsAPI.create({
        module_id: formData.moduleId,
        title: formData.title,
        content: formData.content,
        video_url: formData.videoUrl,
        duration_minutes: parseInt(formData.duration) || 30,
      });
      await loadData();
      setIsAddOpen(false);
      setFormData({ title: "", content: "", moduleId: "", videoUrl: "", duration: "" });
      toast({ title: "Lesson Created" });
    } catch (error) {
      console.error('Failed to create lesson:', error);
      toast({ title: "Failed to create lesson", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await lessonsAPI.delete(id);
      await loadData();
      toast({ title: "Lesson Deleted", variant: "destructive" });
    } catch (error) {
      console.error('Failed to delete lesson:', error);
      toast({ title: "Failed to delete lesson", variant: "destructive" });
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
          <p className="text-muted-foreground">Create and manage individual lessons</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Lesson</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Create New Lesson</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Module *</Label>
                  <Select value={formData.moduleId} onValueChange={v => setFormData({ ...formData, moduleId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select module" /></SelectTrigger>
                    <SelectContent>
                      {modules.map(m => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Duration (mins)</Label>
                  <Input type="number" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} placeholder="e.g., 45" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Video URL</Label>
                <Input value={formData.videoUrl} onChange={e => setFormData({ ...formData, videoUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} className="h-32" />
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
          <SelectTrigger className="w-48"><SelectValue placeholder="Filter by module" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modules</SelectItem>
            {modules.map(m => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-xl border p-12 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
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
                const module = modules.find(m => m.id === lesson.moduleId);
                return (
                  <TableRow key={lesson.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{lesson.title}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{lesson.content}</p>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{module?.title}</Badge></TableCell>
                    <TableCell>
                      {lesson.videoUrl ? (
                        <Badge variant="secondary"><PlayCircle className="w-3 h-3 mr-1" /> Video</Badge>
                      ) : (
                        <Badge variant="outline"><FileText className="w-3 h-3 mr-1" /> Text</Badge>
                      )}
                    </TableCell>
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

import { useState } from "react";
import { Layers, Plus, Edit, Trash2, MoreVertical, BookOpen, Clock, Users } from "lucide-react";
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
import { mockSubjects, mockModules, Module } from "@/data/mockData";

export function AdminModules() {
  const { toast } = useToast();
  const [modules, setModules] = useState<Module[]>([]);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", subjectId: "", duration: "" });

  const handleAdd = () => {
    if (!formData.title || !formData.subjectId) {
      toast({ title: "Missing Fields", variant: "destructive" });
      return;
    }
    const newModule: Module = {
      id: `m${Date.now()}`,
      ...formData,
      order: modules.filter(m => m.subjectId === formData.subjectId).length + 1,
      lessonCount: 0,
    };
    setModules([...modules, newModule]);
    setIsAddOpen(false);
    setFormData({ title: "", description: "", subjectId: "", duration: "" });
    toast({ title: "Module Created" });
  };

  const handleDelete = (id: string) => {
    setModules(modules.filter(m => m.id !== id));
    toast({ title: "Module Deleted", variant: "destructive" });
  };

  const filtered = modules.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = subjectFilter === "all" || m.subjectId === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Modules Management</h1>
          <p className="text-muted-foreground">Create and manage course modules</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Module</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Module</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Select value={formData.subjectId} onValueChange={v => setFormData({ ...formData, subjectId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>
                    {mockSubjects.map(s => <SelectItem key={s.id} value={s.id}>{s.icon} {s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Input value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} placeholder="e.g., 2 hours" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd}>Create Module</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <Input placeholder="Search modules..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filter by subject" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {mockSubjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-xl border p-12 text-center">
          <Layers className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No Modules Found</h3>
          <Button onClick={() => setIsAddOpen(true)}><Plus className="w-4 h-4 mr-2" /> Create First Module</Button>
        </div>
      ) : (
        <div className="bg-card rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Module</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Lessons</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(module => {
                const subject = mockSubjects.find(s => s.id === module.subjectId);
                return (
                  <TableRow key={module.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{module.title}</p>
                        <p className="text-xs text-muted-foreground">{module.description}</p>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{subject?.icon} {subject?.name}</Badge></TableCell>
                    <TableCell>{module.lessonCount} lessons</TableCell>
                    <TableCell>{module.duration}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(module.id)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
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

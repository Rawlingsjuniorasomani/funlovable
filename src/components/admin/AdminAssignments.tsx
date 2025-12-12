import { useState } from "react";
import { FileText, Plus, Search, MoreVertical, Edit, Trash2, Eye, CheckCircle, Clock, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { mockSubjects, mockModules, mockAssignments, Assignment } from "@/data/mockData";

export function AdminAssignments() {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "", description: "", subjectId: "", moduleId: "", dueDate: "", totalPoints: "100"
  });

  const handleAdd = () => {
    if (!formData.title || !formData.subjectId || !formData.dueDate) {
      toast({ title: "Missing Fields", variant: "destructive" });
      return;
    }
    const newAssignment: Assignment = {
      id: `a${Date.now()}`,
      title: formData.title,
      description: formData.description,
      subjectId: formData.subjectId,
      moduleId: formData.moduleId || undefined,
      dueDate: formData.dueDate,
      totalPoints: parseInt(formData.totalPoints),
      status: "active",
      submissions: 0,
      totalStudents: 30,
    };
    setAssignments([...assignments, newAssignment]);
    setIsAddOpen(false);
    setFormData({ title: "", description: "", subjectId: "", moduleId: "", dueDate: "", totalPoints: "100" });
    toast({ title: "Assignment Created" });
  };

  const handleDelete = (id: string) => {
    setAssignments(assignments.filter(a => a.id !== id));
    toast({ title: "Assignment Deleted", variant: "destructive" });
  };

  const handleStatusChange = (id: string, status: Assignment["status"]) => {
    setAssignments(assignments.map(a => a.id === id ? { ...a, status } : a));
    toast({ title: "Status Updated" });
  };

  const filtered = assignments.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = assignments.filter(a => a.status === 'active').length;
  const closedCount = assignments.filter(a => a.status === 'closed').length;
  const totalSubmissions = assignments.reduce((sum, a) => sum + a.submissions, 0);

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
          <h1 className="text-2xl font-display font-bold">Assignments Management</h1>
          <p className="text-muted-foreground">Create and track student assignments</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Create Assignment</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create New Assignment</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Assignment title" />
              </div>
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
                <Label>Module (Optional)</Label>
                <Select value={formData.moduleId} onValueChange={v => setFormData({ ...formData, moduleId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select module" /></SelectTrigger>
                  <SelectContent>
                    {mockModules.filter(m => m.subjectId === formData.subjectId).map(m => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Assignment instructions..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Due Date *</Label>
                  <Input type="date" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Total Points</Label>
                  <Input type="number" value={formData.totalPoints} onChange={e => setFormData({ ...formData, totalPoints: e.target.value })} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd}>Create Assignment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-secondary">{activeCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-secondary opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Closed</p>
                <p className="text-2xl font-bold">{closedCount}</p>
              </div>
              <Clock className="w-8 h-8 text-muted-foreground opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Submissions</p>
                <p className="text-2xl font-bold text-primary">{totalSubmissions}</p>
              </div>
              <Users className="w-8 h-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Input placeholder="Search assignments..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-xl border p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No Assignments Found</h3>
          <Button onClick={() => setIsAddOpen(true)}><Plus className="w-4 h-4 mr-2" /> Create First Assignment</Button>
        </div>
      ) : (
        <div className="bg-card rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assignment</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Submissions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(assignment => {
                const subject = mockSubjects.find(s => s.id === assignment.subjectId);
                const completionRate = (assignment.submissions / assignment.totalStudents) * 100;
                return (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{assignment.title}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{assignment.description}</p>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{subject?.icon} {subject?.name}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {assignment.dueDate}
                      </div>
                    </TableCell>
                    <TableCell>{assignment.totalPoints}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{assignment.submissions}/{assignment.totalStudents}</span>
                          <span>{Math.round(completionRate)}%</span>
                        </div>
                        <Progress value={completionRate} className="h-1.5" />
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Eye className="w-4 h-4 mr-2" /> View Submissions</DropdownMenuItem>
                          <DropdownMenuItem><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {assignment.status === 'active' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(assignment.id, 'closed')}>
                              <Clock className="w-4 h-4 mr-2" /> Close Assignment
                            </DropdownMenuItem>
                          )}
                          {assignment.status === 'closed' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(assignment.id, 'active')} className="text-secondary">
                              <CheckCircle className="w-4 h-4 mr-2" /> Reopen
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDelete(assignment.id)} className="text-destructive">
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

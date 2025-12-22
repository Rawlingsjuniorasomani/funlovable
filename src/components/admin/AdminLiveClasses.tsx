import { useState, useEffect } from "react";
import { Video, Plus, Calendar, Users, Clock, Play, CheckCircle, MoreVertical, Edit, Trash2, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { subjectsAPI } from "@/config/api";

interface LiveClass {
  id: string;
  title: string;
  subjectId: string;
  teacherId?: string; 
  scheduledAt: string;
  duration: number;
  status: "scheduled" | "live" | "completed" | "cancelled";
  attendees: number;
  totalStudents: number;
}
import { useAuthContext } from "@/contexts/AuthContext";

export function AdminLiveClasses() {
  const { toast } = useToast();
  const { getAllUsers } = useAuthContext();
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "", subjectId: "", teacherId: "", scheduledAt: "", duration: "45"
  });

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await subjectsAPI.getAll();
        setSubjects(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch subjects", error);
        toast({ title: "Error", description: "Failed to load subjects", variant: "destructive" });
      }
    };
    fetchSubjects();
  }, []);

  const allUsers = getAllUsers();
  const userArray = Array.isArray(allUsers) ? allUsers : [];
  const teachers = userArray.filter(u => u.role === 'teacher' && u.approvalStatus === 'approved');

  const handleAdd = () => {
    if (!formData.title || !formData.subjectId || !formData.scheduledAt) {
      toast({ title: "Missing Fields", variant: "destructive" });
      return;
    }
    const newClass: LiveClass = {
      id: `lc${Date.now()}`,
      title: formData.title,
      subjectId: formData.subjectId,
      scheduledAt: formData.scheduledAt,
      duration: parseInt(formData.duration),
      status: "scheduled",
      attendees: 0,
      totalStudents: 30,
    };
    setClasses([...classes, newClass]);
    setIsAddOpen(false);
    setFormData({ title: "", subjectId: "", teacherId: "", scheduledAt: "", duration: "45" });
    toast({ title: "Live Class Scheduled" });
  };

  const handleDelete = (id: string) => {
    setClasses(classes.filter(c => c.id !== id));
    toast({ title: "Class Deleted", variant: "destructive" });
  };

  const handleStatusChange = (id: string, status: LiveClass["status"]) => {
    setClasses(classes.map(c => c.id === id ? { ...c, status } : c));
    toast({ title: `Class ${status === 'live' ? 'Started' : status === 'completed' ? 'Completed' : 'Updated'}` });
  };

  const filtered = classes.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const scheduledCount = classes.filter(c => c.status === 'scheduled').length;
  const liveCount = classes.filter(c => c.status === 'live').length;
  const completedCount = classes.filter(c => c.status === 'completed').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live': return <Badge className="bg-destructive/10 text-destructive border-destructive/30 animate-pulse"><Play className="w-3 h-3 mr-1" /> Live</Badge>;
      case 'completed': return <Badge className="bg-secondary/10 text-secondary border-secondary/30"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>;
      default: return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Scheduled</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Live Classes Management</h1>
          <p className="text-muted-foreground">Schedule and manage live teaching sessions</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Schedule Class</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Schedule Live Class</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Class Title *</Label>
                <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Fractions Review Session" />
              </div>
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Select value={formData.subjectId} onValueChange={v => setFormData({ ...formData, subjectId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.icon} {s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assign Teacher</Label>
                <Select value={formData.teacherId} onValueChange={v => setFormData({ ...formData, teacherId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                  <SelectContent>
                    {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date & Time *</Label>
                  <Input type="datetime-local" value={formData.scheduledAt} onChange={e => setFormData({ ...formData, scheduledAt: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Duration (mins)</Label>
                  <Select value={formData.duration} onValueChange={v => setFormData({ ...formData, duration: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd}>Schedule Class</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold">{scheduledCount}</p>
              </div>
              <Calendar className="w-8 h-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className={liveCount > 0 ? "border-destructive/50 bg-destructive/5" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Live Now</p>
                <p className="text-2xl font-bold text-destructive">{liveCount}</p>
              </div>
              <Video className="w-8 h-8 text-destructive opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-secondary">{completedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-secondary opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Input placeholder="Search classes..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="live">Live</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-xl border p-12 text-center">
          <Video className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No Live Classes Found</h3>
          <Button onClick={() => setIsAddOpen(true)}><Plus className="w-4 h-4 mr-2" /> Schedule First Class</Button>
        </div>
      ) : (
        <div className="bg-card rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(liveClass => {
                const subject = subjects.find(s => s.id === liveClass.subjectId);
                return (
                  <TableRow key={liveClass.id} className={liveClass.status === 'live' ? 'bg-destructive/5' : ''}>
                    <TableCell className="font-medium">{liveClass.title}</TableCell>
                    <TableCell><Badge variant="outline">{subject?.icon} {subject?.name}</Badge></TableCell>
                    <TableCell>{new Date(liveClass.scheduledAt).toLocaleString()}</TableCell>
                    <TableCell>{liveClass.duration} min</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        {liveClass.attendees}/{liveClass.totalStudents}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(liveClass.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {liveClass.status === 'scheduled' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(liveClass.id, 'live')} className="text-destructive">
                              <Play className="w-4 h-4 mr-2" /> Start Class
                            </DropdownMenuItem>
                          )}
                          {liveClass.status === 'live' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(liveClass.id, 'completed')} className="text-secondary">
                              <CheckCircle className="w-4 h-4 mr-2" /> End Class
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem><UserCheck className="w-4 h-4 mr-2" /> View Attendance</DropdownMenuItem>
                          <DropdownMenuItem><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(liveClass.id)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
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

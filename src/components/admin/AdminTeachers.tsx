import { useState, useEffect } from "react";
import { Plus, Search, MoreVertical, Edit, Trash2, Eye, UserCheck, CheckCircle, XCircle, Clock, Mail, BookOpen, UserPlus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import { User } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { subjectsAPI } from "@/config/api";
import { useMessageStore } from "@/hooks/useMessageStore";
import { usersAPI, teachersAPI } from "@/config/api";

interface TeacherWithDetails extends User {
  assignedSubjects?: string[];
  studentsCount?: number;
  classesCreated?: number;
  lessonsCreated?: number;
  lastLogin?: string;
}

export function AdminTeachers() {
  const { toast } = useToast();
  const { getAllUsers, approveUser, rejectUser, deleteUser, updateUserByAdmin } = useAuthContext();
  const [teachers, setTeachers] = useState<TeacherWithDetails[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherWithDetails | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" });
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  const [emailData, setEmailData] = useState({ subject: "", message: "", recipients: "single" });
  const { sendMessage } = useMessageStore();

  const loadSubjects = async () => {
    try {
      const data = await subjectsAPI.getAll();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load subjects:', error);
    }
  };

  const loadTeachers = async () => {
    try {
      const subjectNameToId = new Map(
        (Array.isArray(subjects) ? subjects : [])
          .filter((s: any) => s?.name && s?.id)
          .map((s: any) => [String(s.name).trim().toLowerCase(), String(s.id)])
      );

      
      const teachers = await usersAPI.getAll({ role: 'teacher' });
      
      const teacherUsers = (Array.isArray(teachers) ? teachers : []).map((t: any) => ({
        ...t,
        approvalStatus: t.is_approved ? 'approved' as const : 'pending' as const,
        onboardingComplete: t.is_onboarded,
        
        assignedSubjects: (t.subjects_list ? String(t.subjects_list).split(',') : [])
          .map((name: string) => name.trim().toLowerCase())
          .map((name: string) => subjectNameToId.get(name))
          .filter(Boolean) as string[],
        studentsCount: (t as any).studentsCount || 0,
        classesCreated: (t as any).classesCreated || 0,
        lessonsCreated: (t as any).lessonsCreated || 0,
        lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      }));
      setTeachers(teacherUsers);
    } catch (error) {
      console.error('Failed to load teachers:', error);
      toast({
        title: "Error",
        description: "Failed to load teachers. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    loadTeachers();
  }, [subjects.length]);

  const handleAddTeacher = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast({ title: "Missing Fields", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    const newTeacher = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: 'teacher' as const,
      avatar: formData.name.charAt(0).toUpperCase(),
      approvalStatus: 'approved' as const,
      password: formData.password,
    };

    
    
    try {
      if (usersAPI.update) {
        await usersAPI.update('', newTeacher);
      }
      loadTeachers();
    } catch (error) {
      console.error('Failed to create teacher:', error);
      toast({ title: "Error", description: "Failed to create teacher", variant: "destructive" });
      return;
    }

    setIsAddOpen(false);
    setFormData({ name: "", email: "", phone: "", password: "" });
    loadTeachers();
    toast({ title: "Teacher Added", description: "Teacher account created and approved" });
  };

  const handleEdit = () => {
    if (!selectedTeacher) return;

    updateUserByAdmin(selectedTeacher.id, {
      name: formData.name,
      phone: formData.phone,
    });

    setIsEditOpen(false);
    loadTeachers();
    toast({ title: "Teacher Updated", description: "Teacher details updated successfully" });
  };

  const handleApprove = async (teacherId: string) => {
    try {
      await usersAPI.approve(teacherId);
      await loadTeachers();
      toast({ title: "Teacher Approved", description: "The teacher can now access their dashboard." });
    } catch (error) {
      console.error('Failed to approve teacher:', error);
      toast({
        title: "Error",
        description: "Failed to approve teacher. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (teacherId: string) => {
    try {
      await usersAPI.reject(teacherId);
      await loadTeachers();
      toast({ title: "Teacher Rejected", description: "The teacher has been rejected.", variant: "destructive" });
    } catch (error) {
      console.error('Failed to reject teacher:', error);
      toast({
        title: "Error",
        description: "Failed to reject teacher. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = (teacherId: string) => {
    deleteUser(teacherId);
    
    
    loadTeachers();
    toast({ title: "Teacher Removed", variant: "destructive" });
  };

  const handleAssignSubjects = async () => {
    if (!selectedTeacher) return;
    try {
      await teachersAPI.assignSubjects(selectedTeacher.id, selectedSubjects);
      setIsAssignOpen(false);
      await loadTeachers();
      toast({ title: "Subjects Assigned", description: "Teacher subjects updated successfully" });
    } catch (error) {
      console.error('Failed to assign subjects:', error);
      toast({ title: "Error", description: "Failed to assign subjects", variant: "destructive" });
    }
  };

  const handleSendEmail = () => {
    if (!emailData.subject || !emailData.message) {
      toast({ title: "Validation Error", description: "Subject and message are required", variant: "destructive" });
      return;
    }

    if (emailData.recipients === 'all') {
      
      teachers.forEach(teacher => {
        sendMessage({
          from: 'admin',
          fromName: 'Administrator',
          to: teacher.id,
          subject: emailData.subject,
          content: emailData.message,
          type: 'message'
        });
      });
      toast({ title: "Messages Sent", description: `Message sent to all ${teachers.length} teachers` });
    } else if (selectedTeacher) {
      
      sendMessage({
        from: 'admin',
        fromName: 'Administrator',
        to: selectedTeacher.id,
        subject: emailData.subject,
        content: emailData.message,
        type: 'message'
      });
      toast({ title: "Message Sent", description: `Message sent to ${selectedTeacher.name}` });
    }

    setIsEmailOpen(false);
    setEmailData({ subject: "", message: "", recipients: "single" });
  };

  const openEditDialog = (teacher: TeacherWithDetails) => {
    setSelectedTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone || "",
      password: ""
    });
    setIsEditOpen(true);
  };

  const openAssignDialog = (teacher: TeacherWithDetails) => {
    setSelectedTeacher(teacher);
    setSelectedSubjects(teacher.assignedSubjects || []);
    setIsAssignOpen(true);
  };

  const openViewDialog = (teacher: TeacherWithDetails) => {
    setSelectedTeacher(teacher);
    setIsViewOpen(true);
  };

  const openEmailDialog = (teacher?: TeacherWithDetails) => {
    setSelectedTeacher(teacher || null);
    setEmailData({ ...emailData, recipients: teacher ? 'single' : 'all' });
    setIsEmailOpen(true);
  };

  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.approvalStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = teachers.filter(t => t.approvalStatus === 'pending').length;
  const approvedCount = teachers.filter(t => t.approvalStatus === 'approved').length;

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-secondary/10 text-secondary border-secondary/30"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/30"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      { }
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Teachers Management</h1>
          <p className="text-muted-foreground">Manage and approve teacher accounts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openEmailDialog()} className="gap-2">
            <Mail className="w-4 h-4" /> Email All
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><UserPlus className="w-4 h-4" /> Add Teacher</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Teacher</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter teacher name" />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="teacher@email.com" />
                </div>
                <div className="space-y-2">
                  <Label>Password *</Label>
                  <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Set password" />
                </div>
                <div className="space-y-2">
                  <Label>Phone (Optional)</Label>
                  <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Phone number" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleAddTeacher}>Add Teacher</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      { }
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Teachers</p>
                <p className="text-2xl font-bold">{teachers.length}</p>
              </div>
              <UserCheck className="w-8 h-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-secondary">{approvedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-secondary opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className={pendingCount > 0 ? "border-amber-500/50 bg-amber-500/5" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-600 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      { }
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search teachers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      { }
      {filteredTeachers.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <UserCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-foreground mb-2">No Teachers Found</h3>
          <p className="text-muted-foreground mb-4">Teachers will appear here when they register or you add them.</p>
          <Button onClick={() => setIsAddOpen(true)}><UserPlus className="w-4 h-4 mr-2" /> Add First Teacher</Button>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.map((teacher) => (
                <TableRow key={teacher.id} className={teacher.approvalStatus === 'pending' ? 'bg-amber-500/5' : ''}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary font-semibold">
                        {teacher.avatar || teacher.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{teacher.name}</p>
                        <p className="text-xs text-muted-foreground">{teacher.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {teacher.assignedSubjects?.length || 0} subjects
                    </Badge>
                  </TableCell>
                  <TableCell>{teacher.studentsCount}</TableCell>
                  <TableCell>{getStatusBadge(teacher.approvalStatus)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {teacher.lastLogin ? new Date(teacher.lastLogin).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(teacher.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openViewDialog(teacher)}>
                          <Eye className="w-4 h-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(teacher)}>
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openAssignDialog(teacher)}>
                          <BookOpen className="w-4 h-4 mr-2" /> Assign Subjects
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEmailDialog(teacher)}>
                          <Mail className="w-4 h-4 mr-2" /> Send Email
                        </DropdownMenuItem>
                        {teacher.approvalStatus === 'pending' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleApprove(teacher.id)} className="text-secondary">
                              <CheckCircle className="w-4 h-4 mr-2" /> Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleReject(teacher.id)} className="text-destructive">
                              <XCircle className="w-4 h-4 mr-2" /> Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        {teacher.approvalStatus === 'rejected' && (
                          <DropdownMenuItem onClick={() => handleApprove(teacher.id)} className="text-secondary">
                            <CheckCircle className="w-4 h-4 mr-2" /> Approve
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(teacher.id)} className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      { }
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Teacher Details</DialogTitle>
          </DialogHeader>
          {selectedTeacher && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary text-2xl font-bold">
                  {selectedTeacher.avatar}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedTeacher.name}</h3>
                  <p className="text-muted-foreground">{selectedTeacher.email}</p>
                  {getStatusBadge(selectedTeacher.approvalStatus)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Students</p>
                  <p className="font-semibold">{selectedTeacher.studentsCount}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Classes Created</p>
                  <p className="font-semibold">{selectedTeacher.classesCreated}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Lessons Created</p>
                  <p className="font-semibold">{selectedTeacher.lessonsCreated}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-semibold">{selectedTeacher.phone || '-'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Assigned Subjects</p>
                <div className="flex flex-wrap gap-2">
                  {selectedTeacher.assignedSubjects?.length ? (
                    selectedTeacher.assignedSubjects.map(subjectId => {
                      const subject = subjects.find(s => s.id === subjectId);
                      return subject ? (
                        <Badge key={subjectId} variant="secondary">{subject.icon} {subject.name}</Badge>
                      ) : null;
                    })
                  ) : (
                    <p className="text-muted-foreground text-sm">No subjects assigned</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      { }
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Teacher</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={formData.email} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      { }
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Subjects to {selectedTeacher?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">Select subjects for this teacher:</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {subjects.map(subject => (
                <label key={subject.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSubjects.includes(subject.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSubjects([...selectedSubjects, subject.id]);
                      } else {
                        setSelectedSubjects(selectedSubjects.filter(s => s !== subject.id));
                      }
                    }}
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-xl">{subject.icon}</span>
                  <div>
                    <p className="font-medium">{subject.name}</p>
                    <p className="text-xs text-muted-foreground">{subject.studentCount} students enrolled</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignOpen(false)}>Cancel</Button>
            <Button onClick={handleAssignSubjects}>Assign Subjects</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      { }
      <Dialog open={isEmailOpen} onOpenChange={setIsEmailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {emailData.recipients === 'all' ? 'Email All Teachers' : `Email ${selectedTeacher?.name}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                placeholder="Email subject"
              />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={emailData.message}
                onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                placeholder="Write your message here..."
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailOpen(false)}>Cancel</Button>
            <Button onClick={handleSendEmail}><Send className="w-4 h-4 mr-2" /> Send Email</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

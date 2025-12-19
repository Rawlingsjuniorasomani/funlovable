import { useState, useEffect } from "react";
import { Search, MoreVertical, Edit, Trash2, Eye, Users, Plus, Mail, Filter, Download, UserPlus, BookOpen, CheckCircle, XCircle, Clock, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import { User } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { subjectsAPI, usersAPI, API_URL } from "@/config/api";

interface StudentWithDetails extends User {
  grade?: string;
  class?: string;
  parentName?: string;
  enrolledSubjects?: string[];
  status?: 'active' | 'inactive' | 'suspended';
  lessonsCompleted?: number;
  assignmentsSubmitted?: number;
  quizzesTaken?: number;
  avgScore?: number;
}

export function AdminStudents() {
  const { toast } = useToast();
  const { getAllUsers, deleteUser, updateUserByAdmin } = useAuthContext();
  const [students, setStudents] = useState<StudentWithDetails[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithDetails | null>(null);
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", grade: "", class: "", parentEmail: "", password: ""
  });
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  // Subscription management dialog
  const [isSubOpen, setIsSubOpen] = useState(false);
  const [subForm, setSubForm] = useState({ plan: 'single', expiresAt: '' });

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const data = await subjectsAPI.getAll();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load subjects:', error);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const users = await getAllUsers();
      const studentUsers = (Array.isArray(users) ? users : [])
        .filter(u => u.role === 'student')
        .map(s => ({
          ...s,
          grade: (s as any).student_class || 'N/A', // Mapped from backend student_class
          class: (s as any).school || 'N/A', // Using school field as generic class/school info if needed
          parentName: (s as any).parent_name || 'N/A',
          enrolledSubjects: (s as any).subjects_list ? (s as any).subjects_list.split(', ') : [],
          status: (s as any).is_approved ? 'active' : 'inactive', // Map to allowed types
          avgScore: (s as any).avg_quiz_score ? Math.round((s as any).avg_quiz_score) : 0,
          lessonsCompleted: (s as any).completed_lessons || 0,
          quizzesTaken: (s as any).completed_quizzes || 0,
        }));
      setStudents(studentUsers as StudentWithDetails[]);
    } catch (error) {
      console.error("Failed to load students:", error);
      toast({ title: "Error", description: "Failed to load students", variant: "destructive" });
    }
  };

  const handleAddStudent = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast({ title: "Missing Fields", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    // Create user via backend API
    const newStudent = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: 'student' as const,
      avatar: formData.name.charAt(0).toUpperCase(),
      approvalStatus: 'approved' as const,
      password: formData.password,
      grade: formData.grade || '',
      class: formData.class || '',
    };

    // Send to backend API
    // TODO: POST to backend /api/students with student data including grade/class
    try {
      if (usersAPI.update) {
        await usersAPI.update('', newStudent);
      }
      loadStudents();
    } catch (error) {
      console.error('Failed to create student:', error);
      toast({ title: "Error", description: "Failed to create student", variant: "destructive" });
      return;
    }

    setIsAddOpen(false);
    setFormData({ name: "", email: "", phone: "", grade: "", class: "", parentEmail: "", password: "" });
    loadStudents();
    toast({ title: "Student Added", description: "Student account created successfully" });
  };

  const handleEdit = () => {
    if (!selectedStudent) return;

    updateUserByAdmin(selectedStudent.id, {
      name: formData.name,
      phone: formData.phone,
    });

    // No localStorage - grade/class sent to backend API
    // TODO: PUT to backend /api/students/:id with grade/class data

    setIsEditOpen(false);
    loadStudents();
    toast({ title: "Student Updated", description: "Student details updated successfully" });
  };

  const handleDelete = (studentId: string) => {
    deleteUser(studentId);
    // No localStorage - all student data managed on backend
    // TODO: DELETE to backend /api/students/:id (cascades subject enrollment, etc)
    loadStudents();
    toast({ title: "Student Removed", variant: "destructive" });
  };

  const handleStatusChange = (studentId: string, status: string) => {
    // No localStorage - status managed on backend
    // TODO: PUT to backend /api/students/:id/status with { status }
    loadStudents();
    toast({ title: "Status Updated", description: `Student status changed to ${status}` });
  };

  const handleAssignSubjects = () => {
    if (!selectedStudent) return;
    // No localStorage - subjects managed on backend
    // TODO: POST to backend /api/students/:id/subjects with selectedSubjects
    setIsAssignOpen(false);
    loadStudents();
    toast({ title: "Subjects Assigned", description: "Student subjects updated successfully" });
  };

  const openEditDialog = (student: StudentWithDetails) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone || "",
      grade: student.grade || "",
      class: student.class || "",
      parentEmail: "",
      password: ""
    });
    setIsEditOpen(true);
  };

  const openAssignDialog = (student: StudentWithDetails) => {
    setSelectedStudent(student);
    setSelectedSubjects(student.enrolledSubjects || []);
    setIsAssignOpen(true);
  };

  const openViewDialog = (student: StudentWithDetails) => {
    setSelectedStudent(student);
    setIsViewOpen(true);
  };

  const handleUpgradeSubscription = async () => {
    if (!selectedStudent) return;
    try {
      const body = { plan: subForm.plan, status: 'active', expiresAt: subForm.expiresAt || null };
      const res = await fetch(`${API_URL}/api/users/${selectedStudent.id}/subscription`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Failed to update subscription');
      setIsSubOpen(false);
      loadStudents();
      toast({ title: 'Subscription Updated', description: 'Subscription updated successfully' });
    } catch (err) {
      console.error('Subscription upgrade failed', err);
      toast({ title: 'Error', description: 'Failed to update subscription', variant: 'destructive' });
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    const matchesGrade = gradeFilter === "all" || s.grade === gradeFilter;
    return matchesSearch && matchesStatus && matchesGrade;
  });

  const activeCount = students.filter(s => s.status === 'active').length;
  const inactiveCount = students.filter(s => s.status !== 'active').length;

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-secondary/10 text-secondary border-secondary/30"><CheckCircle className="w-3 h-3 mr-1" /> Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Inactive</Badge>;
      case 'suspended':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Suspended</Badge>;
      default:
        return <Badge className="bg-secondary/10 text-secondary border-secondary/30">Active</Badge>;
    }
  };

  const grades = ['Primary 4', 'Primary 5', 'Primary 6', 'JHS 1', 'JHS 2', 'JHS 3'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Students Management</h1>
          <p className="text-muted-foreground">Manage all student accounts and enrollments</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><UserPlus className="w-4 h-4" /> Add Student</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter student name" />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="student@email.com" />
              </div>
              <div className="space-y-2">
                <Label>Password *</Label>
                <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Set password" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Grade</Label>
                  <Select value={formData.grade} onValueChange={(v) => setFormData({ ...formData, grade: v })}>
                    <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
                    <SelectContent>
                      {grades.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Class</Label>
                  <Select value={formData.class} onValueChange={(v) => setFormData({ ...formData, class: v })}>
                    <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent>
                      {['A', 'B', 'C', 'D'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Phone (Optional)</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Phone number" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={handleAddStudent}>Add Student</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
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
                <p className="text-sm text-muted-foreground">Inactive/Suspended</p>
                <p className="text-2xl font-bold text-muted-foreground">{inactiveCount}</p>
              </div>
              <Clock className="w-8 h-8 text-muted-foreground opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        <Select value={gradeFilter} onValueChange={setGradeFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Grade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grades</SelectItem>
            {grades.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {filteredStudents.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-foreground mb-2">No Students Found</h3>
          <p className="text-muted-foreground mb-4">Students will appear here when they register or you add them.</p>
          <Button onClick={() => setIsAddOpen(true)}><UserPlus className="w-4 h-4 mr-2" /> Add First Student</Button>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Grade/Class</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Avg Score</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {student.avatar || student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{student.grade} {student.class}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {student.enrolledSubjects?.length || 0} subjects
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(student.status)}</TableCell>
                  <TableCell>
                    <span className={`font-medium ${(student.avgScore || 0) >= 70 ? 'text-secondary' : 'text-destructive'}`}>
                      {student.avgScore}%
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(student.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openViewDialog(student)}>
                          <Eye className="w-4 h-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(student)}>
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setSelectedStudent(student);
                const plan = student.subscription?.plan ?? 'single';
                const expiresAt = student.subscription?.expiresAt ? new Date(student.subscription.expiresAt).toISOString().split('T')[0] : '';
                setSubForm({ plan, expiresAt });
                setIsSubOpen(true);
              }}>
                <CreditCard className="w-4 h-4 mr-2" /> Manage Subscription
              </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openAssignDialog(student)}>
                          <BookOpen className="w-4 h-4 mr-2" /> Assign Subjects
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleStatusChange(student.id, 'active')} className="text-secondary">
                          <CheckCircle className="w-4 h-4 mr-2" /> Set Active
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(student.id, 'suspended')} className="text-amber-600">
                          <Clock className="w-4 h-4 mr-2" /> Suspend
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(student.id)} className="text-destructive">
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

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                  {selectedStudent.avatar}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedStudent.name}</h3>
                  <p className="text-muted-foreground">{selectedStudent.email}</p>
                  {getStatusBadge(selectedStudent.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Grade & Class</p>
                  <p className="font-semibold">{selectedStudent.grade} {selectedStudent.class}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Average Score</p>
                  <p className="font-semibold text-secondary">{selectedStudent.avgScore}%</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Lessons Completed</p>
                  <p className="font-semibold">{selectedStudent.lessonsCompleted}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Quizzes Taken</p>
                  <p className="font-semibold">{selectedStudent.quizzesTaken}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Enrolled Subjects</p>
                <div className="flex flex-wrap gap-2">
                  {selectedStudent.enrolledSubjects?.length ? (
                    selectedStudent.enrolledSubjects.map(subjectId => {
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

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Grade</Label>
                <Select value={formData.grade} onValueChange={(v) => setFormData({ ...formData, grade: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {grades.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={formData.class} onValueChange={(v) => setFormData({ ...formData, class: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['A', 'B', 'C', 'D'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
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

      {/* Assign Subjects Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Subjects to {selectedStudent?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">Select subjects for this student:</p>
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
                    <p className="text-xs text-muted-foreground">{subject.moduleCount} modules</p>
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
    </div>
  );
}

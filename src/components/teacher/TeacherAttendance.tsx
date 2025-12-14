import { useState, useEffect } from "react";
import { attendanceAPI, subjectsAPI, usersAPI } from "@/config/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { CalendarIcon, CheckCircle, XCircle, Clock, UserCheck, Save } from "lucide-react";
import { format } from "date-fns";

export function TeacherAttendance() {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [students, setStudents] = useState<any[]>([]);
    const [attendance, setAttendance] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSubjects();
    }, []);

    useEffect(() => {
        if (selectedSubject) {
            loadStudents();
            loadExistingAttendance();
        }
    }, [selectedSubject, selectedDate]);

    const loadSubjects = async () => {
        try {
            const data = await subjectsAPI.getTeacher();
            setSubjects(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error("Failed to load subjects");
        }
    };

    const loadStudents = async () => {
        try {
            setLoading(true);
            // Get all students (in real app, filter by class/subject enrollment)
            const data = await usersAPI.getAll({ role: 'student' });
            setStudents(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error("Failed to load students");
        } finally {
            setLoading(false);
        }
    };

    const loadExistingAttendance = async () => {
        try {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const data = await attendanceAPI.getClassAttendance(selectedSubject, dateStr);

            // Convert to attendance map
            const attendanceMap: Record<string, string> = {};
            data.forEach((record: any) => {
                attendanceMap[record.student_id] = record.status;
            });
            setAttendance(attendanceMap);
        } catch (error) {
            // No existing attendance for this date
            setAttendance({});
        }
    };

    const handleAttendanceChange = (studentId: string, status: string) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const handleSave = async () => {
        if (!selectedSubject) {
            toast.error("Please select a subject");
            return;
        }

        setSaving(true);
        try {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const records = Object.entries(attendance).map(([student_id, status]) => ({
                student_id,
                subject_id: selectedSubject,
                date: dateStr,
                status,
            }));

            if (records.length === 0) {
                toast.error("Please mark attendance for at least one student");
                return;
            }

            await attendanceAPI.bulkMark(records);
            toast.success(`Attendance saved for ${records.length} students`);
        } catch (error: any) {
            toast.error(error.message || "Failed to save attendance");
        } finally {
            setSaving(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; icon: any; label: string }> = {
            present: { variant: "default", icon: CheckCircle, label: "Present" },
            absent: { variant: "destructive", icon: XCircle, label: "Absent" },
            late: { variant: "secondary", icon: Clock, label: "Late" },
            excused: { variant: "outline", icon: UserCheck, label: "Excused" },
        };
        const config = variants[status] || variants.present;
        const Icon = config.icon;
        return (
            <Badge variant={config.variant as any}>
                <Icon className="w-3 h-3 mr-1" />
                {config.label}
            </Badge>
        );
    };

    const getAttendanceCount = () => {
        const counts = {
            present: 0,
            absent: 0,
            late: 0,
            excused: 0,
            unmarked: students.length
        };

        Object.values(attendance).forEach(status => {
            if (status in counts) {
                counts[status as keyof typeof counts]++;
                counts.unmarked--;
            }
        });

        return counts;
    };

    const counts = getAttendanceCount();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-display font-bold">Mark Attendance</h2>
                <p className="text-muted-foreground">Track student attendance for your classes</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Select Subject</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a subject" />
                            </SelectTrigger>
                            <SelectContent>
                                {subjects.map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Select Date</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start">
                                    <CalendarIcon className="w-4 h-4 mr-2" />
                                    {format(selectedDate, 'PPP')}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={selectedDate} onSelect={(date) => date && setSelectedDate(date)} />
                            </PopoverContent>
                        </Popover>
                    </CardContent>
                </Card>
            </div>

            {selectedSubject && (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold text-green-600">{counts.present}</div>
                                <div className="text-xs text-muted-foreground">Present</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold text-red-600">{counts.absent}</div>
                                <div className="text-xs text-muted-foreground">Absent</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold text-yellow-600">{counts.late}</div>
                                <div className="text-xs text-muted-foreground">Late</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold text-blue-600">{counts.excused}</div>
                                <div className="text-xs text-muted-foreground">Excused</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold text-gray-600">{counts.unmarked}</div>
                                <div className="text-xs text-muted-foreground">Unmarked</div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Student List</CardTitle>
                                <Button onClick={handleSave} disabled={saving || Object.keys(attendance).length === 0}>
                                    <Save className="w-4 h-4 mr-2" />
                                    {saving ? "Saving..." : "Save Attendance"}
                                </Button>
                            </div>
                            <CardDescription>Mark attendance for each student</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="text-center py-8 text-muted-foreground">Loading students...</div>
                            ) : students.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">No students found</div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {students.map(student => (
                                            <TableRow key={student.id}>
                                                <TableCell className="font-medium">{student.name}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{student.email}</TableCell>
                                                <TableCell>
                                                    {attendance[student.id] ? getStatusBadge(attendance[student.id]) : (
                                                        <Badge variant="outline">Not Marked</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant={attendance[student.id] === 'present' ? 'default' : 'outline'} onClick={() => handleAttendanceChange(student.id, 'present')}>
                                                            <CheckCircle className="w-4 h-4" />
                                                        </Button>
                                                        <Button size="sm" variant={attendance[student.id] === 'absent' ? 'destructive' : 'outline'} onClick={() => handleAttendanceChange(student.id, 'absent')}>
                                                            <XCircle className="w-4 h-4" />
                                                        </Button>
                                                        <Button size="sm" variant={attendance[student.id] === 'late' ? 'secondary' : 'outline'} onClick={() => handleAttendanceChange(student.id, 'late')}>
                                                            <Clock className="w-4 h-4" />
                                                        </Button>
                                                        <Button size="sm" variant={attendance[student.id] === 'excused' ? 'secondary' : 'outline'} onClick={() => handleAttendanceChange(student.id, 'excused')}>
                                                            <UserCheck className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}

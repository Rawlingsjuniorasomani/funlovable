import { useState, useEffect } from "react";
import { attendanceAPI } from "@/config/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { useAuthContext } from "@/hooks/useAuth";
import { CheckCircle, XCircle, Clock, UserCheck, CalendarDays } from "lucide-react";

export function StudentAttendanceView() {
    const { user } = useAuthContext();
    const [attendance, setAttendance] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [attendanceData, statsData] = await Promise.all([
                attendanceAPI.getStudentAttendance(user!.id),
                attendanceAPI.getStats(user!.id)
            ]);
            setAttendance(Array.isArray(attendanceData) ? attendanceData : []);
            setStats(statsData);
        } catch (error) {
            console.error("Failed to load attendance:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; icon: any; label: string; color: string }> = {
            present: { variant: "default", icon: CheckCircle, label: "Present", color: "text-green-600" },
            absent: { variant: "destructive", icon: XCircle, label: "Absent", color: "text-red-600" },
            late: { variant: "secondary", icon: Clock, label: "Late", color: "text-yellow-600" },
            excused: { variant: "outline", icon: UserCheck, label: "Excused", color: "text-blue-600" },
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

    if (loading) {
        return <div className="text-center py-8">Loading attendance...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-display font-bold">My Attendance</h2>
                <p className="text-muted-foreground">Track your attendance record</p>
            </div>

            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">
                                {stats.attendance_percentage || 0}%
                            </div>
                            <Progress value={stats.attendance_percentage || 0} className="mt-2" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <div>
                                    <div className="text-2xl font-bold">{stats.present_count || 0}</div>
                                    <div className="text-xs text-muted-foreground">Present</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2">
                                <XCircle className="w-5 h-5 text-red-600" />
                                <div>
                                    <div className="text-2xl font-bold">{stats.absent_count || 0}</div>
                                    <div className="text-xs text-muted-foreground">Absent</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-yellow-600" />
                                <div>
                                    <div className="text-2xl font-bold">{stats.late_count || 0}</div>
                                    <div className="text-xs text-muted-foreground">Late</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Attendance History</CardTitle>
                </CardHeader>
                <CardContent>
                    {attendance.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No attendance records yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {attendance.map((record) => (
                                <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <p className="font-medium">{record.subject_name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(record.date).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getStatusBadge(record.status)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, User, Mail, Phone, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { sendTeacherApprovalSMS } from "@/utils/smsService";
import { User as UserType } from "@/hooks/useAuth";

export function TeacherApprovalWorkflow() {
  const { toast } = useToast();
  const { getAllUsers, approveUser, rejectUser } = useAuthContext();
  const { addNotification } = useAdminNotifications();
  const [pendingTeachers, setPendingTeachers] = useState<UserType[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<UserType | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  useEffect(() => {
    loadPendingTeachers();
  }, []);

  const loadPendingTeachers = async () => {
    try {
      const allUsers = await getAllUsers();
      if (Array.isArray(allUsers)) {
        const pending = allUsers.filter(
          (u) => u.role === "teacher" && u.approvalStatus === "pending"
        );
        setPendingTeachers(pending);
      } else {
        console.error("getAllUsers did not return an array:", allUsers);
        setPendingTeachers([]);
      }
    } catch (error) {
      console.error("Failed to load pending teachers:", error);
      setPendingTeachers([]);
    }
  };

  const handleApprove = async (teacher: UserType) => {
    approveUser(teacher.id);
    loadPendingTeachers();

    // Send SMS notification
    if (teacher.phone) {
      await sendTeacherApprovalSMS(teacher.phone, teacher.name, true);
    }

    addNotification({
      type: "teacher_approval",
      title: "Teacher Approved",
      description: `${teacher.name} has been approved as a teacher`,
      relatedId: teacher.id,
    });

    toast({
      title: "Teacher Approved",
      description: `${teacher.name} can now access the teacher dashboard.`,
    });
  };

  const handleReject = async () => {
    if (!selectedTeacher) return;

    rejectUser(selectedTeacher.id);

    // Send SMS notification
    if (selectedTeacher.phone) {
      await sendTeacherApprovalSMS(selectedTeacher.phone, selectedTeacher.name, false);
    }

    toast({
      title: "Teacher Rejected",
      description: `${selectedTeacher.name}'s application has been rejected.`,
      variant: "destructive",
    });

    setShowRejectDialog(false);
    setSelectedTeacher(null);
    setRejectReason("");
    loadPendingTeachers();
  };

  if (pendingTeachers.length === 0) {
    return (
      <Card className="border-border">
        <CardContent className="pt-6 text-center py-12">
          <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
          <h3 className="font-semibold text-foreground mb-2">All Caught Up!</h3>
          <p className="text-muted-foreground">No pending teacher approvals at the moment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Pending Teacher Approvals</h2>
        <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
          {pendingTeachers.length} Pending
        </Badge>
      </div>

      <div className="grid gap-4">
        {pendingTeachers.map((teacher) => (
          <Card key={teacher.id} className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {teacher.avatar || teacher.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{teacher.name}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {teacher.email}
                        </span>
                        {teacher.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {teacher.phone}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        Applied {new Date(teacher.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                        onClick={() => {
                          setSelectedTeacher(teacher);
                          setShowRejectDialog(true);
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                      <Button size="sm" onClick={() => handleApprove(teacher)}>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Teacher Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {selectedTeacher?.name}'s application.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason (optional)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

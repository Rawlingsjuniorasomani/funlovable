import { useState, useEffect } from "react";
import { Plus, Video, Calendar, Clock, Users, Play, Pause, Square, MoreVertical, Edit, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { liveClassesAPI, subjectsAPI } from "@/config/api";
import { VideoConference } from "@/components/video/VideoConference";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface LiveClass {
  id: string;
  title: string;
  subject_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'live' | 'completed';
  attendees?: number; // Not in DB yet
  totalStudents?: number; // Not in DB yet
  teacher_id?: string;
  meeting_url?: string;
}

const statusColors = {
  scheduled: "bg-accent/10 text-accent border-accent/30",
  live: "bg-destructive/10 text-destructive border-destructive/30 animate-pulse",
  completed: "bg-muted text-muted-foreground",
};

export function TeacherLiveClasses() {
  const { toast } = useToast();
  const { user } = useAuthContext();
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeClass, setActiveClass] = useState<LiveClass | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    subjectId: "",
    scheduledAt: "",
    duration: 45,
  });

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const fetchData = async () => {
    try {
      const [subjectsData, classesData] = await Promise.all([
        subjectsAPI.getAll(),
        liveClassesAPI.getAll({ teacher_id: user?.id })
      ]);
      setSubjects(subjectsData);
      setClasses(classesData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.subjectId || !formData.scheduledAt) return;
    try {
      const newClass = await liveClassesAPI.create({
        title: formData.title,
        subject_id: formData.subjectId,
        scheduled_at: formData.scheduledAt,
        duration_minutes: formData.duration,
        meeting_url: `/live/${Date.now()}`
      });
      setClasses(prev => [...prev, newClass as LiveClass]);
      toast({ title: "Class scheduled", description: `${formData.title} has been scheduled.` });
      setIsDialogOpen(false);
      setFormData({ title: "", subjectId: "", scheduledAt: "", duration: 45 });
    } catch (error) {
      toast({ title: "Failed to create", variant: "destructive" });
    }
  };

  const handleStartClass = async (liveClass: LiveClass) => {
    try {
      const updated = await liveClassesAPI.updateStatus(liveClass.id, 'live');
      setClasses(prev => prev.map(c => c.id === liveClass.id ? { ...c, status: "live" as const } : c)); // Optimistic or use response
      setActiveClass({ ...liveClass, status: 'live' });
      toast({ title: "Class started", description: "Your live class has begun!" });
    } catch (err) {
      toast({ title: "Failed to start class", variant: "destructive" });
    }
  };

  const handleEndClass = async (id: string) => {
    try {
      await liveClassesAPI.updateStatus(id, 'completed');
      setClasses(prev => prev.map(c => c.id === id ? { ...c, status: "completed" as const } : c));
      setActiveClass(null);
      toast({ title: "Class ended", description: "Your live class has ended." });
    } catch (err) {
      toast({ title: "Failed to end class", variant: "destructive" });
    }
  };

  const handleLeaveClass = () => {
    if (activeClass) {
      // Just leave local view if actively hosting? Or actually end it?
      // Assuming just leaving the video view.
      setActiveClass(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await liveClassesAPI.delete(id);
      setClasses(prev => prev.filter(c => c.id !== id));
      toast({ title: "Class deleted", variant: "destructive" });
    } catch (err) {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  // If in active class, show video conference
  if (activeClass) {
    const subject = subjects.find(s => s.id === activeClass.subject_id);
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={handleLeaveClass} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Classes
        </Button>
        <VideoConference
          classId={activeClass.id}
          className={`${activeClass.title} - ${subject?.name || ""}`}
          isHost={true}
          userName={user?.name || "Teacher"}
          onLeave={handleLeaveClass}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Live Classes</h2>
          <p className="text-muted-foreground">Schedule and manage live sessions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Schedule Class
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Live Class</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Class title"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Select value={formData.subjectId} onValueChange={(v) => setFormData(prev => ({ ...prev, subjectId: v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.icon} {s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Date & Time</label>
                <Input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Duration (minutes)</label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
              <Button onClick={handleCreate} className="w-full">Schedule Class</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Live Now Banner */}
      {classes.some(c => c.status === "live") && (
        <div className="bg-gradient-to-r from-destructive to-accent rounded-xl p-4 sm:p-6 text-primary-foreground animate-scale-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center animate-pulse shrink-0">
              <Video className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm opacity-80">Currently Live</p>
              <h3 className="text-xl font-bold">{classes.find(c => c.status === "live")?.title}</h3>
            </div>
            <Button
              variant="secondary"
              className="bg-white text-destructive hover:bg-white/90 w-full sm:w-auto"
              onClick={() => {
                const liveClass = classes.find(c => c.status === "live");
                if (liveClass) setActiveClass({ ...liveClass, status: 'live' });
              }}
            >
              <Play className="w-4 h-4 mr-2" />
              Enter Class
            </Button>
          </div>
        </div>
      )}

      {/* Class Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {classes.map((liveClass, index) => {
          const subject = subjects.find(s => s.id === liveClass.subject_id);

          return (
            <div
              key={liveClass.id}
              className="bg-card rounded-xl border border-border p-4 sm:p-5 card-hover animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-tertiary/20 flex items-center justify-center text-2xl">
                  {subject?.icon || "📚"}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn("capitalize text-xs", statusColors[liveClass.status])}>
                    {liveClass.status === "live" && <span className="w-2 h-2 rounded-full bg-destructive mr-1" />}
                    {liveClass.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Edit className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(liveClass.id)} className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <h3 className="font-semibold text-foreground mb-1">{liveClass.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{subject?.name}</p>

              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs">{formatDate(liveClass.scheduled_at)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">{liveClass.duration_minutes} min</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {liveClass.attendees || 0}/{liveClass.totalStudents || 35} students
                </span>
              </div>

              {liveClass.status === "scheduled" && (
                <Button className="w-full" onClick={() => handleStartClass(liveClass)}>
                  <Play className="w-4 h-4 mr-2" />
                  Start Class
                </Button>
              )}
              {liveClass.status === "live" && (
                <Button variant="destructive" className="w-full" onClick={() => handleEndClass(liveClass.id)}>
                  <Square className="w-4 h-4 mr-2" />
                  End Class
                </Button>
              )}
              {liveClass.status === "completed" && (
                <Button variant="outline" className="w-full">
                  <Video className="w-4 h-4 mr-2" />
                  View Recording
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

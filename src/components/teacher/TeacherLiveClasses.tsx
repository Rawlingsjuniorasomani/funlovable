import { useState } from "react";
import { Plus, Video, Calendar, Clock, Users, Play, Pause, Square, MoreVertical, Edit, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { mockLiveClasses, mockSubjects, LiveClass } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
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

const statusColors = {
  scheduled: "bg-accent/10 text-accent border-accent/30",
  live: "bg-destructive/10 text-destructive border-destructive/30 animate-pulse",
  completed: "bg-muted text-muted-foreground",
};

export function TeacherLiveClasses() {
  const { toast } = useToast();
  const { user } = useAuthContext();
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeClass, setActiveClass] = useState<LiveClass | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    subjectId: "",
    scheduledAt: "",
    duration: 45,
  });

  const handleCreate = () => {
    if (!formData.title || !formData.subjectId || !formData.scheduledAt) return;

    const newClass: LiveClass = {
      id: `lc${Date.now()}`,
      title: formData.title,
      subjectId: formData.subjectId,
      scheduledAt: formData.scheduledAt,
      duration: formData.duration,
      status: "scheduled",
      attendees: 0,
      totalStudents: 35,
    };

    setClasses(prev => [...prev, newClass]);
    toast({ title: "Class scheduled", description: `${formData.title} has been scheduled.` });
    setIsDialogOpen(false);
    setFormData({ title: "", subjectId: "", scheduledAt: "", duration: 45 });
  };

  const handleStartClass = (liveClass: LiveClass) => {
    setClasses(prev => prev.map(c => c.id === liveClass.id ? { ...c, status: "live" as const } : c));
    setActiveClass(liveClass);
    toast({ title: "Class started", description: "Your live class has begun!" });
  };

  const handleEndClass = (id: string) => {
    setClasses(prev => prev.map(c => c.id === id ? { ...c, status: "completed" as const } : c));
    setActiveClass(null);
    toast({ title: "Class ended", description: "Your live class has ended." });
  };

  const handleLeaveClass = () => {
    if (activeClass) {
      handleEndClass(activeClass.id);
    }
  };

  const handleDelete = (id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id));
    toast({ title: "Class deleted", variant: "destructive" });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  // If in active class, show video conference
  if (activeClass) {
    const subject = mockSubjects.find(s => s.id === activeClass.subjectId);
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
                    {mockSubjects.map(s => (
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
                if (liveClass) setActiveClass(liveClass);
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
          const subject = mockSubjects.find(s => s.id === liveClass.subjectId);

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
                  <span className="text-xs">{formatDate(liveClass.scheduledAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">{liveClass.duration} min</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {liveClass.attendees}/{liveClass.totalStudents} students
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

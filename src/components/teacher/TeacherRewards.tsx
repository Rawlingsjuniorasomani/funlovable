import { useState, useEffect } from "react";
import { Award, Star, Trophy, Zap, Plus, Gift, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
interface Reward {
  id: string;
  studentId: string;
  studentName: string;
  type: "badge" | "star" | "trophy" | "points";
  name: string;
  reason: string;
  awardedAt: string;
  awardedBy: string;
}
import { usersAPI } from "@/config/api";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
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

const rewardTypes = [
  { type: "badge", icon: Award, label: "Badge", color: "bg-primary/10 text-primary" },
  { type: "star", icon: Star, label: "Star", color: "bg-accent/10 text-accent" },
  { type: "trophy", icon: Trophy, label: "Trophy", color: "bg-secondary/10 text-secondary" },
  { type: "points", icon: Zap, label: "Bonus XP", color: "bg-tertiary/10 text-tertiary" },
];

export function TeacherRewards() {
  const { toast } = useToast();
  const { user } = useAuthContext();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    studentId: "",
    type: "badge" as Reward["type"],
    name: "",
    reason: "",
  });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const data = await usersAPI.getAll({ role: 'student' });
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load students:', error);
    }
  };

  const filteredRewards = rewards.filter(r =>
    r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAward = () => {
    if (!formData.studentId || !formData.name || !formData.reason) return;

    const student = students.find(s => s.id === formData.studentId);
    if (!student) return;

    const newReward: Reward = {
      id: `r${Date.now()}`,
      studentId: formData.studentId,
      studentName: student.name,
      type: formData.type,
      name: formData.name,
      reason: formData.reason,
      awardedAt: new Date().toISOString().split("T")[0],
      awardedBy: user?.name || "Teacher",
    };

    setRewards(prev => [newReward, ...prev]);
    toast({
      title: "Reward given!",
      description: `${student.name} has received a ${formData.type}!`
    });
    setIsDialogOpen(false);
    setFormData({ studentId: "", type: "badge", name: "", reason: "" });
  };

  const rewardTypeConfig = rewardTypes.find(r => r.type === formData.type);

  // Stats
  const stats = rewardTypes.map(rt => ({
    ...rt,
    count: rewards.filter(r => r.type === rt.type).length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Rewards</h2>
          <p className="text-muted-foreground">Recognize and motivate your students</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Gift className="w-4 h-4 mr-2" />
              Give Reward
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Award a Student</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Student</label>
                <Select value={formData.studentId} onValueChange={(v) => setFormData(prev => ({ ...prev, studentId: v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        <span className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                            {s.avatar || s.name?.charAt(0)}
                          </span>
                          {s.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Reward Type</label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {rewardTypes.map(rt => {
                    const Icon = rt.icon;
                    return (
                      <button
                        key={rt.type}
                        onClick={() => setFormData(prev => ({ ...prev, type: rt.type as Reward["type"] }))}
                        className={cn(
                          "p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1",
                          formData.type === rt.type
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <Icon className={cn("w-6 h-6", rt.color.split(" ")[1])} />
                        <span className="text-xs">{rt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={formData.type === "points" ? "e.g., +50 Bonus XP" : "e.g., Math Wizard"}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Reason</label>
                <Textarea
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Why are you giving this reward?"
                  className="mt-1"
                />
              </div>

              <Button onClick={handleAward} className="w-full">
                <Gift className="w-4 h-4 mr-2" />
                Award Student
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.type}
              className="bg-card rounded-xl border border-border p-4 animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={cn("w-10 h-10 rounded-lg mb-3 flex items-center justify-center", stat.color)}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.count}</p>
              <p className="text-sm text-muted-foreground">{stat.label}s Given</p>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search rewards..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Rewards History */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 bg-muted/30 border-b border-border">
          <h3 className="font-semibold text-foreground">Recent Rewards</h3>
        </div>
        <div className="divide-y divide-border">
          {filteredRewards.map((reward, index) => {
            const typeConfig = rewardTypes.find(rt => rt.type === reward.type);
            const Icon = typeConfig?.icon || Award;

            return (
              <div
                key={reward.id}
                className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", typeConfig?.color)}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground">{reward.name}</h4>
                    <span className="text-xs text-muted-foreground">→</span>
                    <span className="font-medium text-primary">{reward.studentName}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{reward.reason}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{reward.awardedAt}</p>
                  <p className="text-xs text-muted-foreground">by {reward.awardedBy}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

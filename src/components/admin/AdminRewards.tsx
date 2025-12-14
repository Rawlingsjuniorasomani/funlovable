import { useState } from "react";
import { Trophy, Star, Award, Medal, Plus, Users, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
// Local types
interface Reward {
  id: string;
  studentName: string;
  name: string;
  type: string;
  reason: string;
  awardedBy: string;
  awardedAt: string;
}

interface Student {
  id: string;
  name: string;
  avatar: string;
  class: string;
  xp: number;
  level: number;
  streak: number;
  avgScore: number;
}

const rewardTypes = [
  { id: "badge", name: "Badge", icon: Award },
  { id: "star", name: "Star", icon: Star },
  { id: "trophy", name: "Trophy", icon: Trophy },
  { id: "points", name: "Bonus Points", icon: Medal },
];

export function AdminRewards() {
  const { toast } = useToast();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newReward, setNewReward] = useState({ name: "", type: "badge", criteria: "", points: "100" });

  const handleCreate = () => {
    toast({ title: "Reward Created", description: `${newReward.name} badge created successfully` });
    setIsCreateOpen(false);
    setNewReward({ name: "", type: "badge", criteria: "", points: "100" });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'badge': return <Award className="w-5 h-5 text-tertiary" />;
      case 'star': return <Star className="w-5 h-5 text-star" />;
      case 'trophy': return <Trophy className="w-5 h-5 text-accent" />;
      default: return <Medal className="w-5 h-5 text-secondary" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Rewards & Leaderboard</h1>
          <p className="text-muted-foreground">Manage badges, achievements, and track leaderboards</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Create Reward</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Reward</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Reward Name *</Label>
                <Input value={newReward.name} onChange={e => setNewReward({ ...newReward, name: e.target.value })} placeholder="e.g., Quiz Master" />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={newReward.type} onValueChange={v => setNewReward({ ...newReward, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {rewardTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Criteria</Label>
                <Input value={newReward.criteria} onChange={e => setNewReward({ ...newReward, criteria: e.target.value })} placeholder="e.g., Complete 50 quizzes" />
              </div>
              <div className="space-y-2">
                <Label>Points Value</Label>
                <Input type="number" value={newReward.points} onChange={e => setNewReward({ ...newReward, points: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Create Reward</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {rewardTypes.map(type => (
          <Card key={type.id}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <type.icon className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{rewards.filter(r => r.type === type.id).length}</p>
                  <p className="text-sm text-muted-foreground">{type.name}s Awarded</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="recent">
        <TabsList>
          <TabsTrigger value="recent">Recent Rewards</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="mt-4">
          <div className="bg-card rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Awarded By</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rewards.map(reward => (
                  <TableRow key={reward.id}>
                    <TableCell className="font-medium">{reward.studentName}</TableCell>
                    <TableCell className="flex items-center gap-2">{getTypeIcon(reward.type)} {reward.name}</TableCell>
                    <TableCell><Badge variant="outline">{reward.type}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{reward.reason}</TableCell>
                    <TableCell>{reward.awardedBy}</TableCell>
                    <TableCell>{reward.awardedAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-4">
          <div className="bg-card rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>XP</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Streak</TableHead>
                  <TableHead>Avg Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {([] as Student[]).map((student, index) => (
                  <TableRow key={student.id} className={index < 3 ? 'bg-accent/5' : ''}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {index === 0 && <Crown className="w-5 h-5 text-accent" />}
                        {index === 1 && <Medal className="w-5 h-5 text-muted-foreground" />}
                        {index === 2 && <Medal className="w-5 h-5 text-quaternary" />}
                        <span className="font-bold">{index + 1}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          {student.avatar}
                        </div>
                        {student.name}
                      </div>
                    </TableCell>
                    <TableCell>{student.class}</TableCell>
                    <TableCell className="font-semibold text-primary">{student.xp.toLocaleString()}</TableCell>
                    <TableCell><Badge variant="secondary">Lv. {student.level}</Badge></TableCell>
                    <TableCell>🔥 {student.streak} days</TableCell>
                    <TableCell className="text-secondary font-medium">{student.avgScore}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

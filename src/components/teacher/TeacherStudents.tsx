import { useState } from "react";
import { Search, Filter, Mail, Trophy, Flame, Star, TrendingUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { mockStudents, Student } from "@/data/mockData";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TeacherStudents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGrade, setFilterGrade] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [students, setStudents] = useState<Student[]>([]);

  const filteredStudents = students
    .filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterGrade === "all" || s.grade === filterGrade)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name": return a.name.localeCompare(b.name);
        case "xp": return b.xp - a.xp;
        case "score": return b.avgScore - a.avgScore;
        default: return 0;
      }
    });

  const grades = [...new Set(students.map(s => s.grade))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Students</h2>
          <p className="text-muted-foreground">{students.length} students enrolled</p>
        </div>
        <Button>
          <Mail className="w-4 h-4 mr-2" />
          Message All
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-card rounded-xl border border-border">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterGrade} onValueChange={setFilterGrade}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grades</SelectItem>
            {grades.map(grade => (
              <SelectItem key={grade} value={grade}>{grade}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="xp">XP</SelectItem>
            <SelectItem value="score">Avg Score</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Student Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((student, index) => (
          <StudentCard key={student.id} student={student} index={index} />
        ))}
      </div>
    </div>
  );
}

function StudentCard({ student, index }: { student: Student; index: number }) {
  return (
    <div
      className="bg-card rounded-xl border border-border p-5 card-hover animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-tertiary flex items-center justify-center text-primary-foreground font-bold text-lg">
          {student.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{student.name}</h3>
          <p className="text-sm text-muted-foreground">{student.class}</p>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-sm">
          <Star className="w-3 h-3" />
          <span className="font-medium">Lvl {student.level}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 rounded-lg bg-muted/50">
          <div className="flex items-center justify-center gap-1 text-accent mb-0.5">
            <Trophy className="w-4 h-4" />
          </div>
          <p className="text-lg font-bold text-foreground">{student.xp.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">XP</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-muted/50">
          <div className="flex items-center justify-center gap-1 text-destructive mb-0.5">
            <Flame className="w-4 h-4" />
          </div>
          <p className="text-lg font-bold text-foreground">{student.streak}</p>
          <p className="text-xs text-muted-foreground">Streak</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-muted/50">
          <div className="flex items-center justify-center gap-1 text-secondary mb-0.5">
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="text-lg font-bold text-foreground">{student.avgScore}%</p>
          <p className="text-xs text-muted-foreground">Avg</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Quizzes: {student.quizzesCompleted}</span>
          <span className="text-muted-foreground">Lessons: {student.lessonsCompleted}</span>
        </div>
        <Progress value={student.avgScore} className="h-2" />
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="flex-1">View Profile</Button>
        <Button size="sm" variant="ghost">
          <Mail className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

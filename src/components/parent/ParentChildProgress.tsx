import { useState } from "react";
import { TrendingUp, TrendingDown, BookOpen, Target, Flame, Trophy, Star, Calendar, Clock, Download } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { mockStudents, Student } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { ProgressExport } from "./ProgressExport";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock children for parent
const mockChildren = mockStudents.slice(0, 2).map((s, i) => ({
  ...s,
  name: i === 0 ? "Kwame Asante" : "Ama Asante",
  relationship: i === 0 ? "Son" : "Daughter",
}));

interface ChildProgressProps {
  selectedChild: string;
  onSelectChild: (id: string) => void;
}

export function ParentChildProgress({ selectedChild, onSelectChild }: ChildProgressProps) {
  const child = mockChildren.find(c => c.id === selectedChild) || mockChildren[0];

  // Mock subject progress
  const subjectProgress = [
    { subject: "Mathematics", icon: "📐", progress: 75, grade: "B+", trend: "up", quizzes: 8, lessons: 15 },
    { subject: "Science", icon: "🔬", progress: 82, grade: "A-", trend: "up", quizzes: 6, lessons: 12 },
    { subject: "English", icon: "📚", progress: 68, grade: "B", trend: "same", quizzes: 7, lessons: 14 },
    { subject: "Social Studies", icon: "🌍", progress: 71, grade: "B", trend: "up", quizzes: 5, lessons: 10 },
    { subject: "ICT", icon: "💻", progress: 88, grade: "A", trend: "up", quizzes: 4, lessons: 8 },
    { subject: "French", icon: "🇫🇷", progress: 55, grade: "C+", trend: "down", quizzes: 3, lessons: 6 },
  ];

  // Mock recent quizzes
  const recentQuizzes = [
    { title: "Fractions Quiz", subject: "Mathematics", score: 9, total: 10, date: "Dec 10" },
    { title: "Human Body", subject: "Science", score: 8, total: 10, date: "Dec 9" },
    { title: "Grammar Test", subject: "English", score: 7, total: 10, date: "Dec 8" },
    { title: "Computer Basics", subject: "ICT", score: 10, total: 10, date: "Dec 7" },
  ];

  return (
    <div className="space-y-6">
      {/* Child Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Progress Tracking</h2>
          <p className="text-muted-foreground">Monitor your child's learning journey</p>
        </div>
        <div className="flex items-center gap-3">
          <ProgressExport 
            childId={child.id}
            childName={child.name}
            childGrade={child.grade}
          />
          <Select value={selectedChild} onValueChange={onSelectChild}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mockChildren.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                      {c.avatar}
                    </span>
                    {c.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Level</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{child.level}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 animate-fade-in" style={{ animationDelay: "0.05s" }}>
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-accent" />
            <span className="text-sm text-muted-foreground">XP</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{child.xp.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-destructive" />
            <span className="text-sm text-muted-foreground">Streak</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{child.streak} days</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-secondary" />
            <span className="text-sm text-muted-foreground">Avg Score</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{child.avgScore}%</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Subject Performance */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Subject Performance
          </h3>
          <div className="space-y-4">
            {subjectProgress.map((subject, index) => (
              <div key={subject.subject} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{subject.icon}</span>
                    <span className="font-medium text-foreground">{subject.subject}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-sm font-bold",
                      subject.grade.startsWith("A") && "bg-secondary/10 text-secondary",
                      subject.grade.startsWith("B") && "bg-primary/10 text-primary",
                      subject.grade.startsWith("C") && "bg-accent/10 text-accent"
                    )}>
                      {subject.grade}
                    </span>
                    {subject.trend === "up" && <TrendingUp className="w-4 h-4 text-secondary" />}
                    {subject.trend === "down" && <TrendingDown className="w-4 h-4 text-destructive" />}
                  </div>
                </div>
                <Progress value={subject.progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{subject.lessons} lessons • {subject.quizzes} quizzes</span>
                  <span>{subject.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Quizzes */}
        <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in" style={{ animationDelay: "0.25s" }}>
          <div className="p-4 bg-muted/30 border-b border-border">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Target className="w-5 h-5 text-tertiary" />
              Recent Quizzes
            </h3>
          </div>
          <div className="divide-y divide-border">
            {recentQuizzes.map((quiz, index) => (
              <div key={index} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-foreground">{quiz.title}</h4>
                  <span className={cn(
                    "font-bold",
                    quiz.score / quiz.total >= 0.8 ? "text-secondary" : 
                    quiz.score / quiz.total >= 0.6 ? "text-primary" : "text-accent"
                  )}>
                    {quiz.score}/{quiz.total}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{quiz.subject}</span>
                  <span>{quiz.date}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-border">
            <Button variant="ghost" size="sm" className="w-full">View All Quizzes</Button>
          </div>
        </div>
      </div>

      {/* Weekly Activity Chart */}
      <div className="bg-card rounded-xl border border-border p-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-tertiary" />
          This Week's Activity
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
            const hours = Math.random() * 3 + 0.5;
            const isToday = i === 2; // Wednesday
            return (
              <div key={day} className="text-center">
                <div 
                  className={cn(
                    "h-24 rounded-lg mb-2 flex items-end justify-center transition-all",
                    isToday ? "bg-primary/20" : "bg-muted"
                  )}
                >
                  <div 
                    className={cn(
                      "w-full rounded-lg transition-all duration-500",
                      isToday ? "bg-primary" : "bg-primary/60"
                    )}
                    style={{ height: `${hours / 3.5 * 100}%` }}
                  />
                </div>
                <span className={cn("text-xs", isToday ? "font-bold text-primary" : "text-muted-foreground")}>
                  {day}
                </span>
                <p className="text-xs text-muted-foreground">{hours.toFixed(1)}h</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

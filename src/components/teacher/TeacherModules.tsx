import { useState } from "react";
import { Plus, Edit, Trash2, GripVertical, BookOpen, Clock, Video, FileText, MoreVertical, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { mockModules, mockLessons, mockSubjects, Module, Lesson } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const lessonTypeIcons = {
  video: Video,
  text: FileText,
  interactive: BookOpen,
};

const lessonTypeColors = {
  video: "bg-destructive/10 text-destructive",
  text: "bg-primary/10 text-primary",
  interactive: "bg-secondary/10 text-secondary",
};

export function TeacherModules() {
  const { toast } = useToast();
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(["m1"]));
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const [moduleForm, setModuleForm] = useState({ title: "", description: "" });
  const [lessonForm, setLessonForm] = useState({ title: "", description: "", type: "video" as Lesson["type"], duration: "" });

  const filteredModules = modules.filter(m => m.subjectId === selectedSubject);
  const currentSubject = mockSubjects.find(s => s.id === selectedSubject);

  const toggleModule = (id: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreateModule = () => {
    if (!moduleForm.title) return;
    const newModule: Module = {
      id: `m${Date.now()}`,
      subjectId: selectedSubject,
      title: moduleForm.title,
      description: moduleForm.description,
      order: filteredModules.length + 1,
      lessonCount: 0,
      duration: "0 hours",
    };
    setModules(prev => [...prev, newModule]);
    toast({ title: "Module created", description: `${moduleForm.title} has been added.` });
    setIsModuleDialogOpen(false);
    setModuleForm({ title: "", description: "" });
  };

  const handleCreateLesson = () => {
    if (!lessonForm.title || !selectedModule) return;
    const moduleLessons = lessons.filter(l => l.moduleId === selectedModule);
    const newLesson: Lesson = {
      id: `l${Date.now()}`,
      moduleId: selectedModule,
      title: lessonForm.title,
      description: lessonForm.description,
      type: lessonForm.type,
      duration: lessonForm.duration || "10 min",
      order: moduleLessons.length + 1,
    };
    setLessons(prev => [...prev, newLesson]);
    setModules(prev => prev.map(m => m.id === selectedModule ? { ...m, lessonCount: m.lessonCount + 1 } : m));
    toast({ title: "Lesson created", description: `${lessonForm.title} has been added.` });
    setIsLessonDialogOpen(false);
    setLessonForm({ title: "", description: "", type: "video", duration: "" });
  };

  const handleDeleteModule = (id: string) => {
    setModules(prev => prev.filter(m => m.id !== id));
    setLessons(prev => prev.filter(l => l.moduleId !== id));
    toast({ title: "Module deleted", variant: "destructive" });
  };

  const handleDeleteLesson = (id: string, moduleId: string) => {
    setLessons(prev => prev.filter(l => l.id !== id));
    setModules(prev => prev.map(m => m.id === moduleId ? { ...m, lessonCount: m.lessonCount - 1 } : m));
    toast({ title: "Lesson deleted", variant: "destructive" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Modules & Lessons</h2>
          <p className="text-muted-foreground">Organize your course content</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mockSubjects.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.icon} {s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Module
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Module</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={moduleForm.title}
                    onChange={(e) => setModuleForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Module title"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    value={moduleForm.description}
                    onChange={(e) => setModuleForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description"
                    className="mt-1"
                  />
                </div>
                <Button onClick={handleCreateModule} className="w-full">Create Module</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Subject Header */}
      <div className="bg-gradient-to-r from-primary/10 to-tertiary/10 rounded-xl p-6 border border-border">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-card flex items-center justify-center text-3xl shadow-sm">
            {currentSubject?.icon}
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">{currentSubject?.name}</h3>
            <p className="text-sm text-muted-foreground">{filteredModules.length} modules • {currentSubject?.studentCount} students</p>
          </div>
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-4">
        {filteredModules.map((module, index) => {
          const moduleLessons = lessons.filter(l => l.moduleId === module.id);
          const isExpanded = expandedModules.has(module.id);

          return (
            <Collapsible
              key={module.id}
              open={isExpanded}
              onOpenChange={() => toggleModule(module.id)}
              className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="p-4 flex items-center gap-4">
                <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {module.order}
                </span>
                <CollapsibleTrigger className="flex-1 flex items-center gap-4 text-left">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{module.title}</h4>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {module.lessonCount} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {module.duration}
                    </span>
                  </div>
                  {isExpanded ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
                </CollapsibleTrigger>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setSelectedModule(module.id); setIsLessonDialogOpen(true); }}>
                      <Plus className="w-4 h-4 mr-2" />Add Lesson
                    </DropdownMenuItem>
                    <DropdownMenuItem><Edit className="w-4 h-4 mr-2" />Edit Module</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteModule(module.id)} className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <CollapsibleContent>
                <div className="border-t border-border bg-muted/20">
                  {moduleLessons.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">
                      <p>No lessons yet</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => { setSelectedModule(module.id); setIsLessonDialogOpen(true); }}
                      >
                        <Plus className="w-4 h-4 mr-2" />Add First Lesson
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {moduleLessons.map((lesson, lessonIndex) => {
                        const TypeIcon = lessonTypeIcons[lesson.type];
                        return (
                          <div key={lesson.id} className="p-4 pl-16 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                            <span className="text-sm text-muted-foreground w-6">{lessonIndex + 1}.</span>
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", lessonTypeColors[lesson.type])}>
                              <TypeIcon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-foreground">{lesson.title}</h5>
                              <p className="text-sm text-muted-foreground">{lesson.description}</p>
                            </div>
                            <Badge variant="outline" className="capitalize">{lesson.type}</Badge>
                            <span className="text-sm text-muted-foreground">{lesson.duration}</span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem><Edit className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteLesson(lesson.id, module.id)} className="text-destructive">
                                  <Trash2 className="w-4 h-4 mr-2" />Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}

        {filteredModules.length === 0 && (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold text-foreground mb-2">No modules yet</h3>
            <p className="text-muted-foreground mb-4">Create your first module to start organizing lessons</p>
            <Button onClick={() => setIsModuleDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />Create Module
            </Button>
          </div>
        )}
      </div>

      {/* Lesson Dialog */}
      <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Lesson</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={lessonForm.title}
                onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Lesson title"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={lessonForm.description}
                onChange={(e) => setLessonForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select value={lessonForm.type} onValueChange={(v) => setLessonForm(prev => ({ ...prev, type: v as Lesson["type"] }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">📹 Video</SelectItem>
                    <SelectItem value="text">📄 Text</SelectItem>
                    <SelectItem value="interactive">🎮 Interactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Duration</label>
                <Input
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g., 15 min"
                  className="mt-1"
                />
              </div>
            </div>
            <Button onClick={handleCreateLesson} className="w-full">Add Lesson</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

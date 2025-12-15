import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, GripVertical, BookOpen, Clock, Video, FileText, MoreVertical, ChevronRight, ChevronDown, ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";
import { IconRenderer } from "@/components/shared/IconRenderer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
interface Module {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  lessonCount: number;
  duration: string;
  order?: number;
}

interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  type: "video" | "text" | "interactive" | "pdf" | "link";
  duration: string;
  completed?: boolean;
  videoUrl?: string; // Optional property
  file?: File; // Optional property for uploads
}
import { subjectsAPI, modulesAPI, lessonsAPI } from "@/config/api";
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
  pdf: FileText,
  link: BookOpen,
};

const lessonTypeColors = {
  video: "bg-destructive/10 text-destructive",
  text: "bg-primary/10 text-primary",
  interactive: "bg-secondary/10 text-secondary",
  pdf: "bg-orange-500/10 text-orange-600",
  link: "bg-blue-500/10 text-blue-600",
};

import { useSearchParams } from "react-router-dom";

export function TeacherModules() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const subjectIdFromUrl = searchParams.get("subject");

  const [modules, setModules] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>(subjectIdFromUrl || "");
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(["m1"]));
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const [moduleForm, setModuleForm] = useState({ title: "", description: "" });
  const [lessonForm, setLessonForm] = useState<{
    title: string;
    description: string;
    type: Lesson["type"];
    duration: string;
    videoUrl?: string;
    file?: File | null;
  }>({ title: "", description: "", type: "video", duration: "" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subjectsData, modulesData, lessonsData] = await Promise.all([
        subjectsAPI.getTeacher(),
        modulesAPI.getAll(),
        lessonsAPI.getAll()
      ]);
      const loadedSubjects = Array.isArray(subjectsData) ? subjectsData : [];
      setSubjects(loadedSubjects);

      // Select first subject if none selected AND no URL param
      if (!selectedSubject && !subjectIdFromUrl && loadedSubjects.length > 0) {
        setSelectedSubject(loadedSubjects[0].id);
      } else if (subjectIdFromUrl) {
        setSelectedSubject(subjectIdFromUrl);
      }

      setModules((Array.isArray(modulesData) ? modulesData : []).map((m: any) => ({
        ...m,
        subjectId: m.subject_id || m.subjectId,
        lessonCount: m.lesson_count || m.lessonCount || 0,
        duration: m.duration_minutes ? `${m.duration_minutes} mins` : (m.duration || "N/A"),
        isPublished: m.is_published !== undefined ? m.is_published : true,
      })));

      setLessons((Array.isArray(lessonsData) ? lessonsData : []).map((l: any) => ({
        ...l,
        moduleId: l.module_id || l.moduleId,
        videoUrl: l.video_url || l.videoUrl,
        duration: l.duration_minutes ? `${l.duration_minutes} mins` : (l.duration || "N/A"),
        // Derive type if not present (simplified logic)
        type: (l.video_url || l.videoUrl) ? 'video' : 'text',
        isPublished: l.is_published !== undefined ? l.is_published : true,
      })));

    } catch (error) {
      console.error('Failed to load data:', error);
      toast({ title: "Error loading data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filteredModules = modules.filter(m => m.subjectId === selectedSubject);
  const currentSubject = subjects.find(s => s.id === selectedSubject);

  const toggleModule = (id: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreateModule = async () => {
    if (!moduleForm.title) return;
    if (!selectedSubject) {
      toast({ title: "Please select a subject first", variant: "destructive" });
      return;
    }
    try {
      await modulesAPI.create({
        title: moduleForm.title,
        description: moduleForm.description,
        subject_id: selectedSubject,
      });
      await loadData();
      toast({ title: "Module created", description: `${moduleForm.title} has been added.` });
      setIsModuleDialogOpen(false);
      setModuleForm({ title: "", description: "" });
    } catch (error) {
      console.error('Failed to create module:', error);
      toast({ title: "Failed to create module", variant: "destructive" });
    }
  };

  const handleCreateLesson = async () => {
    if (!lessonForm.title || !selectedModule) return;
    try {
      await lessonsAPI.create({
        module_id: selectedModule,
        title: lessonForm.title,
        content: lessonForm.type === 'text' ? lessonForm.description : undefined,
        video_url: lessonForm.type === 'video' ? 'https://example.com' : undefined, // Placeholder URL for now
        duration_minutes: parseInt(lessonForm.duration) || 10,
      });
      await loadData();
      toast({ title: "Lesson created", description: `${lessonForm.title} has been added.` });
      setIsLessonDialogOpen(false);
      setLessonForm({ title: "", description: "", type: "video", duration: "" });
    } catch (error) {
      console.error('Failed to create lesson:', error);
      toast({ title: "Failed to create lesson", variant: "destructive" });
    }
  };

  const handleDeleteModule = async (id: string) => {
    try {
      await modulesAPI.delete(id);
      await loadData();
      toast({ title: "Module deleted", variant: "destructive" });
    } catch (error) {
      console.error('Failed to delete module:', error);
      toast({ title: "Failed to delete module", variant: "destructive" });
    }
  };

  const handleDeleteLesson = async (id: string, moduleId: string) => {
    try {
      await lessonsAPI.delete(id);
      await loadData();
      toast({ title: "Lesson deleted", variant: "destructive" });
    } catch (error) {
      console.error('Failed to delete lesson:', error);
      toast({ title: "Failed to delete lesson", variant: "destructive" });
    }
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
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map(s => (
                <SelectItem key={s.id} value={s.id}>
                  <div className="flex items-center gap-2">
                    <IconRenderer iconName={s.icon} className="w-4 h-4" />
                    <span>{s.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedSubject}>
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
            <IconRenderer iconName={currentSubject?.icon || "BookOpen"} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">{currentSubject?.name}</h3>
            <p className="text-sm text-muted-foreground">{filteredModules.length} modules</p>
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
              style={{ animationDelay: `${index * 50} ms` }}
            >
              <div className="p-4 flex items-center gap-4">
                <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {module.order || index + 1}
                </span>
                <CollapsibleTrigger className="flex-1 flex items-center gap-4 text-left">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{module.title}</h4>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Badge variant={module.isPublished ? "default" : "secondary"} className="mr-2">
                      {module.isPublished ? "Published" : "Draft"}
                    </Badge>
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
                    <DropdownMenuItem onClick={() => toast({ title: "Reordered", description: "Module moved up" })}>
                      <ArrowUp className="w-4 h-4 mr-2" /> Move Up
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast({ title: "Reordered", description: "Module moved down" })}>
                      <ArrowDown className="w-4 h-4 mr-2" /> Move Down
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast({ title: "Status Updated", description: module.isPublished ? "Module un-published" : "Module published" })}>
                      {module.isPublished ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                      {module.isPublished ? "Unpublish" : "Publish"}
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
                      {moduleLessons.map((lesson: any, lessonIndex: number) => {
                        const TypeIcon = lessonTypeIcons[lesson.type as keyof typeof lessonTypeIcons] || FileText;
                        return (
                          <div key={lesson.id} className="p-4 pl-16 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                            <span className="text-sm text-muted-foreground w-6">{lessonIndex + 1}.</span>
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", lessonTypeColors[lesson.type as keyof typeof lessonTypeColors] || lessonTypeColors.text)}>
                              <TypeIcon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-foreground">{lesson.title}</h5>
                              <p className="text-sm text-muted-foreground">{lesson.description}</p>
                            </div>
                            <Badge variant="outline" className="capitalize mr-2">{lesson.type}</Badge>
                            <Badge variant={lesson.isPublished ? "default" : "secondary"} className="mr-4 text-xs">
                              {lesson.isPublished ? "Published" : "Draft"}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{lesson.duration}</span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => toast({ title: "Reordered", description: "Lesson moved up" })}>
                                  <ArrowUp className="w-4 h-4 mr-2" /> Move Up
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toast({ title: "Reordered", description: "Lesson moved down" })}>
                                  <ArrowDown className="w-4 h-4 mr-2" /> Move Down
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toast({ title: "Status Updated", description: lesson.isPublished ? "Lesson un-published" : "Lesson published" })}>
                                  {lesson.isPublished ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                                  {lesson.isPublished ? "Unpublish" : "Publish"}
                                </DropdownMenuItem>
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
                <Select value={lessonForm.type} onValueChange={(v) => setLessonForm(prev => ({ ...prev, type: v as any }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">📹 Video</SelectItem>
                    <SelectItem value="text">📄 Text</SelectItem>
                    <SelectItem value="pdf">📎 PDF / File</SelectItem>
                    <SelectItem value="link">🔗 Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Duration (min)</label>
                <Input
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g., 15"
                  className="mt-1"
                />
              </div>
            </div>

            {(lessonForm.type === 'video' || lessonForm.type === 'link') && (
              <div>
                <label className="text-sm font-medium">{lessonForm.type === 'video' ? 'Video URL' : 'Link URL'}</label>
                <Input
                  value={lessonForm.videoUrl}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>
            )}

            {lessonForm.type === 'pdf' && (
              <div>
                <label className="text-sm font-medium">File Attachment</label>
                <Input
                  type="file"
                  onChange={(e) => setLessonForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                  className="mt-1"
                />
              </div>
            )}

            <Button onClick={handleCreateLesson} className="w-full">Add Lesson</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

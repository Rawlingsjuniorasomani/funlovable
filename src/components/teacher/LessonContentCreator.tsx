import { useState, useRef, useEffect } from "react";
import { subjectsAPI } from "@/config/api";
import {
  Plus, Save, Eye, Trash2, Upload, Video, Image, FileText,
  Bold, Italic, Underline, List, ListOrdered, Link, AlignLeft,
  AlignCenter, AlignRight, Heading1, Heading2, Code, Quote, Undo, Redo
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LessonContent {
  id: string;
  type: "text" | "video" | "image" | "quiz" | "exercise";
  content: string;
  metadata?: {
    url?: string;
    duration?: string;
    caption?: string;
  };
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  subject: string;
  module: string;
  duration: string;
  objectives: string[];
  contents: LessonContent[];
  status: "draft" | "published";
  createdAt: string;
}

const toolbarButtons = [
  { icon: Bold, action: "bold", tooltip: "Bold" },
  { icon: Italic, action: "italic", tooltip: "Italic" },
  { icon: Underline, action: "underline", tooltip: "Underline" },
  { divider: true },
  { icon: Heading1, action: "h1", tooltip: "Heading 1" },
  { icon: Heading2, action: "h2", tooltip: "Heading 2" },
  { divider: true },
  { icon: List, action: "ul", tooltip: "Bullet List" },
  { icon: ListOrdered, action: "ol", tooltip: "Numbered List" },
  { divider: true },
  { icon: AlignLeft, action: "left", tooltip: "Align Left" },
  { icon: AlignCenter, action: "center", tooltip: "Align Center" },
  { icon: AlignRight, action: "right", tooltip: "Align Right" },
  { divider: true },
  { icon: Link, action: "link", tooltip: "Insert Link" },
  { icon: Quote, action: "quote", tooltip: "Block Quote" },
  { icon: Code, action: "code", tooltip: "Code Block" },
];

export function LessonContentCreator() {
  const [lesson, setLesson] = useState<Partial<Lesson>>({
    title: "",
    description: "",
    subject: "",
    module: "",
    duration: "",
    objectives: [""],
    contents: [],
    status: "draft",
  });
  const [activeContentIndex, setActiveContentIndex] = useState<number | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const addContent = (type: LessonContent["type"]) => {
    const newContent: LessonContent = {
      id: Date.now().toString(),
      type,
      content: "",
      metadata: {},
    };
    setLesson(prev => ({
      ...prev,
      contents: [...(prev.contents || []), newContent],
    }));
    setActiveContentIndex(lesson.contents?.length || 0);
  };

  const updateContent = (index: number, updates: Partial<LessonContent>) => {
    setLesson(prev => ({
      ...prev,
      contents: prev.contents?.map((c, i) =>
        i === index ? { ...c, ...updates } : c
      ),
    }));
  };

  const removeContent = (index: number) => {
    setLesson(prev => ({
      ...prev,
      contents: prev.contents?.filter((_, i) => i !== index),
    }));
    setActiveContentIndex(null);
  };

  const addObjective = () => {
    setLesson(prev => ({
      ...prev,
      objectives: [...(prev.objectives || []), ""],
    }));
  };

  const updateObjective = (index: number, value: string) => {
    setLesson(prev => ({
      ...prev,
      objectives: prev.objectives?.map((o, i) => i === index ? value : o),
    }));
  };

  const removeObjective = (index: number) => {
    setLesson(prev => ({
      ...prev,
      objectives: prev.objectives?.filter((_, i) => i !== index),
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null || prev >= 100) {
          clearInterval(interval);
          return null;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate file upload and create content
    setTimeout(() => {
      const newContent: LessonContent = {
        id: Date.now().toString(),
        type,
        content: file.name,
        metadata: {
          url: URL.createObjectURL(file),
          caption: "",
          ...(type === "video" && { duration: "0:00" }),
        },
      };
      setLesson(prev => ({
        ...prev,
        contents: [...(prev.contents || []), newContent],
      }));
      toast.success(`${type === "video" ? "Video" : "Image"} uploaded successfully!`);
    }, 2500);
  };

  const handleSave = (publish: boolean = false) => {
    if (!lesson.title || !lesson.subject) {
      toast.error("Please fill in the required fields");
      return;
    }

    setLesson(prev => ({
      ...prev,
      status: publish ? "published" : "draft",
    }));

    toast.success(publish ? "Lesson published successfully!" : "Lesson saved as draft");
  };

  const formatToolbarAction = (action: string) => {
    document.execCommand(action === "h1" ? "formatBlock" : action === "h2" ? "formatBlock" : action, false,
      action === "h1" ? "H1" : action === "h2" ? "H2" : undefined);
  };

  const [subjects, setSubjects] = useState<{ id: string, name: string }[]>([]);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const data = await subjectsAPI.getTeacher();
        if (Array.isArray(data)) {
          setSubjects(data);
        }
      } catch (error) {
        console.error("Failed to load subjects", error);
        toast.error("Failed to load subjects");
      }
    };
    loadSubjects();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Create Lesson</h2>
          <p className="text-muted-foreground">Build engaging lesson content for your students</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>{lesson.title || "Untitled Lesson"}</DialogTitle>
                <DialogDescription>{lesson.description}</DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-6">
                {lesson.objectives && lesson.objectives.filter(o => o).length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Learning Objectives</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {lesson.objectives.filter(o => o).map((obj, i) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {lesson.contents?.map((content, index) => (
                  <div key={content.id} className="border border-border rounded-lg p-4">
                    {content.type === "text" && (
                      <div dangerouslySetInnerHTML={{ __html: content.content }} />
                    )}
                    {content.type === "video" && content.metadata?.url && (
                      <div>
                        <video src={content.metadata.url} controls className="w-full rounded-lg" />
                        {content.metadata.caption && (
                          <p className="text-sm text-muted-foreground mt-2">{content.metadata.caption}</p>
                        )}
                      </div>
                    )}
                    {content.type === "image" && content.metadata?.url && (
                      <div>
                        <img src={content.metadata.url} alt={content.content} className="w-full rounded-lg" />
                        {content.metadata.caption && (
                          <p className="text-sm text-muted-foreground mt-2">{content.metadata.caption}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={() => handleSave(false)} className="gap-2">
            <Save className="w-4 h-4" />
            Save Draft
          </Button>
          <Button onClick={() => handleSave(true)} className="gap-2">
            Publish Lesson
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Lesson Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Lesson Details</h3>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Title *</Label>
                <Input
                  placeholder="Enter lesson title"
                  value={lesson.title}
                  onChange={(e) => setLesson({ ...lesson, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Brief description of the lesson..."
                  value={lesson.description}
                  onChange={(e) => setLesson({ ...lesson, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Subject *</Label>
                  <Select
                    value={lesson.subject}
                    onValueChange={(value) => setLesson({ ...lesson, subject: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Duration</Label>
                  <Input
                    placeholder="e.g., 30 min"
                    value={lesson.duration}
                    onChange={(e) => setLesson({ ...lesson, duration: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Learning Objectives */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Learning Objectives</h3>
              <Button variant="ghost" size="sm" onClick={addObjective}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {lesson.objectives?.map((obj, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder={`Objective ${index + 1}`}
                    value={obj}
                    onChange={(e) => updateObjective(index, e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-destructive"
                    onClick={() => removeObjective(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Add Content */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Add Content</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => addContent("text")}
              >
                <FileText className="w-6 h-6" />
                <span className="text-xs">Text Block</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => videoInputRef.current?.click()}
              >
                <Video className="w-6 h-6" />
                <span className="text-xs">Video</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Image className="w-6 h-6" />
                <span className="text-xs">Image</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => addContent("quiz")}
              >
                <List className="w-6 h-6" />
                <span className="text-xs">Quiz</span>
              </Button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e, "image")}
            />
            <input
              type="file"
              ref={videoInputRef}
              accept="video/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e, "video")}
            />
            {uploadProgress !== null && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Uploading...</p>
                <Progress value={uploadProgress} />
              </div>
            )}
          </div>
        </div>

        {/* Content Editor */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-semibold text-foreground">Lesson Content</h3>
              <p className="text-sm text-muted-foreground">
                {lesson.contents?.length || 0} content blocks
              </p>
            </div>

            {lesson.contents && lesson.contents.length > 0 ? (
              <div className="divide-y divide-border">
                {lesson.contents.map((content, index) => (
                  <div key={content.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {content.type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Block {index + 1}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => removeContent(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {content.type === "text" && (
                      <div>
                        {/* Rich Text Toolbar */}
                        <div className="flex items-center gap-1 p-2 border border-border rounded-t-lg bg-muted/30 flex-wrap">
                          {toolbarButtons.map((btn, i) =>
                            btn.divider ? (
                              <div key={i} className="w-px h-6 bg-border mx-1" />
                            ) : (
                              <Button
                                key={i}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => formatToolbarAction(btn.action!)}
                                title={btn.tooltip}
                              >
                                <btn.icon className="w-4 h-4" />
                              </Button>
                            )
                          )}
                        </div>
                        <div
                          contentEditable
                          className="min-h-[200px] p-4 border border-t-0 border-border rounded-b-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          onBlur={(e) => updateContent(index, { content: e.currentTarget.innerHTML })}
                          dangerouslySetInnerHTML={{ __html: content.content }}
                        />
                      </div>
                    )}

                    {content.type === "video" && (
                      <div className="space-y-3">
                        {content.metadata?.url ? (
                          <video
                            src={content.metadata.url}
                            controls
                            className="w-full rounded-lg"
                          />
                        ) : (
                          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                            <Video className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">No video uploaded</p>
                          </div>
                        )}
                        <Input
                          placeholder="Add caption (optional)"
                          value={content.metadata?.caption || ""}
                          onChange={(e) => updateContent(index, {
                            metadata: { ...content.metadata, caption: e.target.value }
                          })}
                        />
                      </div>
                    )}

                    {content.type === "image" && (
                      <div className="space-y-3">
                        {content.metadata?.url ? (
                          <img
                            src={content.metadata.url}
                            alt={content.content}
                            className="w-full rounded-lg"
                          />
                        ) : (
                          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                            <Image className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">No image uploaded</p>
                          </div>
                        )}
                        <Input
                          placeholder="Add caption (optional)"
                          value={content.metadata?.caption || ""}
                          onChange={(e) => updateContent(index, {
                            metadata: { ...content.metadata, caption: e.target.value }
                          })}
                        />
                      </div>
                    )}

                    {content.type === "quiz" && (
                      <div className="p-4 bg-muted/30 rounded-lg text-center">
                        <p className="text-muted-foreground">
                          Quiz integration coming soon. Link an existing quiz or create a new one.
                        </p>
                        <Button variant="outline" className="mt-3">
                          Link Quiz
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <h4 className="font-medium text-foreground mb-2">No content yet</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Start building your lesson by adding content blocks from the sidebar
                </p>
                <Button variant="outline" onClick={() => addContent("text")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Text Block
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

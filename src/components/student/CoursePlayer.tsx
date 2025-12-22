import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ChevronDown,
    ChevronRight,
    PlayCircle,
    FileText,
    CheckCircle,
    Circle,
    Menu,
    ArrowLeft,
    ArrowRight,
    Download,
    ChevronLeft,
    Lock,
    Check
} from "lucide-react";
import { StudentQuizAttempt } from "./StudentQuizAttempt";
import { StudentAssignmentDetails } from "./StudentAssignmentDetails";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { subjectsAPI, modulesAPI, lessonsAPI, progressAPI } from "@/config/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Lesson {
    id: string;
    title: string;
    content?: string;
    duration_minutes?: number;
    completed?: boolean;
    type?: 'video' | 'text' | 'quiz' | 'assignment';
    attachment_url?: string;
}

interface Module {
    id: string;
    title: string;
    lessons: Lesson[];
}

export function CoursePlayer() {
    const { subjectId } = useParams();
    const navigate = useNavigate();
    const [subject, setSubject] = useState<any>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
    const [sidebarOpen, setSidebarOpen] = useState(false); 

    useEffect(() => {
        if (subjectId) {
            fetchCourseData();
        }
    }, [subjectId]);

    const fetchCourseData = async () => {
        try {
            setLoading(true);
            
            const subjectData = await subjectsAPI.getAll(); 
            
            
            
            
            const allSubjects = await subjectsAPI.getAll();
            const foundSubject = Array.isArray(allSubjects) ? allSubjects.find((s: any) => s.id === subjectId) : null;

            if (foundSubject) {
                setSubject(foundSubject);
            } else {
                
            }

            
            const modulesData = await modulesAPI.getAll(subjectId!);
            const modulesList = Array.isArray(modulesData) ? modulesData : [];

            
            const modulesWithLessons = await Promise.all(
                modulesList.map(async (mod: any) => {
                    const lessonsData = await lessonsAPI.getAll({ moduleId: mod.id });
                    return {
                        ...mod,
                        lessons: Array.isArray(lessonsData) ? lessonsData : []
                    };
                })
            );

            setModules(modulesWithLessons);

            
            const initialExpanded: Record<string, boolean> = {};
            modulesWithLessons.forEach(m => initialExpanded[m.id] = true);
            setExpandedModules(initialExpanded);

            
            if (modulesWithLessons.length > 0 && modulesWithLessons[0].lessons.length > 0) {
                setCurrentLesson(modulesWithLessons[0].lessons[0]);
            }

        } catch (error) {
            console.error("Failed to load course data", error);
            toast.error("Failed to load course content");
        } finally {
            setLoading(false);
        }
    };

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev => ({
            ...prev,
            [moduleId]: !prev[moduleId]
        }));
    };

    const handleLessonSelect = (lesson: Lesson) => {
        setCurrentLesson(lesson);
        setSidebarOpen(false); 
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const markAsComplete = async () => {
        if (!currentLesson) return;
        try {
            await progressAPI.trackLessonView({ lesson_id: currentLesson.id, completed: true });

            
            setModules(prev => prev.map(m => ({
                ...m,
                lessons: m.lessons.map(l => l.id === currentLesson.id ? { ...l, completed: true } : l)
            })));

            toast.success("Lesson completed!");

            
        } catch (error) {
            toast.error("Failed to update progress");
        }
    };

    const calculateProgress = () => {
        let total = 0;
        let completed = 0;
        modules.forEach(m => {
            m.lessons.forEach(l => {
                total++;
                if (l.completed) completed++;
            });
        });
        return total === 0 ? 0 : Math.round((completed / total) * 100);
    };

    const SidebarContent = () => (
        <div className="h-full flex flex-col bg-slate-50 border-r border-border">
            <div className="p-4 border-b bg-white">
                <h2 className="font-display font-bold text-lg line-clamp-2">{subject?.name || "Loading..."}</h2>
                <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Course Progress</span>
                        <span>{calculateProgress()}%</span>
                    </div>
                    <Progress value={calculateProgress()} className="h-2" />
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                    {modules.map((module) => (
                        <div key={module.id} className="space-y-1">
                            <button
                                onClick={() => toggleModule(module.id)}
                                className="w-full flex items-center justify-between p-2 hover:bg-slate-100 rounded-lg text-left font-medium text-sm text-slate-700 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="font-bold flex items-center justify-center w-6 h-6 bg-slate-200 rounded-md text-xs">
                                        {modules.indexOf(module) + 1}
                                    </span>
                                    {module.title}
                                </div>
                                {expandedModules[module.id] ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                            </button>

                            {expandedModules[module.id] && (
                                <div className="ml-2 pl-4 border-l-2 border-slate-100 space-y-1 mt-1">
                                    {module.lessons.map((lesson, idx) => (
                                        <button
                                            key={lesson.id}
                                            onClick={() => handleLessonSelect(lesson)}
                                            className={cn(
                                                "w-full flex items-start gap-3 p-2 rounded-lg text-sm transition-all text-left",
                                                currentLesson?.id === lesson.id
                                                    ? "bg-primary/10 text-primary font-medium"
                                                    : "hover:bg-slate-100 text-slate-600"
                                            )}
                                        >
                                            <div className="mt-0.5">
                                                {lesson.completed ? (
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    lesson.type === 'video' ? <PlayCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p>{lesson.title}</p>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                    {lesson.duration_minutes || 5} min
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading course content...</div>;
    }

    return (
        <div className="flex h-screen bg-background">
            { }
            <div className="hidden md:block w-80 h-full">
                <SidebarContent />
            </div>

            { }
            <div className="md:hidden fixed top-4 right-4 z-50">
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Menu className="w-5 h-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-80">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            </div>

            { }
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="border-b p-4 flex items-center gap-4 bg-white shadow-sm z-10">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/student/dashboard')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>
                    <Separator orientation="vertical" className="h-6" />
                    <h1 className="font-semibold text-lg truncate flex-1">{currentLesson?.title || "Select a lesson"}</h1>
                </div>

                <ScrollArea className="flex-1 bg-white">
                    <div className="max-w-4xl mx-auto p-6 md:p-10">
                        {currentLesson ? (
                            <div className="space-y-8 animate-fade-in">
                                { }
                                {currentLesson.type === 'video' || (currentLesson.attachment_url && currentLesson.attachment_url.endsWith('.mp4')) ? (
                                    <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg relative group">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <PlayCircle className="w-20 h-20 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <div className="absolute bottom-4 left-4 text-white text-sm bg-black/50 px-2 py-1 rounded">
                                            Video Placeholder
                                        </div>
                                    </div>
                                ) : currentLesson.type === 'quiz' ? (
                                    <StudentQuizAttempt quizId={(currentLesson as any).contentId || (currentLesson as any).quizId || currentLesson.id} />
                                ) : currentLesson.type === 'assignment' ? (
                                    <StudentAssignmentDetails assignmentId={(currentLesson as any).contentId || (currentLesson as any).assignmentId || currentLesson.id} onBack={() => { }} />
                                ) : (
                                    <div className="prose prose-lg max-w-none">
                                        <h2 className="text-3xl font-display font-bold text-slate-900 mb-6">{currentLesson.title}</h2>
                                        { }
                                        <div dangerouslySetInnerHTML={{ __html: currentLesson.content || "<p>No content available for this lesson.</p>" }} />
                                    </div>
                                )}

                                { }
                                {currentLesson.attachment_url && !currentLesson.attachment_url.endsWith('.mp4') && (
                                    <div className="bg-slate-50 border rounded-xl p-4 flex items-center justify-between mt-8">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-lg border shadow-sm">
                                                <Download className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">Download Resources</p>
                                                <p className="text-sm text-muted-foreground">Additional materials for this lesson</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={currentLesson.attachment_url} target="_blank" rel="noopener noreferrer">Download</a>
                                        </Button>
                                    </div>
                                )}

                                <Separator />

                                { }
                                <div className="flex justify-between items-center pt-8">
                                    <Button variant="ghost" disabled={false  }>
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Previous
                                    </Button>
                                    <Button size="lg" onClick={markAsComplete} className={cn("btn-bounce", currentLesson.completed ? "bg-green-600 hover:bg-green-700" : "")}>
                                        {currentLesson.completed ? (
                                            <>
                                                Completed
                                                <CheckCircle className="w-4 h-4 ml-2" />
                                            </>
                                        ) : (
                                            <>
                                                Complete & Continue
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                    <PlayCircle className="w-8 h-8 text-slate-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-slate-800">Ready to start?</h3>
                                    <p className="text-muted-foreground">Select a lesson from the sidebar to begin learning.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}

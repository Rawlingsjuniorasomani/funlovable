import { useState, useEffect } from "react";
import { lessonsAPI, subjectsAPI, modulesAPI, progressAPI, quizzesAPI } from "@/config/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Video, Download, CheckCircle, Clock, Lock, PlayCircle, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// Assume StudentQuizAttempt is available or we redirect to quiz page
import { useNavigate } from "react-router-dom";

export function StudentLessonsPage() {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [modules, setModules] = useState<any[]>([]);
    const [lessons, setLessons] = useState<any[]>([]);

    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedModule, setSelectedModule] = useState("");

    // Quiz State
    const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadSubjects();
    }, []);

    useEffect(() => {
        if (selectedSubject) {
            loadModules(selectedSubject);
            setSelectedModule(""); // Reset module selection
            setLessons([]);
        }
    }, [selectedSubject]);

    useEffect(() => {
        if (selectedModule) {
            loadLessons(selectedModule);
        } else {
            setLessons([]);
        }
    }, [selectedModule]);

    const loadSubjects = async () => {
        try {
            const data = await subjectsAPI.getEnrolled();
            setSubjects(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error("Failed to load subjects");
        }
    };

    const loadModules = async (subjectId: string) => {
        try {
            const data = await modulesAPI.getAll(subjectId);
            setModules(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error("Failed to load modules");
        }
    };

    const loadLessons = async (moduleId: string) => {
        try {
            const data = await lessonsAPI.getAll({ moduleId: moduleId });
            setLessons(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error("Failed to load lessons");
        }
    };

    const markComplete = async (lessonId: string) => {
        try {
            await progressAPI.trackLessonView({ lesson_id: lessonId, completed: true });
            toast.success("Lesson marked as complete");
            loadLessons(selectedModule); // Refresh to update locks/status
        } catch (error) {
            toast.error("Failed to mark lesson complete");
        }
    };

    const startQuiz = (quizId: string) => {
        // Option 1: Navigate to full quiz page
        // navigate(`/student/quiz/${quizId}`);
        // Option 2: Open modal if we have a component (Assuming we redirect for now as it's cleaner)
        navigate(`/student/quiz/${quizId}`);
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <div>
                <h2 className="text-2xl font-display font-bold text-foreground">My Lessons</h2>
                <p className="text-muted-foreground">Access your learning materials and track your progress.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 bg-muted/20 p-4 rounded-xl border">
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="w-[250px] bg-background">
                        <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                        {subjects.map(s => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={selectedModule} onValueChange={setSelectedModule} disabled={!selectedSubject}>
                    <SelectTrigger className="w-[250px] bg-background">
                        <SelectValue placeholder="Select Module" />
                    </SelectTrigger>
                    <SelectContent>
                        {modules.map(m => (
                            <SelectItem key={m.id} value={m.id} disabled={m.is_locked}>
                                {m.is_locked && <Lock className="w-3 h-3 mr-2 inline" />}
                                {m.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-6">
                {lessons.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
                        {selectedModule ? "No lessons found in this module." : "Select a subject and module above to view lessons."}
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {lessons.map((lesson, index) => {
                            const isLocked = lesson.is_locked;
                            // A lesson is fully completed if the user marked it complete OR passed the quiz (if exists).
                            // The backend 'is_completed' flag combines these.
                            const completed = lesson.is_completed;
                            const hasQuiz = !!lesson.quiz_id;
                            const quizPassed = lesson.quiz_passed;

                            return (
                                <Card key={lesson.id} className={`overflow-hidden transition-all ${isLocked ? 'opacity-70 grayscale-[0.5]' : 'hover:shadow-md'}`}>
                                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                                    <CardHeader className="bg-muted/30 pb-4 relative">
                                        {isLocked && (
                                            <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                                                <Badge variant="secondary" className="px-3 py-1 flex items-center gap-2">
                                                    <Lock className="w-3 h-3" /> Locked
                                                </Badge>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant="outline" className="bg-background">{lesson.topic || `Lesson ${index + 1}`}</Badge>
                                                    {lesson.duration_minutes > 0 && (
                                                        <div className="flex items-center text-xs text-muted-foreground">
                                                            <Clock className="w-3 h-3 mr-1" />
                                                            {lesson.duration_minutes} min
                                                        </div>
                                                    )}
                                                </div>
                                                <CardTitle className="text-lg">{lesson.title}</CardTitle>
                                            </div>

                                            <div className="flex items-center gap-2 z-20">
                                                {completed ? (
                                                    <Badge className="bg-green-600 hover:bg-green-700 flex gap-1">
                                                        <CheckCircle className="w-3 h-3" /> Completed
                                                    </Badge>
                                                ) : hasQuiz ? (
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        disabled={isLocked}
                                                        onClick={() => startQuiz(lesson.quiz_id)}
                                                    >
                                                        <PlayCircle className="w-4 h-4 mr-2" />
                                                        Take Quiz
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={isLocked}
                                                        onClick={() => markComplete(lesson.id)}
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                        Mark Complete
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-4 space-y-4">
                                        {/* Content Preview (blurred if locked?) - Optional */}
                                        {lesson.content && (
                                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                                <p className="line-clamp-3">{lesson.content}</p>
                                            </div>
                                        )}

                                        {/* Quiz Status Footer */}
                                        {hasQuiz && (
                                            <div className={`mt-4 pt-4 border-t flex items-center justify-between text-sm ${quizPassed ? 'text-green-600' : 'text-muted-foreground'}`}>
                                                <div className="flex items-center gap-2">
                                                    <Trophy className="w-4 h-4" />
                                                    <span>Quiz included</span>
                                                </div>
                                                {quizPassed && <span className="font-semibold">Score: {lesson.quiz_score}%</span>}
                                            </div>
                                        )}

                                        {lesson.attachment_url && (
                                            <div className="flex items-center gap-3 pt-2">
                                                <Button variant="secondary" size="sm" asChild disabled={isLocked}>
                                                    <a href={`${import.meta.env.VITE_API_URL}${lesson.attachment_url}`} target="_blank" rel="noopener noreferrer">
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Download Material
                                                    </a>
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

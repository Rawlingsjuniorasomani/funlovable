import { useState, useEffect } from "react";
import { lessonsAPI, subjectsAPI, modulesAPI, progressAPI } from "@/config/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Video, Download, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export function StudentLessonsPage() {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [modules, setModules] = useState<any[]>([]);
    const [lessons, setLessons] = useState<any[]>([]);

    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedModule, setSelectedModule] = useState("");

    useEffect(() => {
        loadSubjects();
    }, []);

    useEffect(() => {
        if (selectedSubject) {
            loadModules(selectedSubject);
        }
    }, [selectedSubject]);

    useEffect(() => {
        if (selectedModule) {
            loadLessons(selectedModule);
        }
    }, [selectedModule]);

    const loadSubjects = async () => {
        try {
            const data = await subjectsAPI.getAll(); // Student sees their enrolled subjects
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
            // Reload to update status if backend returns it, or optimistically update
        } catch (error) {
            toast.error("Failed to mark lesson complete");
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <div>
                <h2 className="text-2xl font-display font-bold text-foreground">My Lessons</h2>
                <p className="text-muted-foreground">Access your learning materials and track your progress.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="w-[250px]">
                        <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                        {subjects.map(s => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={selectedModule} onValueChange={setSelectedModule} disabled={!selectedSubject}>
                    <SelectTrigger className="w-[250px]">
                        <SelectValue placeholder="Select Module" />
                    </SelectTrigger>
                    <SelectContent>
                        {modules.map(m => (
                            <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Lessons List */}
            <div className="space-y-4">
                {lessons.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        {selectedModule ? "No lessons found in this module." : "Select a subject and module to view lessons."}
                    </div>
                ) : (
                    lessons.map((lesson) => (
                        <Card key={lesson.id} className="overflow-hidden">
                            <CardHeader className="bg-muted/30 pb-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline">{lesson.topic || "General"}</Badge>
                                            {lesson.duration_minutes > 0 && (
                                                <div className="flex items-center text-xs text-muted-foreground">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {lesson.duration_minutes} min
                                                </div>
                                            )}
                                        </div>
                                        <CardTitle className="text-lg">{lesson.title}</CardTitle>
                                    </div>
                                    <Button
                                        variant={lesson.completed ? "ghost" : "outline"}
                                        size="sm"
                                        className={lesson.completed ? "text-green-600" : ""}
                                        onClick={() => markComplete(lesson.id)}
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        {lesson.completed ? "Completed" : "Mark Complete"}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                {lesson.content && (
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                        <p>{lesson.content}</p>
                                    </div>
                                )}

                                {lesson.learning_objectives && lesson.learning_objectives.length > 0 && (
                                    <div className="bg-muted/20 p-3 rounded-md">
                                        <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Learning Objectives</p>
                                        <ul className="list-disc list-inside text-sm space-y-1">
                                            {/* Handle simplified structure or JSON parsing if needed */}
                                            {(typeof lesson.learning_objectives === 'string'
                                                ? JSON.parse(lesson.learning_objectives)
                                                : Array.isArray(lesson.learning_objectives) ? lesson.learning_objectives : []
                                            ).map((obj: string, i: number) => (
                                                <li key={i}>{obj}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {lesson.attachment_url && (
                                    <div className="flex items-center gap-3 pt-2">
                                        <Button variant="secondary" size="sm" asChild>
                                            <a href={`${import.meta.env.VITE_API_URL}${lesson.attachment_url}`} target="_blank" rel="noopener noreferrer">
                                                <Download className="w-4 h-4 mr-2" />
                                                Download Material
                                            </a>
                                        </Button>
                                        {lesson.attachment_type?.startsWith('video') && (
                                            <Badge variant="secondary"><Video className="w-3 h-3 mr-1" /> Video</Badge>
                                        )}
                                        {lesson.attachment_type?.startsWith('application/pdf') && (
                                            <Badge variant="secondary"><FileText className="w-3 h-3 mr-1" /> PDF</Badge>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}

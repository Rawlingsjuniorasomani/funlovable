
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { parentsAPI } from "@/config/api";
import { ArrowLeft, BookOpen, CheckCircle, Lock, PlayCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export function ParentSubjectDetail() {
    const { childId, subjectId } = useParams();
    const { toast } = useToast();
    const [modules, setModules] = useState<any[]>([]);
    const [lessonsMap, setLessonsMap] = useState<Record<string, any[]>>({});
    const [loading, setLoading] = useState(true);
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (childId && subjectId) {
            loadModules();
        }
    }, [childId, subjectId]);

    const loadModules = async () => {
        try {
            const data = await parentsAPI.getChildModules(childId!, subjectId!);
            setModules(data);
            // Auto-expand first module
            if (data.length > 0) {
                handleToggleModule(data[0].id);
            }
        } catch (error) {
            toast({ title: "Failed to load modules", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleModule = async (moduleId: string) => {
        const newExpanded = new Set(expandedModules);
        if (newExpanded.has(moduleId)) {
            newExpanded.delete(moduleId);
        } else {
            newExpanded.add(moduleId);
            if (!lessonsMap[moduleId]) {
                try {
                    const lessons = await parentsAPI.getChildLessons(childId!, moduleId);
                    setLessonsMap(prev => ({ ...prev, [moduleId]: lessons }));
                } catch (error) {
                    toast({ title: "Failed to load lessons", variant: "destructive" });
                }
            }
        }
        setExpandedModules(newExpanded);
    };

    if (loading) return <div className="p-8 text-center">Loading progress...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link to={`/parent/child/${childId}/progress`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-display font-bold">Subject Details</h1>
                    <p className="text-muted-foreground">Viewing progress for subject</p>
                </div>
            </div>

            <div className="space-y-4">
                {modules.map((module, index) => (
                    <Collapsible
                        key={module.id}
                        open={expandedModules.has(module.id)}
                        onOpenChange={() => handleToggleModule(module.id)}
                        className="border rounded-lg bg-card"
                    >
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                                    module.is_completed ? "bg-green-100 text-green-700" :
                                        module.is_locked ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                                )}>
                                    {module.is_completed ? <CheckCircle className="w-5 h-5" /> :
                                        module.is_locked ? <Lock className="w-4 h-4" /> : (index + 1)}
                                </div>
                                <div className="text-left">
                                    <h3 className={cn("font-medium", module.is_locked && "text-muted-foreground")}>
                                        {module.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">{module.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {module.is_locked && <Badge variant="secondary">Locked</Badge>}
                                {module.is_completed && <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>}
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <div className="border-t bg-muted/20 divide-y">
                                {lessonsMap[module.id]?.map((lesson: any, i: number) => (
                                    <div key={lesson.id} className="p-4 pl-14 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {lesson.is_locked ? (
                                                <Lock className="w-4 h-4 text-muted-foreground" />
                                            ) : lesson.is_completed ? (
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <PlayCircle className="w-4 h-4 text-primary" />
                                            )}
                                            <div>
                                                <p className={cn("text-sm font-medium", lesson.is_locked && "text-muted-foreground")}>
                                                    {lesson.title}
                                                </p>
                                                {lesson.quiz_score !== null && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Quiz Score: <span className={cn(
                                                            "font-medium",
                                                            lesson.quiz_passed ? "text-green-600" : "text-destructive"
                                                        )}>{lesson.quiz_score}%</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            {lesson.is_locked && <Badge variant="outline" className="text-xs text-muted-foreground">Locked</Badge>}
                                        </div>
                                    </div>
                                ))}
                                {!lessonsMap[module.id] && (
                                    <div className="p-4 text-center text-sm text-muted-foreground">Loading lessons...</div>
                                )}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                ))}
            </div>
        </div>
    );
}

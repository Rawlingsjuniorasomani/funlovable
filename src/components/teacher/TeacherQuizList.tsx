import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { quizzesAPI, subjectsAPI } from "@/config/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, Trash2, Send, Users, Eye } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export function TeacherQuizList() {
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<string>("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSubjects();
    }, []);

    useEffect(() => {
        loadQuizzes();
    }, [selectedSubject]);

    const loadSubjects = async () => {
        try {
            const data = await subjectsAPI.getTeacher();
            setSubjects(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load subjects:", error);
        }
    };

    const loadQuizzes = async () => {
        try {
            setLoading(true);
            if (selectedSubject === "all") {
                // Load all quizzes using the new endpoint
                const data = await quizzesAPI.getAll();
                setQuizzes(Array.isArray(data) ? data : []);
            } else {
                const data = await quizzesAPI.getBySubject(selectedSubject);
                setQuizzes(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            toast.error("Failed to load quizzes");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this quiz?")) return;

        try {
            await quizzesAPI.delete(id);
            toast.success("Quiz deleted!");
            loadQuizzes();
        } catch (error) {
            toast.error("Failed to delete quiz");
        }
    };

    const handlePublish = async (id: string) => {
        try {
            await quizzesAPI.publish(id);
            toast.success("Quiz published!");
            loadQuizzes();
        } catch (error) {
            toast.error("Failed to publish quiz");
        }
    };

    const getQuizTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            practice: "bg-blue-100 text-blue-800",
            test: "bg-yellow-100 text-yellow-800",
            exam: "bg-red-100 text-red-800",
        };
        return colors[type] || "bg-gray-100 text-gray-800";
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-display font-bold">My Quizzes</h2>
                    <p className="text-muted-foreground">Manage your quizzes and view student attempts</p>
                </div>
                <Button asChild>
                    <Link to="/teacher/quizzes/create">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Quiz
                    </Link>
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="w-[250px]">
                        <SelectValue placeholder="Filter by subject" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        {subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                                {subject.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {loading ? (
                <div className="text-center py-12">Loading quizzes...</div>
            ) : quizzes.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <p className="text-muted-foreground mb-4">No quizzes created yet</p>
                        <Button asChild>
                            <Link to="/teacher/quizzes/create">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Your First Quiz
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {quizzes.map((quiz) => (
                        <Card key={quiz.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge className={getQuizTypeColor(quiz.quiz_type)}>
                                                {quiz.quiz_type?.toUpperCase()}
                                            </Badge>
                                            <Badge variant={quiz.published ? "default" : "secondary"}>
                                                {quiz.published ? "Published" : "Draft"}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-xl">{quiz.title}</CardTitle>
                                        {quiz.description && (
                                            <p className="text-sm text-muted-foreground mt-1">{quiz.description}</p>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Duration</p>
                                        <p className="font-medium">{quiz.duration_minutes} min</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Total Marks</p>
                                        <p className="font-medium">{quiz.total_marks}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Start Date</p>
                                        <p className="font-medium">
                                            {quiz.start_date ? format(new Date(quiz.start_date), "MMM dd, yyyy") : "Not set"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Attempts</p>
                                        <p className="font-medium">{quiz.attempt_count || 0}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                    {!quiz.published ? (
                                        <>
                                            <Button asChild size="sm" variant="outline">
                                                <Link to={`/teacher/quizzes/${quiz.id}/questions`}>
                                                    <Edit2 className="w-4 h-4 mr-2" />
                                                    Edit Questions
                                                </Link>
                                            </Button>
                                            <Button size="sm" onClick={() => handlePublish(quiz.id)}>
                                                <Send className="w-4 h-4 mr-2" />
                                                Publish
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button asChild size="sm" variant="outline">
                                                <Link to={`/teacher/quizzes/${quiz.id}/grading`}>
                                                    <Users className="w-4 h-4 mr-2" />
                                                    Grade Attempts
                                                </Link>
                                            </Button>
                                            <Button asChild size="sm" variant="outline">
                                                <Link to={`/teacher/quizzes/${quiz.id}/results`}>
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View Results
                                                </Link>
                                            </Button>
                                        </>
                                    )}
                                    <Button size="sm" variant="ghost" onClick={() => handleDelete(quiz.id)}>
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

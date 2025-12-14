import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { quizzesAPI } from "@/config/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Award, Play, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export function StudentQuizList() {
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadQuizzes();
    }, []);

    const loadQuizzes = async () => {
        try {
            setLoading(true);
            const data = await quizzesAPI.getAvailable();
            setQuizzes(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error("Failed to load quizzes");
        } finally {
            setLoading(false);
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

    const getStatusBadge = (quiz: any) => {
        if (quiz.attempt_count >= quiz.max_attempts) {
            return <Badge variant="secondary">Completed</Badge>;
        }
        if (quiz.attempt_count > 0) {
            return <Badge variant="outline">In Progress ({quiz.attempt_count}/{quiz.max_attempts})</Badge>;
        }
        return <Badge className="bg-green-600">Available</Badge>;
    };

    if (loading) {
        return <div className="text-center py-12">Loading quizzes...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-display font-bold">Available Quizzes</h2>
                <p className="text-muted-foreground">Take quizzes to test your knowledge</p>
            </div>

            {quizzes.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">No quizzes available at the moment</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quizzes.map((quiz) => (
                        <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge className={getQuizTypeColor(quiz.quiz_type)}>
                                                {quiz.quiz_type?.toUpperCase()}
                                            </Badge>
                                            {getStatusBadge(quiz)}
                                        </div>
                                        <CardTitle className="text-lg">{quiz.title}</CardTitle>
                                        {quiz.description && (
                                            <CardDescription className="mt-1">{quiz.description}</CardDescription>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        <span>{quiz.duration_minutes} minutes</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Award className="w-4 h-4 text-muted-foreground" />
                                        <span>{quiz.total_marks} marks</span>
                                    </div>
                                </div>

                                {quiz.start_date && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="w-4 h-4" />
                                        <span>
                                            {format(new Date(quiz.start_date), "MMM dd, yyyy 'at' hh:mm a")}
                                        </span>
                                    </div>
                                )}

                                {quiz.instructions && (
                                    <div className="p-3 bg-muted/50 rounded-md text-sm">
                                        <p className="font-medium mb-1">Instructions:</p>
                                        <p className="text-muted-foreground line-clamp-2">{quiz.instructions}</p>
                                    </div>
                                )}

                                {quiz.best_score !== null && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                        <span>Best Score: <strong>{quiz.best_score}</strong> / {quiz.total_marks}</span>
                                    </div>
                                )}

                                <div className="flex items-center gap-2">
                                    {quiz.attempt_count < quiz.max_attempts ? (
                                        <Button asChild className="w-full">
                                            <Link to={`/student/quizzes/${quiz.id}/attempt`}>
                                                <Play className="w-4 h-4 mr-2" />
                                                {quiz.attempt_count > 0 ? "Retry Quiz" : "Start Quiz"}
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button variant="outline" asChild className="w-full">
                                            <Link to={`/student/quizzes/results/${quiz.id}`}>
                                                View Results
                                            </Link>
                                        </Button>
                                    )}
                                </div>

                                {quiz.max_attempts > 1 && (
                                    <p className="text-xs text-center text-muted-foreground">
                                        {quiz.max_attempts - quiz.attempt_count} attempt(s) remaining
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

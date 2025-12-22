import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { quizzesAPI } from "@/config/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, TrendingUp, TrendingDown, Users } from "lucide-react";
import { toast } from "sonner";

export function TeacherQuizResults() {
    const { quizId } = useParams();
    const [quiz, setQuiz] = useState<any>(null);
    const [attempts, setAttempts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadResults();
    }, [quizId]);

    const loadResults = async () => {
        try {
            setLoading(true);
            const [quizData, attemptsData] = await Promise.all([
                quizzesAPI.getById(quizId!),
                quizzesAPI.getAttempts(quizId!),
            ]);
            setQuiz(quizData);
            setAttempts(attemptsData);
        } catch (error) {
            toast.error("Failed to load results");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-12">Loading results...</div>;
    }

    const completedAttempts = attempts.filter(a => a.status === "submitted" || a.status === "graded");
    const averageScore = completedAttempts.length > 0
        ? completedAttempts.reduce((sum, a) => sum + (a.auto_graded_score + (a.manual_graded_score || 0)), 0) / completedAttempts.length
        : 0;
    const highestScore = completedAttempts.length > 0
        ? Math.max(...completedAttempts.map(a => a.auto_graded_score + (a.manual_graded_score || 0)))
        : 0;
    const lowestScore = completedAttempts.length > 0
        ? Math.min(...completedAttempts.map(a => a.auto_graded_score + (a.manual_graded_score || 0)))
        : 0;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10">
            <div>
                <h2 className="text-2xl font-display font-bold">{quiz?.title}</h2>
                <p className="text-muted-foreground">Quiz Results & Analytics</p>
            </div>

            { }
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            <div>
                                <div className="text-2xl font-bold">{attempts.length}</div>
                                <div className="text-xs text-muted-foreground">Total Attempts</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-yellow-600" />
                            <div>
                                <div className="text-2xl font-bold">{averageScore.toFixed(1)}</div>
                                <div className="text-xs text-muted-foreground">Average Score</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                            <div>
                                <div className="text-2xl font-bold">{highestScore}</div>
                                <div className="text-xs text-muted-foreground">Highest Score</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <TrendingDown className="w-5 h-5 text-red-600" />
                            <div>
                                <div className="text-2xl font-bold">{lowestScore}</div>
                                <div className="text-xs text-muted-foreground">Lowest Score</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            { }
            <Card>
                <CardHeader>
                    <CardTitle>Student Results</CardTitle>
                </CardHeader>
                <CardContent>
                    {attempts.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No attempts yet
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-3">Student</th>
                                        <th className="text-left p-3">Status</th>
                                        <th className="text-right p-3">Auto Score</th>
                                        <th className="text-right p-3">Manual Score</th>
                                        <th className="text-right p-3">Total</th>
                                        <th className="text-right p-3">Percentage</th>
                                        <th className="text-center p-3">Released</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attempts.map((attempt) => {
                                        const total = attempt.auto_graded_score + (attempt.manual_graded_score || 0);
                                        const percentage = quiz?.total_marks ? ((total / quiz.total_marks) * 100).toFixed(1) : 0;

                                        return (
                                            <tr key={attempt.id} className="border-b hover:bg-muted/50">
                                                <td className="p-3">
                                                    <div>
                                                        <p className="font-medium">{attempt.student_name}</p>
                                                        <p className="text-xs text-muted-foreground">{attempt.student_email}</p>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <Badge variant={attempt.status === "graded" ? "default" : "secondary"}>
                                                        {attempt.status}
                                                    </Badge>
                                                </td>
                                                <td className="text-right p-3">{attempt.auto_graded_score}</td>
                                                <td className="text-right p-3">{attempt.manual_graded_score || 0}</td>
                                                <td className="text-right p-3 font-bold">{total}</td>
                                                <td className="text-right p-3">{percentage}%</td>
                                                <td className="text-center p-3">
                                                    {attempt.is_released ? (
                                                        <Badge variant="outline" className="bg-green-50 text-green-700">Yes</Badge>
                                                    ) : (
                                                        <Badge variant="outline">No</Badge>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

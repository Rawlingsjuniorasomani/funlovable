import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { quizzesAPI } from "@/config/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Clock, Award, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export function StudentQuizResults() {
    const { attemptId } = useParams();
    const navigate = useNavigate();

    const [attempt, setAttempt] = useState<any>(null);
    const [answers, setAnswers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadResults();
    }, [attemptId]);

    const loadResults = async () => {
        try {
            setLoading(true);
            const data = await quizzesAPI.getAttemptResults(attemptId!);
            setAttempt(data.attempt);
            setAnswers(data.answers || []);
        } catch (error) {
            toast.error("Failed to load results");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-12">Loading results...</div>;
    }

    if (!attempt) {
        return <div className="text-center py-12">Results not found</div>;
    }

    const totalScore = attempt.auto_graded_score + (attempt.manual_graded_score || 0);
    const percentage = attempt.allow_review ? ((totalScore / attempt.total_marks) * 100).toFixed(1) : null;
    const timeTaken = Math.floor(attempt.time_taken_seconds / 60);

    const correctAnswers = answers.filter(a => a.is_correct).length;
    const totalAnswered = answers.length;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-10">
            <Button variant="ghost" onClick={() => navigate("/student/quizzes")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Quizzes
            </Button>

            { }
            <Card className="border-2">
                <CardHeader>
                    <CardTitle className="text-2xl">Quiz Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!attempt.is_released ? (
                        <div className="text-center py-8">
                            <Clock className="w-16 h-16 mx-auto mb-4 text-yellow-600" />
                            <h3 className="text-xl font-semibold mb-2">Results Pending</h3>
                            <p className="text-muted-foreground">
                                Your teacher is reviewing your answers. Results will be available soon.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card>
                                    <CardContent className="pt-6 text-center">
                                        <Award className="w-8 h-8 mx-auto mb-2 text-primary" />
                                        <div className="text-3xl font-bold">{totalScore}</div>
                                        <div className="text-sm text-muted-foreground">out of {attempt.total_marks || "N/A"}</div>
                                        {percentage && (
                                            <div className="text-lg font-semibold mt-2 text-primary">{percentage}%</div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="pt-6 text-center">
                                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-600" />
                                        <div className="text-3xl font-bold">{correctAnswers}</div>
                                        <div className="text-sm text-muted-foreground">Correct Answers</div>
                                        <div className="text-sm mt-2">out of {totalAnswered}</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="pt-6 text-center">
                                        <Clock className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                                        <div className="text-3xl font-bold">{timeTaken}</div>
                                        <div className="text-sm text-muted-foreground">Minutes Taken</div>
                                    </CardContent>
                                </Card>
                            </div>

                            {percentage && (
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">Overall Performance</span>
                                        <span className="text-sm font-medium">{percentage}%</span>
                                    </div>
                                    <Progress value={Number(percentage)} className="h-3" />
                                </div>
                            )}

                            {attempt.teacher_feedback && (
                                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <p className="font-semibold mb-2">Teacher's Feedback:</p>
                                    <p className="text-sm">{attempt.teacher_feedback}</p>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            { }
            {attempt.is_released && attempt.allow_review && answers.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Answer Review</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {answers.map((answer, index) => (
                            <div key={answer.id} className="border rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <p className="font-medium">
                                            {index + 1}. {answer.question}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {answer.question_type !== "short_answer" && (
                                            answer.is_correct ? (
                                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-600" />
                                            )
                                        )}
                                        <Badge variant={answer.is_correct ? "default" : "destructive"}>
                                            {answer.marks_awarded} / {answer.marks}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="mt-3 space-y-2 text-sm">
                                    <div className="flex items-start gap-2">
                                        <span className="font-medium min-w-[100px]">Your Answer:</span>
                                        <span className={answer.is_correct ? "text-green-600" : "text-red-600"}>
                                            {answer.answer}
                                        </span>
                                    </div>

                                    {answer.question_type !== "short_answer" && !answer.is_correct && (
                                        <div className="flex items-start gap-2">
                                            <span className="font-medium min-w-[100px]">Correct Answer:</span>
                                            <span className="text-green-600">{answer.correct_answer}</span>
                                        </div>
                                    )}

                                    {answer.teacher_feedback && (
                                        <div className="mt-2 p-2 bg-muted rounded">
                                            <span className="font-medium">Feedback: </span>
                                            <span className="text-muted-foreground">{answer.teacher_feedback}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

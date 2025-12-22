import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { quizzesAPI } from "@/config/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Send, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export function TeacherQuizGrading() {
    const { quizId } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState<any>(null);
    const [attempts, setAttempts] = useState<any[]>([]);
    const [selectedAttempt, setSelectedAttempt] = useState<any>(null);
    const [answers, setAnswers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [grading, setGrading] = useState<Record<string, { marks: number; feedback: string }>>({});

    useEffect(() => {
        loadQuizAndAttempts();
    }, [quizId]);

    const loadQuizAndAttempts = async () => {
        try {
            setLoading(true);
            const [quizData, attemptsData] = await Promise.all([
                quizzesAPI.getById(quizId!),
                quizzesAPI.getAttempts(quizId!),
            ]);
            setQuiz(quizData);
            setAttempts(attemptsData);
        } catch (error) {
            toast.error("Failed to load attempts");
        } finally {
            setLoading(false);
        }
    };

    const loadAttemptDetails = async (attemptId: string) => {
        try {
            const data = await quizzesAPI.getAttemptResults(attemptId);
            setSelectedAttempt(data.attempt);
            setAnswers(data.answers || []);

            
            const initialGrading: Record<string, { marks: number; feedback: string }> = {};
            data.answers.forEach((answer: any) => {
                initialGrading[answer.id] = {
                    marks: answer.marks_awarded || 0,
                    feedback: answer.teacher_feedback || "",
                };
            });
            setGrading(initialGrading);
        } catch (error) {
            toast.error("Failed to load attempt details");
        }
    };

    const handleGradeAnswer = async (answerId: string) => {
        try {
            const { marks, feedback } = grading[answerId];
            await quizzesAPI.gradeAnswer(answerId, marks, feedback);
            toast.success("Answer graded!");

            
            if (selectedAttempt) {
                await loadAttemptDetails(selectedAttempt.id);
            }
        } catch (error) {
            toast.error("Failed to grade answer");
        }
    };

    const handleReleaseResults = async () => {
        if (!selectedAttempt) return;

        try {
            await quizzesAPI.releaseResults(selectedAttempt.id);
            toast.success("Results released to student!");
            await loadQuizAndAttempts();
            setSelectedAttempt(null);
        } catch (error) {
            toast.error("Failed to release results");
        }
    };

    const totalManualScore = answers
        .filter(a => a.question_type === "short_answer")
        .reduce((sum, a) => sum + (grading[a.id]?.marks || 0), 0);

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10">
            <Button variant="ghost" onClick={() => navigate("/teacher/quizzes")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Quizzes
            </Button>

            <div>
                <h2 className="text-2xl font-display font-bold">{quiz?.title}</h2>
                <p className="text-muted-foreground">Grade student submissions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                { }
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-sm">Student Attempts ({attempts.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {attempts.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">No attempts yet</p>
                        ) : (
                            attempts.map((attempt) => (
                                <button
                                    key={attempt.id}
                                    onClick={() => loadAttemptDetails(attempt.id)}
                                    className={`w-full text-left p-3 border rounded-lg hover:bg-accent transition-colors ${selectedAttempt?.id === attempt.id ? "bg-accent border-primary" : ""
                                        }`}
                                >
                                    <p className="font-medium text-sm">{attempt.student_name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant={attempt.status === "graded" ? "default" : "secondary"} className="text-xs">
                                            {attempt.status}
                                        </Badge>
                                        {attempt.is_released && (
                                            <Badge variant="outline" className="text-xs">Released</Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Score: {attempt.auto_graded_score + (attempt.manual_graded_score || 0)}
                                    </p>
                                </button>
                            ))
                        )}
                    </CardContent>
                </Card>

                { }
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-sm">
                            {selectedAttempt ? `Grading: ${selectedAttempt.student_name || "Student"}` : "Select an attempt"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!selectedAttempt ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>Select a student attempt from the list to start grading</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                { }
                                <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Auto-Graded</p>
                                        <p className="text-2xl font-bold">{selectedAttempt.auto_graded_score}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Manual Score</p>
                                        <p className="text-2xl font-bold">{totalManualScore}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total</p>
                                        <p className="text-2xl font-bold text-primary">
                                            {selectedAttempt.auto_graded_score + totalManualScore}
                                        </p>
                                    </div>
                                </div>

                                { }
                                <div className="space-y-4">
                                    {answers.map((answer, index) => (
                                        <div key={answer.id} className="border rounded-lg p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <p className="font-medium">
                                                        {index + 1}. {answer.question}
                                                    </p>
                                                    <Badge variant="outline" className="mt-1">
                                                        {answer.question_type.replace("_", " ")}
                                                    </Badge>
                                                </div>
                                                <Badge variant={answer.is_correct ? "default" : "secondary"}>
                                                    {answer.marks} marks
                                                </Badge>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-start gap-2 text-sm">
                                                    <span className="font-medium min-w-[100px]">Student Answer:</span>
                                                    <span className={answer.is_correct ? "text-green-600" : ""}>
                                                        {answer.answer}
                                                    </span>
                                                </div>

                                                {answer.question_type !== "short_answer" ? (
                                                    <>
                                                        {!answer.is_correct && (
                                                            <div className="flex items-start gap-2 text-sm">
                                                                <span className="font-medium min-w-[100px]">Correct Answer:</span>
                                                                <span className="text-green-600">{answer.correct_answer}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2">
                                                            {answer.is_correct ? (
                                                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                            ) : (
                                                                <XCircle className="w-5 h-5 text-red-600" />
                                                            )}
                                                            <span className="text-sm font-medium">
                                                                Auto-graded: {answer.marks_awarded} / {answer.marks}
                                                            </span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="space-y-3 mt-3 p-3 bg-muted/50 rounded">
                                                        <div className="text-sm">
                                                            <span className="font-medium">Expected Answer: </span>
                                                            <span className="text-muted-foreground">{answer.correct_answer}</span>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="text-sm font-medium">Marks Awarded</label>
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    max={answer.marks}
                                                                    value={grading[answer.id]?.marks || 0}
                                                                    onChange={(e) =>
                                                                        setGrading({
                                                                            ...grading,
                                                                            [answer.id]: {
                                                                                ...grading[answer.id],
                                                                                marks: parseInt(e.target.value) || 0,
                                                                            },
                                                                        })
                                                                    }
                                                                    className="mt-1"
                                                                />
                                                            </div>
                                                            <div className="flex items-end">
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleGradeAnswer(answer.id)}
                                                                    className="w-full"
                                                                >
                                                                    Save Grade
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="text-sm font-medium">Feedback (Optional)</label>
                                                            <Textarea
                                                                value={grading[answer.id]?.feedback || ""}
                                                                onChange={(e) =>
                                                                    setGrading({
                                                                        ...grading,
                                                                        [answer.id]: {
                                                                            ...grading[answer.id],
                                                                            feedback: e.target.value,
                                                                        },
                                                                    })
                                                                }
                                                                placeholder="Provide feedback to the student..."
                                                                rows={2}
                                                                className="mt-1"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                { }
                                {!selectedAttempt.is_released && (
                                    <Button onClick={handleReleaseResults} className="w-full" size="lg">
                                        <Send className="w-4 h-4 mr-2" />
                                        Release Results to Student
                                    </Button>
                                )}

                                {selectedAttempt.is_released && (
                                    <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-600" />
                                        <p className="font-medium text-green-800 dark:text-green-200">Results Released</p>
                                        <p className="text-sm text-green-600 dark:text-green-400">Student can now view their results</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { quizzesAPI } from "@/config/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Clock, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { toast } from "sonner";

export function StudentQuizAttempt() {
    const { quizId } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [attempt, setAttempt] = useState<any>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);

    useEffect(() => {
        startQuiz();
    }, [quizId]);

    // Timer countdown
    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    // Track tab visibility for anti-cheat
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && attempt) {
                console.log("Student left the tab");
                // Could log this event or warn the student
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [attempt]);

    const startQuiz = async () => {
        try {
            setLoading(true);

            // Get quiz details
            const quizData = await quizzesAPI.getById(quizId!);
            setQuiz(quizData);

            // Start attempt
            const attemptData = await quizzesAPI.startAttempt(quizId!);
            setAttempt(attemptData);

            // Get questions (randomized if enabled)
            const questionsData = await quizzesAPI.getQuestions(quizId!, quizData.randomize_questions);
            setQuestions(questionsData);

            // Set timer
            setTimeLeft(quizData.duration_minutes * 60);

            toast.success("Quiz started! Good luck!");
        } catch (error: any) {
            toast.error(error.message || "Failed to start quiz");
            navigate("/student/quizzes");
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = async (questionId: string, answer: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: answer }));

        // Auto-save answer
        try {
            await quizzesAPI.saveAnswer(attempt.id, { question_id: questionId, answer });
        } catch (error) {
            console.error("Failed to save answer:", error);
        }
    };

    const handleAutoSubmit = async () => {
        toast.info("Time's up! Submitting quiz...");
        await submitQuiz();
    };

    const submitQuiz = async () => {
        setSubmitting(true);
        try {
            const timeTaken = (quiz.duration_minutes * 60) - timeLeft;
            await quizzesAPI.submitAttempt(attempt.id, timeTaken);

            toast.success("Quiz submitted successfully!");
            navigate(`/student/quizzes/results/${attempt.id}`);
        } catch (error: any) {
            toast.error(error.message || "Failed to submit quiz");
        } finally {
            setSubmitting(false);
            setShowSubmitDialog(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    const answeredCount = Object.keys(answers).length;

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading quiz...</div>;
    }

    if (!quiz || !attempt || questions.length === 0) {
        return <div className="text-center py-12">Quiz not found</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-10">
            {/* Header with Timer */}
            <Card className="border-2">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>{quiz.title}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                Question {currentQuestionIndex + 1} of {questions.length}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className={`flex items-center gap-2 text-2xl font-bold ${timeLeft < 60 ? "text-red-600" : "text-primary"}`}>
                                <Clock className="w-6 h-6" />
                                {formatTime(timeLeft)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Time Remaining</p>
                        </div>
                    </div>
                    <Progress value={progress} className="mt-3" />
                </CardHeader>
            </Card>

            {/* Question Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">
                            {currentQuestionIndex + 1}. {currentQuestion.question}
                        </CardTitle>
                        <div className="text-sm font-medium text-muted-foreground">
                            {currentQuestion.marks} {currentQuestion.marks === 1 ? "mark" : "marks"}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* MCQ */}
                    {currentQuestion.question_type === "mcq" && (
                        <RadioGroup
                            value={answers[currentQuestion.id] || ""}
                            onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                        >
                            {currentQuestion.options.map((option: string, index: number) => (
                                <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent">
                                    <RadioGroupItem value={option} id={`option-${index}`} />
                                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                                        {option}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    )}

                    {/* True/False */}
                    {currentQuestion.question_type === "true_false" && (
                        <RadioGroup
                            value={answers[currentQuestion.id] || ""}
                            onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                        >
                            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent">
                                <RadioGroupItem value="True" id="true" />
                                <Label htmlFor="true" className="flex-1 cursor-pointer">True</Label>
                            </div>
                            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent">
                                <RadioGroupItem value="False" id="false" />
                                <Label htmlFor="false" className="flex-1 cursor-pointer">False</Label>
                            </div>
                        </RadioGroup>
                    )}

                    {/* Short Answer */}
                    {currentQuestion.question_type === "short_answer" && (
                        <Textarea
                            value={answers[currentQuestion.id] || ""}
                            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                            placeholder="Type your answer here..."
                            rows={6}
                            className="resize-none"
                        />
                    )}
                </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                </Button>

                <div className="text-sm text-muted-foreground">
                    {answeredCount} of {questions.length} answered
                </div>

                {currentQuestionIndex < questions.length - 1 ? (
                    <Button
                        onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    >
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                ) : (
                    <Button
                        onClick={() => setShowSubmitDialog(true)}
                        disabled={submitting}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        <Send className="w-4 h-4 mr-2" />
                        Submit Quiz
                    </Button>
                )}
            </div>

            {/* Submit Confirmation Dialog */}
            <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You have answered {answeredCount} out of {questions.length} questions.
                            {answeredCount < questions.length && (
                                <span className="block mt-2 text-yellow-600 font-medium">
                                    Warning: {questions.length - answeredCount} question(s) unanswered!
                                </span>
                            )}
                            <span className="block mt-2">
                                Once submitted, you cannot change your answers. Are you sure?
                            </span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Review Answers</AlertDialogCancel>
                        <AlertDialogAction onClick={submitQuiz} disabled={submitting}>
                            {submitting ? "Submitting..." : "Yes, Submit"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

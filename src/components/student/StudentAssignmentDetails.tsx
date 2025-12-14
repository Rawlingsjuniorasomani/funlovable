import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ArrowLeft, Clock, Upload, Check, AlertCircle, Download, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { assignmentsAPI } from "@/config/api";
import { toast } from "sonner";

interface Props {
    assignment: any;
    onBack: () => void;
}

// Exporting component for use in StudentAssignments list
export function StudentAssignmentDetails({ assignment, onBack }: Props) {
    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Question Wizard State
    const [questions, setQuestions] = useState<any[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [answerDetails, setAnswerDetails] = useState<Record<string, any>>({});
    const [reviewMistakesOnly, setReviewMistakesOnly] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [wizardStep, setWizardStep] = useState<'intro' | 'questions' | 'review' | 'success'>('intro');
    const [loadingQuestions, setLoadingQuestions] = useState(false);

    const [submissionId, setSubmissionId] = useState<string | null>(null);

    useEffect(() => {
        loadSubmission();
        if (assignment.submission_type === 'questions' || assignment.submission_type === 'mixed') {
            loadQuestions();
        }
    }, [assignment.id]);

    const loadSubmission = async () => {
        try {
            const data = await assignmentsAPI.getMySubmission(assignment.id);
            if (data && data.id) {
                setSubmissionId(data.id);
                setContent(data.content || "");
                if (data.answers && Array.isArray(data.answers)) {
                    const ansMap: Record<string, string> = {};
                    const detailsMap: Record<string, any> = {};
                    data.answers.forEach((ans: any) => {
                        ansMap[ans.question_id] = ans.answer_text;
                        detailsMap[ans.question_id] = ans;
                    });
                    setAnswers(ansMap);
                    setAnswerDetails(detailsMap);
                }

                // If started, resume wizard
                if (data.status === 'submitted' || data.status === 'graded') {
                    // If already submitted, show readonly view (review style)
                    setWizardStep('review');
                }
            }
        } catch (error) {
            // Ignore 404, means not started
        }
    };

    const loadQuestions = async () => {
        try {
            setLoadingQuestions(true);
            const data = await assignmentsAPI.getQuestions(assignment.id);
            setQuestions(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load questions");
        } finally {
            setLoadingQuestions(false);
        }
    };

    // Parse resources if JSON string
    const resources = typeof assignment.resources === 'string'
        ? JSON.parse(assignment.resources)
        : assignment.resources || [];

    const handleStart = async () => {
        // If already submitted, just go to review/read-only
        if (isSubmitted || isGraded) {
            setWizardStep('review');
            return;
        }

        // Create draft submission to get ID
        if (!submissionId) {
            try {
                const res = await assignmentsAPI.submit(assignment.id, {
                    content: "",
                    status: 'draft'
                });
                setSubmissionId(res.id);
            } catch (e) {
                toast.error("Failed to start assignment");
                return;
            }
        }
        setWizardStep('questions');
    };

    const handleSubmit = async (status: 'draft' | 'submitted') => {
        try {
            setSubmitting(true);
            await assignmentsAPI.submit(assignment.id, {
                content: content || "Question Based Submission",
                status,
            });
            toast.success(status === 'draft' ? "Draft saved" : "Assignment submitted successfully");
            if (status === 'submitted') {
                setWizardStep('success');
            }
        } catch (error) {
            toast.error("Failed to submit assignment");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAnswerSave = async (questionId: string, answer: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));

        if (!submissionId) return; // Should not happen if flow is correct

        try {
            await assignmentsAPI.saveAnswer({
                submission_id: submissionId,
                question_id: questionId,
                answer_text: answer
            });
        } catch (e) {
            console.error("Auto-save failed", e);
        }
    };

    const isGraded = assignment.status === 'graded';
    const isSubmitted = assignment.submissions > 0;
    const hasQuestions = assignment.submission_type === 'questions' || assignment.submission_type === 'mixed';

    return (
        <div className="space-y-6 animate-fade-in">
            <Button variant="ghost" onClick={onBack} className="pl-0">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Assignments
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold font-display mb-2">{assignment.title}</h1>
                        <div className="flex flex-wrap gap-4 text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                Due {format(new Date(assignment.due_date), "MMMM d, yyyy 'at' h:mm a")}
                            </span>
                            <Badge variant={isGraded ? "default" : "outline"}>
                                {isGraded ? "Graded" : isSubmitted ? "Submitted" : "Pending"}
                            </Badge>
                        </div>
                    </div>

                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <h3 className="font-semibold text-lg">Instructions</h3>
                            <div className="prose dark:prose-invert max-w-none">
                                <p>{assignment.description || assignment.instructions}</p>
                            </div>

                            {resources.length > 0 && (
                                <>
                                    <Separator />
                                    <div>
                                        <h4 className="font-medium mb-3">Resources</h4>
                                        <div className="grid gap-2">
                                            {resources.map((res: any, i: number) => (
                                                <div key={i} className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border">
                                                    <FileText className="w-5 h-5 text-primary" />
                                                    <span className="flex-1 text-sm truncate">{res.name || `Resource ${i + 1}`}</span>
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <a href={res.url} target="_blank" rel="noopener noreferrer">
                                                            <Download className="w-4 h-4" />
                                                        </a>
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Submission Area */}
                    {/* Submission / Wizard Area */}
                    {!isGraded && !isSubmitted && (
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <h3 className="font-semibold text-lg">Your Work</h3>

                                {hasQuestions && wizardStep === 'intro' && (
                                    <div className="text-center py-8">
                                        <p className="text-muted-foreground mb-4">This assignment contains {questions.length} questions.</p>
                                        <Button onClick={handleStart}>
                                            {submissionId ? "Resume Questions" : "Start Assignment"}
                                        </Button>
                                    </div>
                                )}

                                {hasQuestions && wizardStep === 'questions' && questions.length > 0 && (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center bg-muted p-2 rounded">
                                            <span className="font-medium">Question {currentQuestionIndex + 1} of {questions.length}</span>
                                            <Badge variant="outline">{questions[currentQuestionIndex].marks} Marks</Badge>
                                        </div>

                                        <div className="text-lg font-medium">
                                            {questions[currentQuestionIndex].question_text}
                                        </div>

                                        {questions[currentQuestionIndex].question_type === 'mcq' && (
                                            <div className="space-y-2">
                                                {JSON.parse(questions[currentQuestionIndex].options || "[]").map((opt: string, idx: number) => (
                                                    <div key={idx} className="flex items-center space-x-2 border p-3 rounded hover:bg-muted cursor-pointer"
                                                        onClick={() => handleAnswerSave(questions[currentQuestionIndex].id, opt)}
                                                    >
                                                        <div className={`w-4 h-4 rounded-full border ${answers[questions[currentQuestionIndex].id] === opt ? 'bg-primary border-primary' : 'border-muted-foreground'}`} />
                                                        <span>{opt}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {(questions[currentQuestionIndex].question_type === 'short_answer' || questions[currentQuestionIndex].question_type === 'long_answer') && (
                                            <Textarea
                                                value={answers[questions[currentQuestionIndex].id] || ''}
                                                onChange={e => handleAnswerSave(questions[currentQuestionIndex].id, e.target.value)}
                                                placeholder="Type your answer..."
                                                className="min-h-[150px]"
                                            />
                                        )}

                                        <div className="flex justify-between pt-4">
                                            <Button
                                                variant="outline"
                                                disabled={currentQuestionIndex === 0}
                                                onClick={() => setCurrentQuestionIndex(curr => curr - 1)}
                                            >
                                                Previous
                                            </Button>

                                            {currentQuestionIndex < questions.length - 1 ? (
                                                <Button onClick={() => setCurrentQuestionIndex(curr => curr + 1)}>
                                                    Next Question
                                                </Button>
                                            ) : (
                                                <Button onClick={() => setWizardStep('review')}>
                                                    Review Answers
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {wizardStep === 'review' && hasQuestions && (
                                    <div className="space-y-6 animate-in fade-in">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xl font-bold">Review Your Answers</h3>
                                            <div className="flex items-center gap-4">
                                                {(isSubmitted || isGraded) && (
                                                    <Button
                                                        variant={reviewMistakesOnly ? "default" : "outline"}
                                                        onClick={() => setReviewMistakesOnly(!reviewMistakesOnly)}
                                                        size="sm"
                                                        className="gap-2"
                                                    >
                                                        <AlertCircle className="w-4 h-4" />
                                                        Review Mistakes
                                                    </Button>
                                                )}
                                                {isSubmitted || isGraded ? (
                                                    <Badge variant="secondary">Read Only</Badge>
                                                ) : (
                                                    <Badge variant="outline">Draft - Not Submitted</Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                                            {questions
                                                .filter(q => !reviewMistakesOnly || (answerDetails[q.id]?.is_correct === false))
                                                .map((q, idx) => {
                                                    const detail = answerDetails[q.id];
                                                    const isCorrect = detail?.is_correct;
                                                    const showResult = (isSubmitted || isGraded) && detail;

                                                    return (
                                                        <div key={q.id} className={`border p-4 rounded-lg bg-card transition-colors ${showResult && !isCorrect ? 'border-destructive/30 bg-destructive/5' : ''}`}>
                                                            <div className="flex justify-between mb-2">
                                                                <span className="font-semibold text-sm text-muted-foreground">Question {idx + 1}</span>
                                                                <div className="flex items-center gap-2">
                                                                    {showResult && (
                                                                        <Badge variant={isCorrect ? "default" : "destructive"} className={isCorrect ? "bg-green-600 hover:bg-green-700" : ""}>
                                                                            {isCorrect ? <><Check className="w-3 h-3 mr-1" /> Correct</> : <><AlertCircle className="w-3 h-3 mr-1" /> Wrong</>}
                                                                        </Badge>
                                                                    )}
                                                                    {(!answers[q.id] || answers[q.id].trim() === '') && !isSubmitted && !isGraded ? (
                                                                        <span className="text-destructive text-xs font-medium flex items-center gap-1">
                                                                            <AlertCircle className="w-3 h-3" /> Not Answered
                                                                        </span>
                                                                    ) : !showResult && (
                                                                        <span className="text-green-600 text-xs font-medium flex items-center gap-1">
                                                                            <Check className="w-3 h-3" /> Answered
                                                                        </span>
                                                                    )}
                                                                    {showResult && (
                                                                        <span className="text-xs font-bold ml-2">
                                                                            {detail?.marks_awarded || 0} / {q.marks} marks
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <p className="font-medium mb-3 text-lg">{q.question_text}</p>

                                                            <div className={`p-3 rounded text-sm ${showResult && !isCorrect ? 'bg-background/80 border border-destructive/20' : 'bg-muted/50'}`}>
                                                                <span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider block mb-1">Your Answer:</span>
                                                                <p className={showResult && !isCorrect ? "text-destructive font-medium" : ""}>{answers[q.id] || <span className="italic text-muted-foreground">No answer provided</span>}</p>
                                                            </div>

                                                            {showResult && !isCorrect && detail?.correct_answer && (
                                                                <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded text-sm">
                                                                    <span className="font-semibold text-green-700 text-xs uppercase tracking-wider block mb-1">Correct Answer:</span>
                                                                    <p className="text-green-800 font-medium">{detail.correct_answer}</p>
                                                                    {detail.explanation && (
                                                                        <div className="mt-2 pt-2 border-t border-green-500/20 text-green-700">
                                                                            <span className="font-semibold text-xs uppercase mr-1">Explanation:</span>
                                                                            {detail.explanation}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {!isSubmitted && !isGraded && (
                                                                <Button variant="link" size="sm" className="px-0 mt-2 h-auto" onClick={() => {
                                                                    setCurrentQuestionIndex(idx);
                                                                    setWizardStep('questions');
                                                                }}>
                                                                    Edit Answer
                                                                </Button>
                                                            )}
                                                        </div>
                                                    )
                                                })}

                                            {questions.length > 0 && reviewMistakesOnly && questions.filter(q => answerDetails[q.id]?.is_correct === false).length === 0 && (
                                                <div className="text-center py-8 text-muted-foreground">
                                                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                                                    <p>Great job! No mistakes found to review.</p>
                                                </div>
                                            )}
                                        </div>

                                        {!isSubmitted && !isGraded && assignment.submission_type === 'questions' && (
                                            <div className="sticky bottom-0 bg-background pt-4 border-t flex justify-end gap-3">
                                                <Button variant="outline" onClick={() => setWizardStep('questions')}>
                                                    Back to Questions
                                                </Button>
                                                <Button onClick={() => handleSubmit('submitted')} disabled={submitting} size="lg" className="px-8">
                                                    {submitting ? "Submitting..." : "Submit Assignment"}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {wizardStep === 'success' && (
                                    <div className="text-center py-12 space-y-6 animate-in zoom-in-50 duration-500">
                                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle className="w-10 h-10" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold mb-2">Assignment Submitted!</h2>
                                            <p className="text-muted-foreground">Great job! Your assignment has been sent to your teacher.</p>
                                        </div>
                                        <Button onClick={onBack} size="lg" className="mt-8">
                                            Back to Assignments
                                        </Button>
                                    </div>
                                )}

                                {(wizardStep === 'review' || (!hasQuestions && wizardStep !== 'success')) && (
                                    // Fallback for non-question assignments (file upload etc) - though we might want to unify this into 'review' too?
                                    // For now keeping 'completed' logic for non-question types if any.
                                    // Actually, mixed types use wizard. 
                                    // Let's just redirect 'completed' to 'review' logic for simplicity or keep generic submission form.
                                    <div className="space-y-4 animate-in fade-in">
                                        {/* Existing logic for generic content submission if needed */}
                                        {assignment.submission_type !== 'questions' && (
                                            <>
                                                <Textarea
                                                    placeholder="Additional notes or answer..."
                                                    className="min-h-[100px]"
                                                    value={content}
                                                    onChange={(e) => setContent(e.target.value)}
                                                />
                                                <div className="flex justify-end gap-3 pt-2">
                                                    <Button variant="outline" onClick={() => handleSubmit('draft')} disabled={submitting}>
                                                        Save Draft
                                                    </Button>
                                                    <Button onClick={() => handleSubmit('submitted')} disabled={submitting}>
                                                        {submitting ? "Submitting..." : "Turn In Assignment"}
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Feedback Display */}
                    {isGraded && (
                        <Card className="border-green-500/50 bg-green-500/5">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                    <h3 className="font-semibold text-green-700 text-lg">Teacher Feedback</h3>
                                </div>
                                <div className="bg-background rounded-lg p-4 border border-border">
                                    <p className="text-foreground">{assignment.feedback || "Great job!"}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="font-semibold mb-4">Grading</h3>
                            <div className="text-center p-6 bg-muted rounded-xl">
                                <div className="text-4xl font-bold text-primary mb-1">
                                    {assignment.score || "-"}<span className="text-xl text-muted-foreground">/{assignment.max_score}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">Total Score</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

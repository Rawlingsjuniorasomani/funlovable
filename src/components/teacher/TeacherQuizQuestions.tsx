import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { quizzesAPI } from "@/config/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Trash2, Edit2, Save, X, Eye, Send } from "lucide-react";
import { toast } from "sonner";

export function TeacherQuizQuestions() {
    const { quizId } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);

    const [formData, setFormData] = useState({
        question_type: "mcq",
        question: "",
        options: ["", "", "", ""],
        correct_answer: "",
        marks: 1,
    });

    useEffect(() => {
        loadQuizAndQuestions();
    }, [quizId]);

    const loadQuizAndQuestions = async () => {
        try {
            setLoading(true);
            const [quizData, questionsData] = await Promise.all([
                quizzesAPI.getById(quizId!),
                quizzesAPI.getQuestions(quizId!, false),
            ]);
            setQuiz(quizData);
            setQuestions(questionsData);
        } catch (error) {
            toast.error("Failed to load quiz");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            question_type: "mcq",
            question: "",
            options: ["", "", "", ""],
            correct_answer: "",
            marks: 1,
        });
        setEditingId(null);
        setShowAddForm(false);
    };

    const handleAddQuestion = async () => {
        if (!formData.question.trim()) {
            toast.error("Please enter a question");
            return;
        }

        if (formData.question_type === "mcq" && formData.options.some(opt => !opt.trim())) {
            toast.error("Please fill in all options");
            return;
        }

        if (!formData.correct_answer.trim()) {
            toast.error("Please specify the correct answer");
            return;
        }

        try {
            const questionData = {
                ...formData,
                order_index: questions.length,
            };

            if (editingId) {
                await quizzesAPI.updateQuestion(editingId, questionData);
                toast.success("Question updated!");
            } else {
                await quizzesAPI.addQuestion(quizId!, questionData);
                toast.success("Question added!");
            }

            await loadQuizAndQuestions();
            resetForm();
        } catch (error: any) {
            toast.error(error.message || "Failed to save question");
        }
    };

    const handleEditQuestion = (question: any) => {
        setFormData({
            question_type: question.question_type,
            question: question.question,
            options: question.options || ["", "", "", ""],
            correct_answer: question.correct_answer,
            marks: question.marks,
        });
        setEditingId(question.id);
        setShowAddForm(true);
    };

    const handleDeleteQuestion = async () => {
        if (!deleteId) return;

        try {
            await quizzesAPI.deleteQuestion(deleteId);
            toast.success("Question deleted!");
            await loadQuizAndQuestions();
            setShowDeleteDialog(false);
            setDeleteId(null);
        } catch (error) {
            toast.error("Failed to delete question");
        }
    };

    const handlePublish = async () => {
        if (questions.length === 0) {
            toast.error("Add at least one question before publishing");
            return;
        }

        try {
            await quizzesAPI.publish(quizId!);
            toast.success("Quiz published successfully!");
            navigate("/teacher/quizzes");
        } catch (error) {
            toast.error("Failed to publish quiz");
        }
    };

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-display font-bold">{quiz?.title}</h2>
                    <p className="text-muted-foreground">Add and manage quiz questions</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => navigate("/teacher/quizzes")}>
                        Cancel
                    </Button>
                    <Button onClick={handlePublish} disabled={questions.length === 0}>
                        <Send className="w-4 h-4 mr-2" />
                        Publish Quiz
                    </Button>
                </div>
            </div>

            { }
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Questions ({questions.length})</CardTitle>
                        <Button onClick={() => setShowAddForm(true)} disabled={showAddForm}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Question
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {questions.length === 0 && !showAddForm && (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No questions added yet. Click "Add Question" to get started.</p>
                        </div>
                    )}

                    {questions.map((q, index) => (
                        <div key={q.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-semibold">Q{index + 1}.</span>
                                        <span className="text-sm px-2 py-1 bg-muted rounded">{q.question_type.replace("_", " ").toUpperCase()}</span>
                                        <span className="text-sm text-muted-foreground">{q.marks} marks</span>
                                    </div>
                                    <p className="font-medium mb-2">{q.question}</p>

                                    {q.question_type === "mcq" && (
                                        <div className="space-y-1 text-sm">
                                            {q.options.map((opt: string, i: number) => (
                                                <div key={i} className={`pl-4 ${opt === q.correct_answer ? "text-green-600 font-medium" : ""}`}>
                                                    {String.fromCharCode(65 + i)}. {opt}
                                                    {opt === q.correct_answer && " ✓"}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {q.question_type === "true_false" && (
                                        <p className="text-sm text-green-600 font-medium">Correct: {q.correct_answer}</p>
                                    )}

                                    {q.question_type === "short_answer" && (
                                        <p className="text-sm text-muted-foreground italic">Answer: {q.correct_answer}</p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => handleEditQuestion(q)}>
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => { setDeleteId(q.id); setShowDeleteDialog(true); }}>
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            { }
            {showAddForm && (
                <Card className="border-2 border-primary">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>{editingId ? "Edit Question" : "Add New Question"}</CardTitle>
                            <Button variant="ghost" size="sm" onClick={resetForm}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Question Type</Label>
                                <Select
                                    value={formData.question_type}
                                    onValueChange={(value) => setFormData({ ...formData, question_type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mcq">Multiple Choice</SelectItem>
                                        <SelectItem value="true_false">True/False</SelectItem>
                                        <SelectItem value="short_answer">Short Answer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Marks</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={formData.marks}
                                    onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Question</Label>
                            <Textarea
                                value={formData.question}
                                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                placeholder="Enter your question..."
                                rows={3}
                            />
                        </div>

                        {formData.question_type === "mcq" && (
                            <div className="space-y-2">
                                <Label>Options</Label>
                                {formData.options.map((opt, index) => (
                                    <Input
                                        key={index}
                                        value={opt}
                                        onChange={(e) => {
                                            const newOptions = [...formData.options];
                                            newOptions[index] = e.target.value;
                                            setFormData({ ...formData, options: newOptions });
                                        }}
                                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                    />
                                ))}
                            </div>
                        )}

                        <div>
                            <Label>Correct Answer</Label>
                            {formData.question_type === "mcq" ? (
                                <Select
                                    value={formData.correct_answer}
                                    onValueChange={(value) => setFormData({ ...formData, correct_answer: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select correct option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {formData.options.filter(opt => opt.trim()).map((opt, index) => (
                                            <SelectItem key={index} value={opt}>
                                                {String.fromCharCode(65 + index)}. {opt}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : formData.question_type === "true_false" ? (
                                <Select
                                    value={formData.correct_answer}
                                    onValueChange={(value) => setFormData({ ...formData, correct_answer: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select answer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="True">True</SelectItem>
                                        <SelectItem value="False">False</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    value={formData.correct_answer}
                                    onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                                    placeholder="Enter the correct answer or key points"
                                />
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Button onClick={handleAddQuestion} className="flex-1">
                                <Save className="w-4 h-4 mr-2" />
                                {editingId ? "Update Question" : "Add Question"}
                            </Button>
                            <Button variant="outline" onClick={resetForm}>
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            { }
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Question?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The question will be permanently removed from the quiz.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteQuestion} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

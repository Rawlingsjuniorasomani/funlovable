import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { quizzesAPI, subjectsAPI, modulesAPI } from "@/config/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export function TeacherQuizCreate() {
    const navigate = useNavigate();

    const [subjects, setSubjects] = useState<any[]>([]);
    const [modules, setModules] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        subject_id: "",
        module_id: "",
        quiz_type: "practice",
        duration_minutes: 30,
        total_marks: 100,
        start_date: new Date(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        instructions: "",
        class_name: "",
        randomize_questions: false,
        max_attempts: 1,
        allow_review: true,
    });

    useEffect(() => {
        loadSubjects();
    }, []);

    useEffect(() => {
        if (formData.subject_id) {
            loadModules(formData.subject_id);
        }
    }, [formData.subject_id]);

    const loadSubjects = async () => {
        try {
            const data = await subjectsAPI.getTeacher();
            setSubjects(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error("Failed to load subjects");
        }
    };

    const loadModules = async (subjectId: string) => {
        try {
            const data = await modulesAPI.getBySubject(subjectId);
            setModules(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load modules:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.subject_id || !formData.module_id) {
            toast.error("Please fill in all required fields (Title, Subject, Module)");
            return;
        }

        setLoading(true);
        try {
            const quiz = await quizzesAPI.create(formData);
            toast.success("Quiz created successfully!");
            navigate(`/teacher/quizzes/${quiz.id}/questions`);
        } catch (error: any) {
            toast.error(error.message || "Failed to create quiz");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-10">
            <div>
                <h2 className="text-2xl font-display font-bold">Create New Quiz</h2>
                <p className="text-muted-foreground">Set up your quiz details and settings</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="title">Quiz Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Midterm Exam - Chapter 1-5"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief description of the quiz"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="subject">Subject *</Label>
                                <Select
                                    value={formData.subject_id}
                                    onValueChange={(value) => setFormData({ ...formData, subject_id: value, module_id: "" })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.map((subject) => (
                                            <SelectItem key={subject.id} value={subject.id}>
                                                {subject.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="module">Module *</Label>
                                <Select
                                    value={formData.module_id}
                                    onValueChange={(value) => setFormData({ ...formData, module_id: value })}
                                    disabled={!formData.subject_id}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select module" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {modules.map((module) => (
                                            <SelectItem key={module.id} value={module.id}>
                                                {module.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="class_name">Class/Section</Label>
                            <Input
                                id="class_name"
                                value={formData.class_name}
                                onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                                placeholder="e.g., Grade 10A"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Quiz Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quiz Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="quiz_type">Quiz Type</Label>
                                <Select
                                    value={formData.quiz_type}
                                    onValueChange={(value) => setFormData({ ...formData, quiz_type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="practice">Practice</SelectItem>
                                        <SelectItem value="test">Test</SelectItem>
                                        <SelectItem value="exam">Exam</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="duration">Duration (minutes)</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    min="1"
                                    value={formData.duration_minutes}
                                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                                />
                            </div>

                            <div>
                                <Label htmlFor="total_marks">Total Marks</Label>
                                <Input
                                    id="total_marks"
                                    type="number"
                                    min="1"
                                    value={formData.total_marks}
                                    onChange={(e) => setFormData({ ...formData, total_marks: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Start Date & Time</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {format(formData.start_date, "PPP")}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={formData.start_date}
                                            onSelect={(date) => date && setFormData({ ...formData, start_date: date })}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div>
                                <Label>End Date & Time</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {format(formData.end_date, "PPP")}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={formData.end_date}
                                            onSelect={(date) => date && setFormData({ ...formData, end_date: date })}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="instructions">Instructions</Label>
                            <Textarea
                                id="instructions"
                                value={formData.instructions}
                                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                placeholder="Instructions for students..."
                                rows={4}
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="randomize">Randomize Questions</Label>
                                <Switch
                                    id="randomize"
                                    checked={formData.randomize_questions}
                                    onCheckedChange={(checked) => setFormData({ ...formData, randomize_questions: checked })}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="allow_review">Allow Answer Review</Label>
                                <Switch
                                    id="allow_review"
                                    checked={formData.allow_review}
                                    onCheckedChange={(checked) => setFormData({ ...formData, allow_review: checked })}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="max_attempts">Maximum Attempts</Label>
                                    <p className="text-xs text-muted-foreground">Number of times students can take this quiz</p>
                                </div>
                                <Input
                                    id="max_attempts"
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={formData.max_attempts}
                                    onChange={(e) => setFormData({ ...formData, max_attempts: parseInt(e.target.value) })}
                                    className="w-20"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-center gap-4">
                    <Button type="submit" disabled={loading} className="flex-1">
                        {loading ? "Creating..." : "Create Quiz & Add Questions"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => navigate("/teacher/quizzes")}>
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}

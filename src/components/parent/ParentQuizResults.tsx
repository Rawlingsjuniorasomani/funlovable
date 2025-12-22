import { useState, useEffect } from "react";
import { gradesAPI, parentsAPI } from "@/config/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, TrendingUp, BookOpen } from "lucide-react";
import { toast } from "sonner";

export function ParentQuizResults() {
    const [children, setChildren] = useState<any[]>([]);
    const [selectedChild, setSelectedChild] = useState<string>("");
    const [grades, setGrades] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadChildren();
    }, []);

    useEffect(() => {
        if (selectedChild) {
            loadGrades();
        }
    }, [selectedChild]);

    const loadChildren = async () => {
        try {
            const data = await parentsAPI.getChildren();
            setChildren(Array.isArray(data) ? data : []);
            if (data.length > 0) {
                setSelectedChild(data[0].id);
            }
        } catch (error) {
            toast.error("Failed to load children");
        } finally {
            setLoading(false);
        }
    };

    const loadGrades = async () => {
        try {
            const data = await gradesAPI.getStudentGrades(selectedChild);
            
            const quizGrades = Array.isArray(data)
                ? data.filter(g => g.assessment_type === "quiz" || g.assessment_type === "test")
                : [];
            setGrades(quizGrades);
        } catch (error) {
            console.error("Failed to load grades:", error);
        }
    };

    const calculateAverage = () => {
        if (grades.length === 0) return 0;
        const total = grades.reduce((sum, g) => sum + (g.score / g.max_score) * 100, 0);
        return (total / grades.length).toFixed(1);
    };

    const getGradeColor = (percentage: number) => {
        if (percentage >= 90) return "text-green-600";
        if (percentage >= 80) return "text-blue-600";
        if (percentage >= 70) return "text-yellow-600";
        if (percentage >= 60) return "text-orange-600";
        return "text-red-600";
    };

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    if (children.length === 0) {
        return (
            <Card>
                <CardContent className="text-center py-12">
                    <p className="text-muted-foreground">No children added yet</p>
                </CardContent>
            </Card>
        );
    }

    const average = calculateAverage();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-display font-bold">Quiz Results</h2>
                <p className="text-muted-foreground">View your child's quiz performance</p>
            </div>

            <div>
                <Label className="text-sm font-medium">Select Child</Label>
                <Select value={selectedChild} onValueChange={setSelectedChild}>
                    <SelectTrigger className="w-[300px] mt-1">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {children.map((child) => (
                            <SelectItem key={child.id} value={child.id}>
                                {child.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {selectedChild && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Award className="w-4 h-4" />
                                    Average Score
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-4xl font-bold ${getGradeColor(Number(average))}`}>
                                    {average}%
                                </div>
                                <Progress value={Number(average)} className="mt-2" />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <div className="text-2xl font-bold">{grades.length}</div>
                                        <div className="text-xs text-muted-foreground">Quizzes Taken</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-green-600" />
                                    <div>
                                        <div className="text-2xl font-bold">
                                            {grades.filter(g => (g.score / g.max_score) * 100 >= 70).length}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Above 70%</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quiz History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {grades.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No quiz results available yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {grades.map((grade) => {
                                        const percentage = ((grade.score / grade.max_score) * 100).toFixed(1);
                                        return (
                                            <div key={grade.id} className="border rounded-lg p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-semibold">{grade.subject_name}</h4>
                                                            <Badge variant="outline">{grade.assessment_type}</Badge>
                                                            {grade.term && <Badge variant="secondary">{grade.term}</Badge>}
                                                        </div>
                                                        {grade.remarks && (
                                                            <p className="text-sm mt-2 italic text-muted-foreground">{grade.remarks}</p>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={`text-2xl font-bold ${getGradeColor(Number(percentage))}`}>
                                                            {percentage}%
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {grade.score}/{grade.max_score}
                                                        </div>
                                                        {grade.grade && (
                                                            <Badge className="mt-2">{grade.grade}</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <Progress value={Number(percentage)} className="mt-3" />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
    return <label className={className}>{children}</label>;
}

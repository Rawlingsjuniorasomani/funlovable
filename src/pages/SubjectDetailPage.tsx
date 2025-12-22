import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { subjectsAPI, modulesAPI } from "@/config/api";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthContext } from "@/contexts/AuthContext";
import { BookOpen, Clock, ArrowLeft, Loader2, List, FileText } from "lucide-react";

export default function SubjectDetailPage() {
    const { subjectId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthContext();
    const id = subjectId || "";

    const { data: subject, isLoading: loadingSubject } = useQuery({
        queryKey: ['subject', id],
        queryFn: () => subjectsAPI.getById(id),
        enabled: !!id
    });

    const { data: modules, isLoading: loadingModules } = useQuery({
        queryKey: ['modules', id],
        queryFn: () => modulesAPI.getBySubject(id),
        enabled: !!id
    });

    const isLoading = loadingSubject || loadingModules;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!subject) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <main className="container mx-auto px-4 py-8 pt-24 text-center">
                    <h1 className="text-2xl font-bold mb-4">Subject Not Found</h1>
                    <Button onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="container mx-auto px-4 py-8 pt-24 space-y-8">
                { }
                <div>
                    <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                </div>

                { }
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 grid md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-${subject.color || "primary"}/10`}>
                            { }
                            <BookOpen className={`w-8 h-8 text-${subject.color || "primary"}`} />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{subject.name}</h1>
                        <p className="text-lg text-gray-600 max-w-xl">{subject.description}</p>

                        <div className="flex flex-wrap gap-4 pt-2">
                            <div className="flex items-center text-gray-500 bg-gray-100 px-3 py-1 rounded-full text-sm">
                                <List className="w-4 h-4 mr-2" />
                                {modules?.length || 0} Modules
                            </div>
                            <div className="flex items-center text-gray-500 bg-gray-100 px-3 py-1 rounded-full text-sm">
                                <Clock className="w-4 h-4 mr-2" />
                                Self-Paced
                            </div>
                        </div>

                        { }
                        { }
                        { }
                    </div>
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-200">
                        <img
                            src={subject.image_url || "/placeholder.svg"}
                            alt={subject.name}
                            className="object-cover w-full h-full"
                        />
                    </div>
                </div>

                { }
                <section>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-primary" />
                        Course Modules
                    </h2>

                    <div className="grid gap-4">
                        {modules && modules.length > 0 ? (
                            modules.map((module: any) => (
                                <Card key={module.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <CardTitle className="flex justify-between items-start">
                                            <span>{module.title}</span>
                                        </CardTitle>
                                        {module.description && <CardDescription>{module.description}</CardDescription>}
                                    </CardHeader>
                                    { }
                                    <CardContent>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            { }
                                            <FileText className="w-4 h-4 mr-2" />
                                            Content Available
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-white rounded-xl border border-dashed text-gray-500">
                                No modules available for this subject yet.
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}

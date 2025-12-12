import { Download, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { generateProgressReport } from "@/utils/pdfExport";
import { toast } from "sonner";

interface ProgressExportProps {
  childId: string;
  childName: string;
  childGrade: string;
}

export function ProgressExport({ childId, childName, childGrade }: ProgressExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Mock data - in real app, fetch from API
      const reportData = {
        childName,
        grade: childGrade,
        level: 12,
        xp: 2450,
        streak: 7,
        avgScore: 78,
        subjects: [
          { subject: "Mathematics", progress: 75, grade: "B+", quizzes: 8, lessons: 15 },
          { subject: "Science", progress: 82, grade: "A-", quizzes: 6, lessons: 12 },
          { subject: "English", progress: 68, grade: "B", quizzes: 7, lessons: 14 },
          { subject: "Social Studies", progress: 71, grade: "B", quizzes: 5, lessons: 10 },
          { subject: "ICT", progress: 88, grade: "A", quizzes: 4, lessons: 8 },
          { subject: "French", progress: 55, grade: "C+", quizzes: 3, lessons: 6 },
        ],
        recentQuizzes: [
          { title: "Fractions Quiz", subject: "Mathematics", score: 9, total: 10, date: "Dec 10, 2024" },
          { title: "Human Body", subject: "Science", score: 8, total: 10, date: "Dec 9, 2024" },
          { title: "Grammar Test", subject: "English", score: 7, total: 10, date: "Dec 8, 2024" },
          { title: "Computer Basics", subject: "ICT", score: 10, total: 10, date: "Dec 7, 2024" },
        ],
        generatedDate: new Date().toLocaleDateString(),
      };
      
      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      generateProgressReport(reportData);
      toast.success("Progress report downloaded successfully!");
    } catch (error) {
      toast.error("Failed to generate report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      onClick={handleExport}
      disabled={isExporting}
      className="gap-2"
      variant="outline"
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Export PDF Report
        </>
      )}
    </Button>
  );
}

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
      const reportData = {
        childName,
        grade: childGrade,
        level: 0,
        xp: 0,
        streak: 0,
        avgScore: 0,
        subjects: [],
        recentQuizzes: [],
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

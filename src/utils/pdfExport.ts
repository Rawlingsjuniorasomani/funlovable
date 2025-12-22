import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface SubjectProgress {
  subject: string;
  progress: number;
  grade: string;
  quizzes: number;
  lessons: number;
}

interface QuizResult {
  title: string;
  subject: string;
  score: number;
  total: number;
  date: string;
}

interface ChildReportData {
  childName: string;
  grade: string;
  level: number;
  xp: number;
  streak: number;
  avgScore: number;
  subjects: SubjectProgress[];
  recentQuizzes: QuizResult[];
  generatedDate: string;
}

export function generateProgressReport(data: ChildReportData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  
  doc.setFillColor(99, 102, 241); 
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Lovable Learning', 20, 20);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Student Progress Report', 20, 32);
  
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(data.childName, 20, 55);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Grade: ${data.grade} | Generated: ${data.generatedDate}`, 20, 63);
  
  
  const statsY = 75;
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(20, statsY, pageWidth - 40, 30, 3, 3, 'F');
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  const statsLabels = ['Level', 'XP', 'Streak', 'Avg Score'];
  const statsValues = [data.level.toString(), data.xp.toLocaleString(), `${data.streak} days`, `${data.avgScore}%`];
  const statsWidth = (pageWidth - 40) / 4;
  
  statsLabels.forEach((label, i) => {
    const x = 20 + (statsWidth * i) + (statsWidth / 2);
    doc.setTextColor(100, 100, 100);
    doc.text(label, x, statsY + 10, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(statsValues[i], x, statsY + 22, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
  });
  
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Subject Performance', 20, 120);
  
  const subjectTableData = data.subjects.map(s => [
    s.subject,
    `${s.progress}%`,
    s.grade,
    s.lessons.toString(),
    s.quizzes.toString()
  ]);
  
  (doc as any).autoTable({
    startY: 125,
    head: [['Subject', 'Progress', 'Grade', 'Lessons', 'Quizzes']],
    body: subjectTableData,
    theme: 'striped',
    headStyles: { 
      fillColor: [99, 102, 241],
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      cellPadding: 4,
      fontSize: 10,
    },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center' },
    }
  });
  
  
  const quizStartY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Recent Quiz Results', 20, quizStartY);
  
  const quizTableData = data.recentQuizzes.map(q => [
    q.title,
    q.subject,
    `${q.score}/${q.total}`,
    `${Math.round((q.score / q.total) * 100)}%`,
    q.date
  ]);
  
  (doc as any).autoTable({
    startY: quizStartY + 5,
    head: [['Quiz', 'Subject', 'Score', 'Percentage', 'Date']],
    body: quizTableData,
    theme: 'striped',
    headStyles: { 
      fillColor: [34, 197, 94],
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      cellPadding: 4,
      fontSize: 10,
    },
    columnStyles: {
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center' },
    }
  });
  
  
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text('© Lovable Learning - This report was automatically generated', pageWidth / 2, footerY, { align: 'center' });
  
  
  doc.save(`${data.childName.replace(' ', '_')}_Progress_Report_${data.generatedDate.replace(/\//g, '-')}.pdf`);
}

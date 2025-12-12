// Mock data for dashboards

export interface Student {
  id: string;
  name: string;
  email: string;
  class: string;
  grade: string;
  avatar: string;
  xp: number;
  level: number;
  streak: number;
  quizzesCompleted: number;
  lessonsCompleted: number;
  avgScore: number;
  joinedAt: string;
  parentId?: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  avatar: string;
}

export interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  children: string[];
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
  teacherId: string;
  moduleCount: number;
  studentCount: number;
}

export interface Module {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  order: number;
  lessonCount: number;
  duration: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  type: "video" | "text" | "interactive";
  duration: string;
  order: number;
  content?: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  moduleId?: string;
  dueDate: string;
  totalPoints: number;
  status: "draft" | "active" | "closed";
  submissions: number;
  totalStudents: number;
}

export interface QuizRecord {
  id: string;
  title: string;
  subjectId: string;
  moduleId?: string;
  questionCount: number;
  duration: number;
  status: "draft" | "active" | "closed";
  attempts: number;
  avgScore: number;
}

export interface LiveClass {
  id: string;
  title: string;
  subjectId: string;
  scheduledAt: string;
  duration: number;
  status: "scheduled" | "live" | "completed";
  attendees: number;
  totalStudents: number;
}

export interface Message {
  id: string;
  from: string;
  fromName: string;
  to: string;
  subject: string;
  content: string;
  read: boolean;
  sentAt: string;
  type: "message" | "announcement" | "alert";
}

export interface Reward {
  id: string;
  studentId: string;
  studentName: string;
  type: "badge" | "star" | "trophy" | "points";
  name: string;
  reason: string;
  awardedAt: string;
  awardedBy: string;
}

// Leaderboard data
export const mockLeaderboard: Student[] = [
  { id: "1", name: "Kwame Asante", email: "kwame@example.com", class: "Primary 5A", grade: "Primary 5", avatar: "K", xp: 4850, level: 10, streak: 15, quizzesCompleted: 42, lessonsCompleted: 38, avgScore: 95, joinedAt: "2024-01-15" },
  { id: "2", name: "Ama Mensah", email: "ama@example.com", class: "Primary 6B", grade: "Primary 6", avatar: "A", xp: 4620, level: 10, streak: 12, quizzesCompleted: 40, lessonsCompleted: 35, avgScore: 92, joinedAt: "2024-01-10" },
  { id: "3", name: "Kofi Owusu", email: "kofi@example.com", class: "JHS 1A", grade: "JHS 1", avatar: "K", xp: 4380, level: 9, streak: 8, quizzesCompleted: 38, lessonsCompleted: 32, avgScore: 89, joinedAt: "2024-02-01" },
  { id: "4", name: "Abena Darko", email: "abena@example.com", class: "Primary 5B", grade: "Primary 5", avatar: "A", xp: 4150, level: 9, streak: 10, quizzesCompleted: 35, lessonsCompleted: 30, avgScore: 87, joinedAt: "2024-01-20" },
  { id: "5", name: "Yaw Boateng", email: "yaw@example.com", class: "Primary 6A", grade: "Primary 6", avatar: "Y", xp: 3920, level: 8, streak: 6, quizzesCompleted: 33, lessonsCompleted: 28, avgScore: 85, joinedAt: "2024-02-05" },
  { id: "6", name: "Efua Amoah", email: "efua@example.com", class: "JHS 1B", grade: "JHS 1", avatar: "E", xp: 3750, level: 8, streak: 9, quizzesCompleted: 31, lessonsCompleted: 26, avgScore: 84, joinedAt: "2024-01-25" },
  { id: "7", name: "Kwabena Sarpong", email: "kwabena@example.com", class: "Primary 5A", grade: "Primary 5", avatar: "K", xp: 3580, level: 8, streak: 5, quizzesCompleted: 29, lessonsCompleted: 25, avgScore: 82, joinedAt: "2024-02-10" },
  { id: "8", name: "Adwoa Frimpong", email: "adwoa@example.com", class: "Primary 6B", grade: "Primary 6", avatar: "A", xp: 3420, level: 7, streak: 7, quizzesCompleted: 27, lessonsCompleted: 23, avgScore: 80, joinedAt: "2024-01-30" },
  { id: "9", name: "Kojo Mensah", email: "kojo@example.com", class: "JHS 1A", grade: "JHS 1", avatar: "K", xp: 3280, level: 7, streak: 4, quizzesCompleted: 25, lessonsCompleted: 22, avgScore: 78, joinedAt: "2024-02-15" },
  { id: "10", name: "Akua Appiah", email: "akua@example.com", class: "Primary 5B", grade: "Primary 5", avatar: "A", xp: 3150, level: 7, streak: 6, quizzesCompleted: 24, lessonsCompleted: 20, avgScore: 77, joinedAt: "2024-02-20" },
];

export const mockStudents: Student[] = mockLeaderboard;

export const mockSubjects: Subject[] = [
  { id: "math", name: "Mathematics", description: "Numbers, algebra, geometry and more", icon: "📐", teacherId: "t1", moduleCount: 8, studentCount: 95 },
  { id: "science", name: "Science", description: "Biology, chemistry, physics fundamentals", icon: "🔬", teacherId: "t1", moduleCount: 6, studentCount: 88 },
  { id: "english", name: "English", description: "Grammar, reading, writing skills", icon: "📚", teacherId: "t2", moduleCount: 7, studentCount: 92 },
  { id: "social", name: "Social Studies", description: "History, geography, civics", icon: "🌍", teacherId: "t2", moduleCount: 5, studentCount: 85 },
  { id: "ict", name: "ICT", description: "Computer basics, internet safety", icon: "💻", teacherId: "t1", moduleCount: 4, studentCount: 78 },
  { id: "french", name: "French", description: "Basic French language skills", icon: "🇫🇷", teacherId: "t3", moduleCount: 6, studentCount: 65 },
  { id: "rme", name: "Religious & Moral Education", description: "Values, ethics, world religions", icon: "🙏", teacherId: "t3", moduleCount: 5, studentCount: 90 },
];

export const mockModules: Module[] = [
  { id: "m1", subjectId: "math", title: "Introduction to Fractions", description: "Understanding parts of a whole", order: 1, lessonCount: 5, duration: "2 hours" },
  { id: "m2", subjectId: "math", title: "Decimals and Percentages", description: "Converting between number forms", order: 2, lessonCount: 4, duration: "1.5 hours" },
  { id: "m3", subjectId: "math", title: "Basic Algebra", description: "Variables and simple equations", order: 3, lessonCount: 6, duration: "2.5 hours" },
  { id: "m4", subjectId: "science", title: "Human Body Systems", description: "Major organs and their functions", order: 1, lessonCount: 5, duration: "2 hours" },
  { id: "m5", subjectId: "science", title: "Plants and Photosynthesis", description: "How plants make food", order: 2, lessonCount: 4, duration: "1.5 hours" },
  { id: "m6", subjectId: "english", title: "Parts of Speech", description: "Nouns, verbs, adjectives", order: 1, lessonCount: 6, duration: "2 hours" },
  { id: "m7", subjectId: "english", title: "Sentence Structure", description: "Building complete sentences", order: 2, lessonCount: 5, duration: "2 hours" },
];

export const mockLessons: Lesson[] = [
  { id: "l1", moduleId: "m1", title: "What are Fractions?", description: "Introduction to the concept", type: "video", duration: "15 min", order: 1 },
  { id: "l2", moduleId: "m1", title: "Adding Fractions", description: "Same denominators", type: "interactive", duration: "20 min", order: 2 },
  { id: "l3", moduleId: "m1", title: "Subtracting Fractions", description: "Different denominators", type: "text", duration: "15 min", order: 3 },
  { id: "l4", moduleId: "m4", title: "The Circulatory System", description: "Heart and blood vessels", type: "video", duration: "20 min", order: 1 },
  { id: "l5", moduleId: "m4", title: "The Respiratory System", description: "Lungs and breathing", type: "interactive", duration: "18 min", order: 2 },
];

export const mockAssignments: Assignment[] = [
  { id: "a1", title: "Fraction Word Problems", description: "Solve 10 real-world fraction problems", subjectId: "math", moduleId: "m1", dueDate: "2024-12-15", totalPoints: 100, status: "active", submissions: 28, totalStudents: 35 },
  { id: "a2", title: "Body Systems Diagram", description: "Label the major organs", subjectId: "science", moduleId: "m4", dueDate: "2024-12-18", totalPoints: 50, status: "active", submissions: 15, totalStudents: 32 },
  { id: "a3", title: "Grammar Worksheet", description: "Identify parts of speech", subjectId: "english", moduleId: "m6", dueDate: "2024-12-20", totalPoints: 75, status: "active", submissions: 22, totalStudents: 30 },
  { id: "a4", title: "Algebra Practice Set", description: "Solve equations for x", subjectId: "math", moduleId: "m3", dueDate: "2024-12-12", totalPoints: 100, status: "closed", submissions: 34, totalStudents: 35 },
];

export const mockQuizRecords: QuizRecord[] = [
  { id: "q1", title: "Fractions Quiz", subjectId: "math", moduleId: "m1", questionCount: 10, duration: 15, status: "active", attempts: 45, avgScore: 78 },
  { id: "q2", title: "Human Body Quiz", subjectId: "science", moduleId: "m4", questionCount: 8, duration: 12, status: "active", attempts: 38, avgScore: 82 },
  { id: "q3", title: "Grammar Test", subjectId: "english", moduleId: "m6", questionCount: 15, duration: 20, status: "draft", attempts: 0, avgScore: 0 },
  { id: "q4", title: "Algebra Assessment", subjectId: "math", moduleId: "m3", questionCount: 12, duration: 18, status: "active", attempts: 52, avgScore: 75 },
];

export const mockLiveClasses: LiveClass[] = [
  { id: "lc1", title: "Fractions Review Session", subjectId: "math", scheduledAt: "2024-12-11T14:00:00", duration: 45, status: "scheduled", attendees: 0, totalStudents: 35 },
  { id: "lc2", title: "Science Q&A", subjectId: "science", scheduledAt: "2024-12-12T10:00:00", duration: 30, status: "scheduled", attendees: 0, totalStudents: 32 },
  { id: "lc3", title: "English Grammar Help", subjectId: "english", scheduledAt: "2024-12-10T15:00:00", duration: 40, status: "completed", attendees: 28, totalStudents: 30 },
];

export const mockMessages: Message[] = [
  { id: "msg1", from: "p1", fromName: "Mrs. Asante", to: "t1", subject: "Kwame's Progress", content: "I wanted to ask about Kwame's performance in Mathematics...", read: false, sentAt: "2024-12-10T09:30:00", type: "message" },
  { id: "msg2", from: "s1", fromName: "Kwame Asante", to: "t1", subject: "Question about Homework", content: "Good morning sir, I don't understand question 5...", read: true, sentAt: "2024-12-09T16:45:00", type: "message" },
  { id: "msg3", from: "t1", fromName: "Teacher", to: "all", subject: "Upcoming Test Reminder", content: "Reminder: Math test is scheduled for next Monday...", read: true, sentAt: "2024-12-08T11:00:00", type: "announcement" },
];

export const mockRewards: Reward[] = [
  { id: "r1", studentId: "1", studentName: "Kwame Asante", type: "badge", name: "Quiz Master", reason: "Completed 40 quizzes", awardedAt: "2024-12-10", awardedBy: "System" },
  { id: "r2", studentId: "2", studentName: "Ama Mensah", type: "star", name: "Perfect Score", reason: "100% on Fractions Quiz", awardedAt: "2024-12-09", awardedBy: "Teacher" },
  { id: "r3", studentId: "3", studentName: "Kofi Owusu", type: "trophy", name: "Top Performer", reason: "Highest monthly score", awardedAt: "2024-12-01", awardedBy: "System" },
  { id: "r4", studentId: "4", studentName: "Abena Darko", type: "points", name: "+50 Bonus XP", reason: "Helping classmates", awardedAt: "2024-12-08", awardedBy: "Teacher" },
];

// Helper function to get subject by ID
export const getSubjectById = (id: string) => mockSubjects.find(s => s.id === id);

// Helper function to get modules by subject ID
export const getModulesBySubject = (subjectId: string) => mockModules.filter(m => m.subjectId === subjectId);

// Helper function to get lessons by module ID
export const getLessonsByModule = (moduleId: string) => mockLessons.filter(l => l.moduleId === moduleId);

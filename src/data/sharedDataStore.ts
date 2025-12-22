










import { create } from 'zustand';

export interface SharedModule {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  order: number;
  createdBy: string;
  createdAt: string;
  isNew?: boolean;
}

export interface SharedLesson {
  id: string;
  moduleId: string;
  subjectId: string;
  title: string;
  description: string;
  type: 'video' | 'text' | 'interactive';
  duration: string;
  order: number;
  content?: string;
  videoUrl?: string;
  createdBy: string;
  createdAt: string;
  isNew?: boolean;
}

export interface SharedAssignment {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  moduleId?: string;
  dueDate: string;
  totalPoints: number;
  status: 'draft' | 'active' | 'closed';
  createdBy: string;
  createdAt: string;
  isNew?: boolean;
}

export interface SharedQuiz {
  id: string;
  title: string;
  subjectId: string;
  moduleId?: string;
  questions: QuizQuestion[];
  duration: number;
  status: 'draft' | 'active' | 'closed';
  createdBy: string;
  createdAt: string;
  isNew?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'mcq' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer: string;
  points: number;
}

export interface SharedLiveClass {
  id: string;
  title: string;
  subjectId: string;
  scheduledAt: string;
  duration: number;
  status: 'scheduled' | 'live' | 'completed';
  hostId: string;
  isNew?: boolean;
}

export interface SharedReward {
  id: string;
  studentId: string;
  type: 'badge' | 'star' | 'trophy' | 'points';
  name: string;
  reason: string;
  awardedBy: string;
  awardedAt: string;
  points?: number;
}

export interface SharedMessage {
  id: string;
  from: string;
  fromName: string;
  fromRole: 'teacher' | 'student' | 'parent' | 'admin';
  to: string;
  toName?: string;
  subject: string;
  content: string;
  read: boolean;
  sentAt: string;
  type: 'message' | 'announcement' | 'alert';
}

export interface StudentProgress {
  lessonId: string;
  studentId: string;
  completed: boolean;
  completedAt?: string;
  score?: number;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  content: string;
  submittedAt: string;
  grade?: number;
  feedback?: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  answers: { questionId: string; answer: string }[];
  score: number;
  completedAt: string;
}

export interface StudentEnrollment {
  studentId: string;
  subjectId: string;
  enrolledAt: string;
}

interface SharedDataState {
  
  modules: SharedModule[];
  lessons: SharedLesson[];
  assignments: SharedAssignment[];
  quizzes: SharedQuiz[];
  liveClasses: SharedLiveClass[];
  rewards: SharedReward[];
  messages: SharedMessage[];
  enrollments: StudentEnrollment[];
  lessonProgress: StudentProgress[];
  submissions: AssignmentSubmission[];
  quizAttempts: QuizAttempt[];

  
  addModule: (module: Omit<SharedModule, 'id' | 'createdAt' | 'isNew'>) => void;
  updateModule: (id: string, data: Partial<SharedModule>) => void;
  deleteModule: (id: string) => void;

  
  addLesson: (lesson: Omit<SharedLesson, 'id' | 'createdAt' | 'isNew'>) => void;
  updateLesson: (id: string, data: Partial<SharedLesson>) => void;
  deleteLesson: (id: string) => void;

  
  addAssignment: (assignment: Omit<SharedAssignment, 'id' | 'createdAt' | 'isNew'>) => void;
  updateAssignment: (id: string, data: Partial<SharedAssignment>) => void;
  deleteAssignment: (id: string) => void;

  
  addQuiz: (quiz: Omit<SharedQuiz, 'id' | 'createdAt' | 'isNew'>) => void;
  updateQuiz: (id: string, data: Partial<SharedQuiz>) => void;
  deleteQuiz: (id: string) => void;

  
  addLiveClass: (liveClass: Omit<SharedLiveClass, 'id' | 'isNew'>) => void;
  updateLiveClass: (id: string, data: Partial<SharedLiveClass>) => void;
  deleteLiveClass: (id: string) => void;

  
  addReward: (reward: Omit<SharedReward, 'id'>) => void;

  
  sendMessage: (message: Omit<SharedMessage, 'id' | 'sentAt' | 'read'>) => void;
  markMessageRead: (id: string) => void;

  
  enrollStudent: (studentId: string, subjectId: string) => void;
  unenrollStudent: (studentId: string, subjectId: string) => void;

  
  completeLesson: (studentId: string, lessonId: string) => void;
  submitAssignment: (submission: Omit<AssignmentSubmission, 'id' | 'submittedAt'>) => void;
  gradeAssignment: (submissionId: string, grade: number, feedback?: string) => void;
  submitQuiz: (attempt: Omit<QuizAttempt, 'id' | 'completedAt'>) => void;

  
  getStudentSubjects: (studentId: string) => string[];
  getSubjectModules: (subjectId: string) => SharedModule[];
  getModuleLessons: (moduleId: string) => SharedLesson[];
  getSubjectAssignments: (subjectId: string) => SharedAssignment[];
  getSubjectQuizzes: (subjectId: string) => SharedQuiz[];
  getSubjectLiveClasses: (subjectId: string) => SharedLiveClass[];
  getStudentRewards: (studentId: string) => SharedReward[];
  getStudentMessages: (userId: string) => SharedMessage[];
  getStudentProgress: (studentId: string) => StudentProgress[];
  getStudentSubmissions: (studentId: string) => AssignmentSubmission[];
  getStudentQuizAttempts: (studentId: string) => QuizAttempt[];
  markContentViewed: (studentId: string, contentType: string, contentId: string) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useSharedData = create<SharedDataState>((set, get) => ({
  modules: [],
  lessons: [],
  assignments: [],
  quizzes: [],
  liveClasses: [],
  rewards: [],
  messages: [],
  enrollments: [],
  lessonProgress: [],
  submissions: [],
  quizAttempts: [],

  
  addModule: (module) => set((state) => ({
    modules: [...state.modules, { 
      ...module, 
      id: generateId(), 
      createdAt: new Date().toISOString(),
      isNew: true 
    }]
  })),
  updateModule: (id, data) => set((state) => ({
    modules: state.modules.map(m => m.id === id ? { ...m, ...data } : m)
  })),
  deleteModule: (id) => set((state) => ({
    modules: state.modules.filter(m => m.id !== id),
    lessons: state.lessons.filter(l => l.moduleId !== id)
  })),

  
  addLesson: (lesson) => set((state) => ({
    lessons: [...state.lessons, { 
      ...lesson, 
      id: generateId(), 
      createdAt: new Date().toISOString(),
      isNew: true 
    }]
  })),
  updateLesson: (id, data) => set((state) => ({
    lessons: state.lessons.map(l => l.id === id ? { ...l, ...data } : l)
  })),
  deleteLesson: (id) => set((state) => ({
    lessons: state.lessons.filter(l => l.id !== id)
  })),

  
  addAssignment: (assignment) => set((state) => ({
    assignments: [...state.assignments, { 
      ...assignment, 
      id: generateId(), 
      createdAt: new Date().toISOString(),
      isNew: true 
    }]
  })),
  updateAssignment: (id, data) => set((state) => ({
    assignments: state.assignments.map(a => a.id === id ? { ...a, ...data } : a)
  })),
  deleteAssignment: (id) => set((state) => ({
    assignments: state.assignments.filter(a => a.id !== id)
  })),

  
  addQuiz: (quiz) => set((state) => ({
    quizzes: [...state.quizzes, { 
      ...quiz, 
      id: generateId(), 
      createdAt: new Date().toISOString(),
      isNew: true 
    }]
  })),
  updateQuiz: (id, data) => set((state) => ({
    quizzes: state.quizzes.map(q => q.id === id ? { ...q, ...data } : q)
  })),
  deleteQuiz: (id) => set((state) => ({
    quizzes: state.quizzes.filter(q => q.id !== id)
  })),

  
  addLiveClass: (liveClass) => set((state) => ({
    liveClasses: [...state.liveClasses, { 
      ...liveClass, 
      id: generateId(),
      isNew: true 
    }]
  })),
  updateLiveClass: (id, data) => set((state) => ({
    liveClasses: state.liveClasses.map(c => c.id === id ? { ...c, ...data } : c)
  })),
  deleteLiveClass: (id) => set((state) => ({
    liveClasses: state.liveClasses.filter(c => c.id !== id)
  })),

  
  addReward: (reward) => set((state) => ({
    rewards: [...state.rewards, { ...reward, id: generateId() }]
  })),

  
  sendMessage: (message) => set((state) => ({
    messages: [...state.messages, { 
      ...message, 
      id: generateId(), 
      sentAt: new Date().toISOString(),
      read: false 
    }]
  })),
  markMessageRead: (id) => set((state) => ({
    messages: state.messages.map(m => m.id === id ? { ...m, read: true } : m)
  })),

  
  enrollStudent: (studentId, subjectId) => set((state) => ({
    enrollments: [...state.enrollments, { studentId, subjectId, enrolledAt: new Date().toISOString() }]
  })),
  unenrollStudent: (studentId, subjectId) => set((state) => ({
    enrollments: state.enrollments.filter(e => !(e.studentId === studentId && e.subjectId === subjectId))
  })),

  
  completeLesson: (studentId, lessonId) => set((state) => ({
    lessonProgress: [...state.lessonProgress, { 
      lessonId, 
      studentId, 
      completed: true, 
      completedAt: new Date().toISOString() 
    }]
  })),
  submitAssignment: (submission) => set((state) => ({
    submissions: [...state.submissions, { 
      ...submission, 
      id: generateId(), 
      submittedAt: new Date().toISOString() 
    }]
  })),
  gradeAssignment: (submissionId, grade, feedback) => set((state) => ({
    submissions: state.submissions.map(s => 
      s.id === submissionId ? { ...s, grade, feedback } : s
    )
  })),
  submitQuiz: (attempt) => set((state) => ({
    quizAttempts: [...state.quizAttempts, { 
      ...attempt, 
      id: generateId(), 
      completedAt: new Date().toISOString() 
    }]
  })),

  
  getStudentSubjects: (studentId) => {
    return get().enrollments.filter(e => e.studentId === studentId).map(e => e.subjectId);
  },
  getSubjectModules: (subjectId) => {
    return get().modules.filter(m => m.subjectId === subjectId).sort((a, b) => a.order - b.order);
  },
  getModuleLessons: (moduleId) => {
    return get().lessons.filter(l => l.moduleId === moduleId).sort((a, b) => a.order - b.order);
  },
  getSubjectAssignments: (subjectId) => {
    return get().assignments.filter(a => a.subjectId === subjectId && a.status === 'active');
  },
  getSubjectQuizzes: (subjectId) => {
    return get().quizzes.filter(q => q.subjectId === subjectId && q.status === 'active');
  },
  getSubjectLiveClasses: (subjectId) => {
    return get().liveClasses.filter(c => c.subjectId === subjectId);
  },
  getStudentRewards: (studentId) => {
    return get().rewards.filter(r => r.studentId === studentId);
  },
  getStudentMessages: (userId) => {
    return get().messages.filter(m => m.to === userId || m.to === 'all');
  },
  getStudentProgress: (studentId) => {
    return get().lessonProgress.filter(p => p.studentId === studentId);
  },
  getStudentSubmissions: (studentId) => {
    return get().submissions.filter(s => s.studentId === studentId);
  },
  getStudentQuizAttempts: (studentId) => {
    return get().quizAttempts.filter(a => a.studentId === studentId);
  },
  markContentViewed: (studentId, contentType, contentId) => {
    const state = get();
    if (contentType === 'module') {
      set({ modules: state.modules.map(m => m.id === contentId ? { ...m, isNew: false } : m) });
    } else if (contentType === 'lesson') {
      set({ lessons: state.lessons.map(l => l.id === contentId ? { ...l, isNew: false } : l) });
    } else if (contentType === 'assignment') {
      set({ assignments: state.assignments.map(a => a.id === contentId ? { ...a, isNew: false } : a) });
    } else if (contentType === 'quiz') {
      set({ quizzes: state.quizzes.map(q => q.id === contentId ? { ...q, isNew: false } : q) });
    } else if (contentType === 'liveClass') {
      set({ liveClasses: state.liveClasses.map(c => c.id === contentId ? { ...c, isNew: false } : c) });
    }
  },
}));

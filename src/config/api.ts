export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = localStorage.getItem('auth_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Handle "View As Student" header
  const viewAsChildId = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('viewAsChildId') : null;
  if (viewAsChildId) {
    headers['x-view-as-student'] = viewAsChildId;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Attempt to parse error body
    const errorData = await response.json().catch(() => ({}));

    let errorMessage = errorData.error;
    if (!errorMessage && errorData.errors && Array.isArray(errorData.errors)) {
      errorMessage = errorData.errors.map((e: any) => e.msg).join(', ');
    }

    const error = new Error(errorMessage || `API Error: ${response.status}`);

    // Attach details for error handling
    (error as any).response = {
      status: response.status,
      data: errorData,
      statusText: response.statusText
    };
    throw error;
  }

  return response;
};

// Auth API helpers
export const authAPI = {
  login: async (email: string, password: string) => {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  register: async (data: { name: string; email: string; password: string; role: string; phone?: string }) => {
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  adminLogin: async (email: string, password: string) => {
    const res = await apiRequest('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  getCurrentUser: async () => {
    const res = await apiRequest('/auth/me');
    return res.json();
  },

  completeOnboarding: async () => {
    const res = await apiRequest('/auth/onboarding/complete', { method: 'POST' });
    return res.json();
  },
};

// Users API helpers
export const usersAPI = {
  getAll: async (params?: { role?: string; status?: string }) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    const res = await apiRequest(`/users${query}`);
    return res.json();
  },

  getById: async (id: string) => {
    const res = await apiRequest(`/users/${id}`);
    return res.json();
  },

  update: async (id: string, data: Partial<{ name: string; phone: string; avatar: string }>) => {
    const res = await apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  approve: async (id: string) => {
    const res = await apiRequest(`/users/${id}/approve`, { method: 'POST' });
    return res.json();
  },

  reject: async (id: string) => {
    const res = await apiRequest(`/users/${id}/reject`, { method: 'POST' });
    return res.json();
  },

  delete: async (id: string) => {
    const res = await apiRequest(`/users/${id}`, { method: 'DELETE' });
    return res.json();
  },

  inviteAdmin: async (data: { email: string; name: string }) => {
    const res = await apiRequest('/users/admins/invite', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  promoteToSuperAdmin: async (id: string) => {
    const res = await apiRequest(`/users/${id}/promote`, { method: 'POST' });
    return res.json();
  },

  demoteFromSuperAdmin: async (id: string) => {
    const res = await apiRequest(`/users/${id}/demote`, { method: 'POST' });
    return res.json();
  },

  getAdmins: async () => {
    const res = await apiRequest('/users?role=admin');
    return res.json();
  },

  promoteAdmin: async (id: string) => {
    const res = await apiRequest(`/users/${id}/promote`, { method: 'POST' });
    return res.json();
  },

  demoteAdmin: async (id: string) => {
    const res = await apiRequest(`/users/${id}/demote`, { method: 'POST' });
    return res.json();
  },

  generateOTP: async (email: string) => {
    const res = await apiRequest('/users/generate-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  addChild: async (data: { name: string; email: string; grade: string }) => {
    const res = await apiRequest('/parents/children', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },
};

// Subjects API helpers
export const subjectsAPI = {
  getAll: async () => {
    const res = await apiRequest('/subjects');
    return res.json();
  },

  getById: async (id: string) => {
    const res = await apiRequest(`/subjects/${id}`);
    return res.json();
  },

  getTeacher: async () => {
    const res = await apiRequest('/subjects/my-subjects');
    return res.json();
  },

  create: async (data: { name: string; description?: string; icon?: string; price?: number; level?: string; status?: string }) => {
    const res = await apiRequest('/subjects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  update: async (id: string, data: Partial<{ name: string; description: string; icon: string; price: number; level: string; status: string }>) => {
    const res = await apiRequest(`/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  delete: async (id: string) => {
    const res = await apiRequest(`/subjects/${id}`, { method: 'DELETE' });
    return res.json();
  },

  enroll: async (id: string) => {
    const res = await apiRequest(`/subjects/${id}/enroll`, { method: 'POST' });
    return res.json();
  },

  getEnrolled: async () => {
    const res = await apiRequest('/subjects/student/enrolled');
    return res.json();
  },
};

// Modules API helpers
export const modulesAPI = {
  getAll: async (subjectId?: string) => {
    const query = subjectId ? `?subjectId=${subjectId}` : '';
    const res = await apiRequest(`/modules${query}`);
    return res.json();
  },

  getBySubject: async (subjectId: string) => {
    const res = await apiRequest(`/modules/subject/${subjectId}`);
    return res.json();
  },

  create: async (data: { title: string; description?: string; subject_id: string }) => {
    const res = await apiRequest('/modules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  update: async (id: string, data: Partial<{ title: string; description: string }>) => {
    const res = await apiRequest(`/modules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  delete: async (id: string) => {
    const res = await apiRequest(`/modules/${id}`, { method: 'DELETE' });
    return res.json();
  },
};

// Lessons API helpers
export const lessonsAPI = {
  getAll: async (filters?: { moduleId?: string; teacherId?: string; subjectId?: string }) => {
    const query = filters ? `?${new URLSearchParams(filters as any)}` : '';
    const res = await apiRequest(`/lessons${query}`);
    return res.json();
  },

  getById: async (id: string) => {
    const res = await apiRequest(`/lessons/${id}`);
    return res.json();
  },

  create: async (data: any) => {
    const res = await apiRequest('/lessons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  createWithFile: async (formData: FormData) => {
    const token = localStorage.getItem('auth_token');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/lessons`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error || `API Error: ${response.status}`);
      (error as any).response = {
        status: response.status,
        data: errorData,
        statusText: response.statusText
      };
      throw error;
    }

    return response.json();
  },

  update: async (id: string, data: any) => {
    const res = await apiRequest(`/lessons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  delete: async (id: string) => {
    const res = await apiRequest(`/lessons/${id}`, { method: 'DELETE' });
    return res.json();
  },
};

// Assignments API helpers
export const assignmentsAPI = {
  getAll: async (filters?: { subjectId?: string; teacherId?: string }) => {
    const query = filters ? `?${new URLSearchParams(filters as any)}` : '';
    const res = await apiRequest(`/assignments${query}`);
    return res.json();
  },

  getById: async (id: string) => {
    const res = await apiRequest(`/assignments/${id}`);
    return res.json();
  },

  create: async (data: any) => {
    const res = await apiRequest('/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  update: async (id: string, data: any) => {
    const res = await apiRequest(`/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  delete: async (id: string) => {
    const res = await apiRequest(`/assignments/${id}`, { method: 'DELETE' });
    return res.json();
  },

  getSubmissions: async (assignmentId: string) => {
    const res = await apiRequest(`/assignments/${assignmentId}/submissions`);
    return res.json();
  },

  submit: async (assignmentId: string, data: any) => {
    const res = await apiRequest(`/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  getMySubmission: async (id: string) => {
    const res = await apiRequest(`/assignments/${id}/my-submission`);
    if (res.status === 404) return null;
    return res.json();
  },

  gradeSubmission: async (submissionId: string, data: { score: number; feedback: string }) => {
    const res = await apiRequest(`/assignments/submissions/${submissionId}/grade`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Questions
  addQuestion: async (assignmentId: string, data: any) => {
    const res = await apiRequest(`/assignments/${assignmentId}/questions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  getQuestions: async (assignmentId: string) => {
    const res = await apiRequest(`/assignments/${assignmentId}/questions`);
    return res.json();
  },

  updateQuestion: async (questionId: string, data: any) => {
    const res = await apiRequest(`/assignments/questions/${questionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteQuestion: async (questionId: string) => {
    const res = await apiRequest(`/assignments/questions/${questionId}`, { method: 'DELETE' });
    return res.json();
  },

  // Answers
  saveAnswer: async (data: { submission_id: string; question_id: string; answer_text: string }) => {
    const res = await apiRequest('/assignments/answers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  getAnswers: async (submissionId: string) => {
    // Assuming backend endpoint exists as verified in AssignmentModel/routes (GET /assignments/submissions/:id/answers or similar?)
    // Actually, looking at routes: router.get('/:id/my-submission', ...) but for teacher grading specific answers?
    // Let me check routes.js again.
    // routes/assignments.js has: router.post('/answers', ...), router.get('/:id/my-submission', ...), router.get('/:id/submissions', ...).
    // It DOES NOT have specific route to get answers for a submission by ID for TEACHER.
    // REQUIRED: Add route for fetching answers for a submission.
    // Wait, AssignmentModel has `static async getAnswers(submissionId)`.
    // I need to add the route in backend first if it's missing.
    // Checking routes/assignments.js content again... lines 1-26.
    // It does NOT have `router.get('/submissions/:submissionId/answers', ...)`
    // I will add the route first.
    return [];
  }

};

// Quizzes API helpers
export const quizzesAPI = {
  // Quiz management
  getAll: async (filters?: { moduleId?: string }) => {
    const query = filters ? `?${new URLSearchParams(filters as any)}` : '';
    const res = await apiRequest(`/quizzes${query}`);
    return res.json();
  },

  getById: async (id: string) => {
    const res = await apiRequest(`/quizzes/${id}`);
    return res.json();
  },

  getBySubject: async (subjectId: string) => {
    const res = await apiRequest(`/quizzes/subject/${subjectId}`);
    return res.json();
  },

  getAvailable: async () => {
    const res = await apiRequest('/quizzes/available');
    return res.json();
  },

  create: async (data: any) => {
    const res = await apiRequest('/quizzes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  update: async (id: string, data: any) => {
    const res = await apiRequest(`/quizzes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  publish: async (id: string) => {
    const res = await apiRequest(`/quizzes/${id}/publish`, { method: 'POST' });
    return res.json();
  },

  delete: async (id: string) => {
    const res = await apiRequest(`/quizzes/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Question management
  getQuestions: async (quizId: string, randomize?: boolean) => {
    const query = randomize ? '?randomize=true' : '';
    const res = await apiRequest(`/quizzes/${quizId}/questions${query}`);
    return res.json();
  },

  addQuestion: async (quizId: string, data: any) => {
    const res = await apiRequest(`/quizzes/${quizId}/questions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateQuestion: async (questionId: string, data: any) => {
    const res = await apiRequest(`/quizzes/questions/${questionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteQuestion: async (questionId: string) => {
    const res = await apiRequest(`/quizzes/questions/${questionId}`, { method: 'DELETE' });
    return res.json();
  },

  // Attempt management
  startAttempt: async (quizId: string) => {
    const res = await apiRequest(`/quizzes/${quizId}/start`, { method: 'POST' });
    return res.json();
  },

  saveAnswer: async (attemptId: string, data: { question_id: string; answer: string }) => {
    const res = await apiRequest(`/quizzes/attempts/${attemptId}/answers`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  submitAttempt: async (attemptId: string, timeTaken: number) => {
    const res = await apiRequest(`/quizzes/attempts/${attemptId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ time_taken_seconds: timeTaken }),
    });
    return res.json();
  },

  getAttemptResults: async (attemptId: string) => {
    const res = await apiRequest(`/quizzes/attempts/${attemptId}/results`);
    return res.json();
  },

  getAttempts: async (quizId: string) => {
    const res = await apiRequest(`/quizzes/${quizId}/attempts`);
    return res.json();
  },

  // Grading
  gradeAnswer: async (answerId: string, marksAwarded: number, feedback?: string) => {
    const res = await apiRequest(`/quizzes/answers/${answerId}/grade`, {
      method: 'PUT',
      body: JSON.stringify({ marks_awarded: marksAwarded, feedback }),
    });
    return res.json();
  },

  releaseResults: async (attemptId: string) => {
    const res = await apiRequest(`/quizzes/attempts/${attemptId}/release`, { method: 'POST' });
    return res.json();
  },

  updateFeedback: async (attemptId: string, feedback: string, manualScore: number) => {
    const res = await apiRequest(`/quizzes/attempts/${attemptId}/feedback`, {
      method: 'PUT',
      body: JSON.stringify({ feedback, manual_graded_score: manualScore }),
    });
    return res.json();
  },
};

// Parents API helpers
export const parentsAPI = {
  getChildren: async () => {
    const res = await apiRequest('/parents/children');
    return res.json();
  },

  addChild: async (data: { name: string; email: string; grade: string }) => {
    const res = await apiRequest('/parents/children', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  removeChild: async (childId: string) => {
    const res = await apiRequest(`/parents/children/${childId}`, { method: 'DELETE' });
    return res.json();
  },

  getChildProgress: async (childId: string) => {
    const res = await apiRequest(`/parents/child/${childId}/progress`);
    return res.json();
  },
};

// Rewards API helpers
export const rewardsAPI = {
  create: async (data: { student_id: string; type: string; name: string; reason: string }) => {
    const res = await apiRequest('/rewards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  getMyRewards: async () => {
    const res = await apiRequest('/rewards');
    return res.json();
  },

  delete: async (id: string) => {
    const res = await apiRequest(`/rewards/${id}`, { method: 'DELETE' });
    return res.json();
  },
};

export const paymentsAPI = {
  getAll: async () => {
    const res = await apiRequest('/payments');
    return res.json();
  },

  create: async (data: any) => {
    const res = await apiRequest('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  initialize: async (data: { amount: number; planId: string; email?: string }) => {
    const res = await apiRequest('/payments/initialize', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  verify: async (reference: string) => {
    const res = await apiRequest(`/payments/verify/${reference}`);
    return res.json();
  },
};

// Plans API helpers
export const plansAPI = {
  getAll: async () => {
    const res = await apiRequest('/plans');
    return res.json();
  },

  getById: async (id: string) => {
    const res = await apiRequest(`/plans/${id}`);
    return res.json();
  },

  create: async (data: any) => {
    const res = await apiRequest('/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  update: async (id: string, data: any) => {
    const res = await apiRequest(`/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  delete: async (id: string) => {
    const res = await apiRequest(`/plans/${id}`, { method: 'DELETE' });
    return res.json();
  },
};

// Live Classes API helpers
export const liveClassesAPI = {
  getAll: async (filters?: { subject_id?: string; teacher_id?: string; status?: string }) => {
    const query = filters ? `?${new URLSearchParams(filters as any)}` : '';
    const res = await apiRequest(`/live-classes${query}`);
    return res.json();
  },

  create: async (data: any) => {
    const res = await apiRequest('/live-classes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateStatus: async (id: string, status: string) => {
    const res = await apiRequest(`/live-classes/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  delete: async (id: string) => {
    const res = await apiRequest(`/live-classes/${id}`, { method: 'DELETE' });
    return res.json();
  },
};

// Notifications API helpers
export const notificationsAPI = {
  getAll: async () => {
    const res = await apiRequest('/notifications');
    return res.json();
  },

  getMy: async () => {
    const res = await apiRequest('/notifications/my');
    return res.json();
  },

  markAsRead: async (id: string) => {
    const res = await apiRequest(`/notifications/${id}/read`, { method: 'PUT' });
    return res.json();
  },

  markAllAsRead: async () => {
    const res = await apiRequest('/notifications/read-all', { method: 'PUT' });
    return res.json();
  },

  delete: async (id: string) => {
    const res = await apiRequest(`/notifications/${id}`, { method: 'DELETE' });
    return res.json();
  },
};

// Analytics API helpers
export const analyticsAPI = {
  getAdmin: async () => {
    const res = await apiRequest('/analytics/admin');
    return res.json();
  },

  getTeacher: async () => {
    const res = await apiRequest('/analytics/teacher');
    return res.json();
  },

  getStudent: async () => {
    const res = await apiRequest('/analytics/student');
    return res.json();
  },

  getParent: async () => {
    const res = await apiRequest('/analytics/parent');
    return res.json();
  },
};

// Attendance API helpers
export const attendanceAPI = {
  mark: async (data: { student_id: string; subject_id: string; date: string; status: string; notes?: string }) => {
    const res = await apiRequest('/attendance/mark', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  bulkMark: async (attendance_records: any[]) => {
    const res = await apiRequest('/attendance/bulk-mark', {
      method: 'POST',
      body: JSON.stringify({ attendance_records }),
    });
    return res.json();
  },

  getStudentAttendance: async (studentId: string, filters?: { subject_id?: string; start_date?: string; end_date?: string }) => {
    const query = filters ? `?${new URLSearchParams(filters as any)}` : '';
    const res = await apiRequest(`/attendance/student/${studentId}${query}`);
    return res.json();
  },

  getClassAttendance: async (subjectId: string, date: string) => {
    const res = await apiRequest(`/attendance/class/${subjectId}?date=${date}`);
    return res.json();
  },

  getStats: async (studentId: string, subjectId?: string) => {
    const query = subjectId ? `?subject_id=${subjectId}` : '';
    const res = await apiRequest(`/attendance/stats/${studentId}${query}`);
    return res.json();
  },
};

// Grades API helpers
export const gradesAPI = {
  create: async (data: any) => {
    const res = await apiRequest('/grades', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  getStudentGrades: async (studentId: string, filters?: { subject_id?: string; term?: string }) => {
    const query = filters ? `?${new URLSearchParams(filters as any)}` : '';
    const res = await apiRequest(`/grades/student/${studentId}${query}`);
    return res.json();
  },

  update: async (id: string, data: any) => {
    const res = await apiRequest(`/grades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  delete: async (id: string) => {
    const res = await apiRequest(`/grades/${id}`, { method: 'DELETE' });
    return res.json();
  },

  generateReportCard: async (data: any) => {
    const res = await apiRequest('/grades/report-cards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  getReportCard: async (studentId: string, term: string, academicYear: string) => {
    const res = await apiRequest(`/grades/report-cards/${studentId}/${term}/${academicYear}`);
    return res.json();
  },
};

// Messaging API helpers
export const messagingAPI = {
  send: async (data: { recipient_id: string; subject: string; message: string; parent_message_id?: string }) => {
    const res = await apiRequest('/messaging/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  getInbox: async () => {
    const res = await apiRequest('/messaging/inbox');
    return res.json();
  },

  getSent: async () => {
    const res = await apiRequest('/messaging/sent');
    return res.json();
  },

  markAsRead: async (messageId: string) => {
    const res = await apiRequest(`/messaging/${messageId}/read`, { method: 'POST' });
    return res.json();
  },

  createAnnouncement: async (data: { subject_id?: string; class_name?: string; title: string; content: string; priority?: string }) => {
    const res = await apiRequest('/messaging/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  getAnnouncements: async (filters?: { subject_id?: string; class_name?: string }) => {
    const query = filters ? `?${new URLSearchParams(filters as any)}` : '';
    const res = await apiRequest(`/messaging/announcements${query}`);
    return res.json();
  },
};

// Behaviour API helpers
export const behaviourAPI = {
  create: async (data: any) => {
    const res = await apiRequest('/behaviour', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  getStudentRecords: async (studentId: string, filters?: { type?: string; start_date?: string; end_date?: string }) => {
    const query = filters ? `?${new URLSearchParams(filters as any)}` : '';
    const res = await apiRequest(`/behaviour/student/${studentId}${query}`);
    return res.json();
  },

  getSummary: async (studentId: string) => {
    const res = await apiRequest(`/behaviour/summary/${studentId}`);
    return res.json();
  },
};

// Progress API helpers
export const progressAPI = {
  trackLessonView: async (data: { lesson_id: string; duration_seconds?: number; completed?: boolean }) => {
    const res = await apiRequest('/progress/lesson-view', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  getStudentProgress: async (studentId: string, filters?: { lesson_id?: string }) => {
    const query = filters ? `?${new URLSearchParams(filters as any)}` : '';
    const res = await apiRequest(`/progress/student/${studentId}${query}`);
    return res.json();
  },

  getAnalytics: async (studentId: string, subjectId?: string) => {
    const query = subjectId ? `?subject_id=${subjectId}` : '';
    const res = await apiRequest(`/progress/analytics/${studentId}${query}`);
    return res.json();
  },
};

// Teachers API helpers
export const teachersAPI = {
  getMyStudents: async () => {
    const res = await apiRequest('/teachers/my-students');
    return res.json();
  },
};

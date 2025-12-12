// API Configuration
// Update this URL to point to your deployed backend
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

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

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

  addChild: async (parentId: string, data: { name: string; grade?: string; school?: string }) => {
    const res = await apiRequest(`/users/${parentId}/children`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  getChildren: async (parentId: string) => {
    const res = await apiRequest(`/users/${parentId}/children`);
    return res.json();
  },
};

// Subjects API helpers
export const subjectsAPI = {
  getAll: async (grade?: string) => {
    const query = grade ? `?grade=${grade}` : '';
    const res = await apiRequest(`/subjects${query}`);
    return res.json();
  },

  getById: async (id: string) => {
    const res = await apiRequest(`/subjects/${id}`);
    return res.json();
  },

  create: async (data: { name: string; description?: string; icon?: string; color?: string; grade_level?: string }) => {
    const res = await apiRequest('/subjects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  update: async (id: string, data: Partial<{ name: string; description: string; is_active: boolean }>) => {
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
};

// Lessons API helpers
export const lessonsAPI = {
  getById: async (id: string) => {
    const res = await apiRequest(`/lessons/${id}`);
    return res.json();
  },

  complete: async (id: string) => {
    const res = await apiRequest(`/lessons/${id}/complete`, { method: 'POST' });
    return res.json();
  },

  create: async (data: { module_id: string; title: string; content?: string; video_url?: string; duration_minutes?: number }) => {
    const res = await apiRequest('/lessons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },
};

// Quizzes API helpers
export const quizzesAPI = {
  getById: async (id: string) => {
    const res = await apiRequest(`/quizzes/${id}`);
    return res.json();
  },

  submit: async (id: string, data: { answers: Record<string, string>; time_taken_minutes?: number }) => {
    const res = await apiRequest(`/quizzes/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  getAttempts: async (id: string) => {
    const res = await apiRequest(`/quizzes/${id}/attempts`);
    return res.json();
  },
};

// Payments API helpers
export const paymentsAPI = {
  initialize: async (data: { amount: number; plan: string; email: string }) => {
    const res = await apiRequest('/payments/initialize', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  verify: async (reference: string) => {
    const res = await apiRequest(`/payments/verify/${reference}`, { method: 'POST' });
    return res.json();
  },

  getHistory: async () => {
    const res = await apiRequest('/payments/history');
    return res.json();
  },

  getSubscription: async () => {
    const res = await apiRequest('/payments/subscription');
    return res.json();
  },
};

// Notifications API helpers
export const notificationsAPI = {
  getAll: async (unreadOnly?: boolean) => {
    const query = unreadOnly ? '?unread_only=true' : '';
    const res = await apiRequest(`/notifications${query}`);
    return res.json();
  },

  getCount: async () => {
    const res = await apiRequest('/notifications/count');
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

  broadcast: async (data: { role: string; title: string; message: string; type?: string }) => {
    const res = await apiRequest('/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify(data),
    });
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

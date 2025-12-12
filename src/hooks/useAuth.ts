import { useState, useEffect, useCallback } from 'react';

export type UserRole = 'student' | 'teacher' | 'parent' | 'admin';
export type ApprovalStatus = 'approved' | 'pending' | 'rejected';

export interface Child {
  id: string;
  name: string;
  age: number;
  grade: string;
  subjects: string[];
  avatar: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  children?: Child[];
  subscription?: {
    plan: 'single' | 'family' | null;
    status: 'active' | 'pending' | 'expired';
    expiresAt?: string;
  };
  onboardingComplete?: boolean;
  approvalStatus?: ApprovalStatus;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const STORAGE_KEY = 'lovable_auth';
const USERS_KEY = 'lovable_users';

// Default admin account
const DEFAULT_ADMIN: User = {
  id: 'admin_default',
  email: 'admin@elearning.com',
  name: 'System Administrator',
  role: 'admin',
  avatar: 'A',
  onboardingComplete: true,
  approvalStatus: 'approved',
  createdAt: new Date().toISOString(),
};

const DEFAULT_ADMIN_PASSWORD = 'admin123';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize default admin on first load
  useEffect(() => {
    const users = localStorage.getItem(USERS_KEY);
    const parsedUsers: User[] = users ? JSON.parse(users) : [];
    
    // Add default admin if not exists
    if (!parsedUsers.find(u => u.email === DEFAULT_ADMIN.email)) {
      parsedUsers.push(DEFAULT_ADMIN);
      localStorage.setItem(USERS_KEY, JSON.stringify(parsedUsers));
      localStorage.setItem(`pwd_${DEFAULT_ADMIN.id}`, DEFAULT_ADMIN_PASSWORD);
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setAuthState({ user, isAuthenticated: true, isLoading: false });
      } catch {
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      setAuthState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  const getUsers = useCallback((): User[] => {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  }, []);

  const saveUsers = useCallback((users: User[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return { success: false, error: 'No account found with this email' };
    }

    const storedPassword = localStorage.getItem(`pwd_${user.id}`);
    if (storedPassword !== password) {
      return { success: false, error: 'Incorrect password' };
    }

    // Check if teacher needs approval
    if (user.role === 'teacher' && user.approvalStatus !== 'approved') {
      if (user.approvalStatus === 'pending') {
        return { success: false, error: 'Your account is pending admin approval. Please wait for approval.' };
      }
      if (user.approvalStatus === 'rejected') {
        return { success: false, error: 'Your account has been rejected. Please contact support.' };
      }
    }

    // Check if admin is trying to login through regular login
    if (user.role === 'admin') {
      return { success: false, error: 'Admins must use the admin login portal' };
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    setAuthState({ user, isAuthenticated: true, isLoading: false });
    return { success: true };
  }, [getUsers]);

  const adminLogin = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return { success: false, error: 'No admin account found with this email' };
    }

    if (user.role !== 'admin') {
      return { success: false, error: 'This account is not an admin account' };
    }

    const storedPassword = localStorage.getItem(`pwd_${user.id}`);
    if (storedPassword !== password) {
      return { success: false, error: 'Incorrect password' };
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    setAuthState({ user, isAuthenticated: true, isLoading: false });
    return { success: true };
  }, [getUsers]);

  const register = useCallback(async (
    data: { name: string; email: string; password: string; role: UserRole; phone?: string }
  ): Promise<{ success: boolean; error?: string; user?: User }> => {
    const users = getUsers();
    
    if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists' };
    }

    // Teachers require approval, others are auto-approved
    const needsApproval = data.role === 'teacher';

    const newUser: User = {
      id: `user_${Date.now()}`,
      email: data.email,
      name: data.name,
      role: data.role,
      phone: data.phone,
      avatar: data.name.charAt(0).toUpperCase(),
      children: data.role === 'parent' ? [] : undefined,
      subscription: data.role === 'parent' ? { plan: null, status: 'pending' } : undefined,
      onboardingComplete: data.role !== 'parent',
      approvalStatus: needsApproval ? 'pending' : 'approved',
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(`pwd_${newUser.id}`, data.password);
    saveUsers([...users, newUser]);

    // Don't auto-login teachers who need approval
    if (needsApproval) {
      return { success: true, user: newUser };
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setAuthState({ user: newUser, isAuthenticated: true, isLoading: false });
    
    return { success: true, user: newUser };
  }, [getUsers, saveUsers]);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAuthState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    if (!authState.user) return;
    
    const updatedUser = { ...authState.user, ...updates };
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === updatedUser.id);
    
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      saveUsers(users);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    setAuthState({ user: updatedUser, isAuthenticated: true, isLoading: false });
  }, [authState.user, getUsers, saveUsers]);

  // Admin functions
  const getAllUsers = useCallback((): User[] => {
    return getUsers();
  }, [getUsers]);

  const approveUser = useCallback((userId: string) => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].approvalStatus = 'approved';
      saveUsers(users);
    }
  }, [getUsers, saveUsers]);

  const rejectUser = useCallback((userId: string) => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].approvalStatus = 'rejected';
      saveUsers(users);
    }
  }, [getUsers, saveUsers]);

  const deleteUser = useCallback((userId: string) => {
    const users = getUsers();
    const filteredUsers = users.filter(u => u.id !== userId);
    saveUsers(filteredUsers);
    localStorage.removeItem(`pwd_${userId}`);
  }, [getUsers, saveUsers]);

  const updateUserByAdmin = useCallback((userId: string, updates: Partial<User>) => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      saveUsers(users);
    }
  }, [getUsers, saveUsers]);

  const addChild = useCallback((child: Omit<Child, 'id' | 'createdAt' | 'avatar'>) => {
    if (!authState.user || authState.user.role !== 'parent') return;
    
    const newChild: Child = {
      ...child,
      id: `child_${Date.now()}`,
      avatar: child.name.charAt(0).toUpperCase(),
      createdAt: new Date().toISOString(),
    };
    
    const updatedChildren = [...(authState.user.children || []), newChild];
    updateUser({ children: updatedChildren });
    return newChild;
  }, [authState.user, updateUser]);

  const updateChild = useCallback((childId: string, updates: Partial<Child>) => {
    if (!authState.user || !authState.user.children) return;
    
    const updatedChildren = authState.user.children.map(child =>
      child.id === childId ? { ...child, ...updates } : child
    );
    updateUser({ children: updatedChildren });
  }, [authState.user, updateUser]);

  const removeChild = useCallback((childId: string) => {
    if (!authState.user || !authState.user.children) return;
    
    const updatedChildren = authState.user.children.filter(child => child.id !== childId);
    updateUser({ children: updatedChildren });
  }, [authState.user, updateUser]);

  const completeOnboarding = useCallback(() => {
    updateUser({ onboardingComplete: true });
  }, [updateUser]);

  const updateSubscription = useCallback((plan: 'single' | 'family', status: 'active' | 'pending' | 'expired') => {
    updateUser({
      subscription: {
        plan,
        status,
        expiresAt: status === 'active' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      }
    });
  }, [updateUser]);

  return {
    ...authState,
    login,
    adminLogin,
    register,
    logout,
    updateUser,
    addChild,
    updateChild,
    removeChild,
    completeOnboarding,
    updateSubscription,
    // Admin functions
    getAllUsers,
    approveUser,
    rejectUser,
    deleteUser,
    updateUserByAdmin,
  };
}

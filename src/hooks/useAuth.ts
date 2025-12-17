import { useState, useEffect, useCallback } from 'react';
import { authAPI, usersAPI } from '@/config/api';

export type UserRole = 'student' | 'teacher' | 'parent' | 'admin';
export type ApprovalStatus = 'approved' | 'pending' | 'rejected';

export interface Child {
  id: string;
  name: string;
  email: string;
  age: number;
  grade: string;
  studentClass?: string;
  school?: string;
  phone?: string;
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
  is_approved?: boolean; // Backend field
  is_onboarded?: boolean; // Backend field
  is_super_admin?: boolean;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const STORAGE_KEY = 'lovable_auth';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check auth on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
        // Stop loading if no token
        return;
      }

      try {
        const { user } = await authAPI.getCurrentUser();
        setAuthState({ user, isAuthenticated: true, isLoading: false });
      } catch (error: any) {
        console.error('Auth initialization failed:', error);
        // Only clear token if it's an auth error (401)
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          setAuthState({ user: null, isAuthenticated: false, isLoading: false });
        } else {
          // Keep the token but stop loading - user might need to retry or refresh
          setAuthState({ user: null, isAuthenticated: false, isLoading: false });
        }
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      const { user, token } = await authAPI.login(email, password);
      localStorage.setItem('auth_token', token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      setAuthState({ user, isAuthenticated: true, isLoading: false });
      return { success: true, user };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Login failed. Please check your credentials.'
      };
    }
  }, []);

  const adminLogin = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      const { user, token } = await authAPI.adminLogin(email, password);
      localStorage.setItem('auth_token', token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      setAuthState({ user, isAuthenticated: true, isLoading: false });
      return { success: true, user };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Admin login failed.'
      };
    }
  }, []);

  const register = useCallback(async (
    data: {
      name: string;
      email: string;
      password: string;
      role: UserRole;
      phone?: string;
      // Teacher specific fields
      school?: string;
      yearsOfExperience?: number;
      address?: string;
      subjectId?: string;
      bio?: string;
      qualifications?: string;
      // Student specific fields
      age?: number;
      studentClass?: string;
    }
  ): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      const { user, token } = await authAPI.register(data);

      // If no token returned (e.g. pending approval), don't set auth state
      if (token) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        setAuthState({ user, isAuthenticated: true, isLoading: false });
      }

      return { success: true, user };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Registration failed.'
      };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem(STORAGE_KEY);
    setAuthState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (!authState.user) return;

    try {
      // Optimistic update
      const updatedUser = { ...authState.user, ...updates };
      setAuthState(prev => ({ ...prev, user: updatedUser }));

      // Call API to persist
      await usersAPI.update(authState.user.id, updates as any);

      // Force refresh from server to be sure
      const { user } = await authAPI.getCurrentUser();
      setAuthState(prev => ({ ...prev, user }));

    } catch (error) {
      console.error('Failed to update user:', error);
    }
  }, [authState.user]);

  // Admin functions
  const getAllUsers = useCallback(async (): Promise<User[]> => {
    try {
      const users = await usersAPI.getAll();
      return users;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return [];
    }
  }, []);

  const approveUser = useCallback(async (userId: string) => {
    try {
      await usersAPI.approve(userId);
    } catch (error) {
      console.error('Failed to approve user:', error);
    }
  }, []);

  const rejectUser = useCallback(async (userId: string) => {
    try {
      await usersAPI.reject(userId);
    } catch (error) {
      console.error('Failed to reject user:', error);
    }
  }, []);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      await usersAPI.delete(userId);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  }, []);

  const updateUserByAdmin = useCallback(async (userId: string, updates: Partial<User>) => {
    try {
      await usersAPI.update(userId, updates as any);
    } catch (error) {
      console.error('Failed to update user by admin:', error);
    }
  }, []);

  const addChild = useCallback(async (child: Omit<Child, 'id' | 'createdAt' | 'avatar'>) => {
    if (!authState.user || authState.user.role !== 'parent') return;

    try {
      const response = await usersAPI.addChild(child);
      const newChild = response.child || response; // Handle both formats

      // Update local state
      const updatedChildren = [...(authState.user.children || []), newChild];
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, children: updatedChildren } : null
      }));

      return newChild;
    } catch (error) {
      console.error('Failed to add child:', error);
    }
  }, [authState.user]);

  // These are placeholders until API supports them or we combine them into updates
  const updateChild = useCallback(async (childId: string, updates: Partial<Child>) => {
    if (!authState.user || !authState.user.children) return;
    // For now, no specific API endpoint for updateChild in usersAPI, 
    // but in a real app we'd have /users/:userId/children/:childId or similar.
    // We'll skip implementation or assume it's part of generic update for now to avoid errors.
    console.warn('updateChild API not implemented yet');
  }, [authState.user]);

  const removeChild = useCallback(async (childId: string) => {
    console.warn('removeChild API not implemented yet');
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      // Mark onboarding complete on the backend
      await authAPI.completeOnboarding();

      // Refresh current user from backend so is_onboarded and other flags are accurate
      const { user } = await authAPI.getCurrentUser();

      setAuthState({
        user: user ? { ...user, onboardingComplete: true } : null,
        isAuthenticated: !!user,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  }, []);

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
    getAllUsers: getAllUsers as any,
    approveUser,
    rejectUser,
    deleteUser,
    updateUserByAdmin,
  };
}

// Export useAuthContext for components that need it
export const useAuthContext = useAuth;


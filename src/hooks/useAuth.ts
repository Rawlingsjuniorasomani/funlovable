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
  school?: string;
  avatar?: string;
  children?: Child[];
  subscription?: {
    plan: string | null;
    status: 'active' | 'pending' | 'expired';
    expiresAt?: string;
  };
  onboardingComplete?: boolean;
  approvalStatus?: ApprovalStatus;
  is_approved?: boolean;
  is_onboarded?: boolean;
  is_super_admin?: boolean;
  createdAt: string;
  bio?: string;
  department?: string;
  subjects_taught?: string;
  employee_id?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });


  useEffect(() => {
    const initAuth = async () => {
      try {
        const { user } = await authAPI.getCurrentUser();
        setAuthState({ user, isAuthenticated: !!user, isLoading: false });
      } catch (error) {
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      const { user } = await authAPI.login(email, password);
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
      const { user } = await authAPI.adminLogin(email, password);
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

      school?: string;
      yearsOfExperience?: number;
      address?: string;
      subjectId?: string;
      bio?: string;
      qualifications?: string;

      age?: number;
      studentClass?: string;
    }
  ): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      const { user, token } = await authAPI.register(data);


      if (token) {
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

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      console.error(e);
    }
    setAuthState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (!authState.user) return;

    try {

      const updatedUser = { ...authState.user, ...updates };
      setAuthState(prev => ({ ...prev, user: updatedUser }));


      await usersAPI.update(authState.user.id, updates as any);


      const { user } = await authAPI.getCurrentUser();
      setAuthState(prev => ({ ...prev, user }));

    } catch (error) {
      console.error('Failed to update user:', error);
    }
  }, [authState.user]);


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
      const newChild = response.child || response;


      try {
        const { user: refreshedUser } = await authAPI.getCurrentUser();
        setAuthState(prev => ({
          ...prev,
          user: refreshedUser
        }));
        return newChild;
      } catch (refreshErr) {
        console.warn('Could not refresh user after addChild, using local update:', refreshErr);

        const updatedChildren = [...(authState.user.children || []), newChild];
        setAuthState(prev => ({
          ...prev,
          user: prev.user ? { ...prev.user, children: updatedChildren } : null
        }));
        return newChild;
      }
    } catch (error) {
      console.error('Failed to add child:', error);
      throw error;
    }
  }, [authState.user]);


  const updateChild = useCallback(async (childId: string, updates: Partial<Child>) => {
    if (!authState.user || !authState.user.children) return;



    console.warn('updateChild API not implemented yet');
  }, [authState.user]);

  const removeChild = useCallback(async (childId: string) => {
    console.warn('removeChild API not implemented yet');
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {

      await authAPI.completeOnboarding();


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

  const updateSubscription = useCallback((plan: string, status: 'active' | 'pending' | 'expired') => {
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

    getAllUsers: getAllUsers as any,
    approveUser,
    rejectUser,
    deleteUser,
    updateUserByAdmin,
  };
}




import { createContext, useContext, ReactNode } from 'react';
import { useAuth, User, Child, UserRole } from '@/hooks/useAuth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  register: (data: {
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
  }) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
  addChild: (child: Omit<Child, 'id' | 'createdAt' | 'avatar'>) => Promise<Child | undefined>;
  updateChild: (childId: string, updates: Partial<Child>) => Promise<void>;
  removeChild: (childId: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  updateSubscription: (plan: 'single' | 'family', status: 'active' | 'pending' | 'expired') => void;
  // Admin functions
  getAllUsers: () => Promise<User[]>;
  approveUser: (userId: string) => Promise<void>;
  rejectUser: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  updateUserByAdmin: (userId: string, updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    adminLogin,
    register,
    logout,
    updateUser,
    addChild,
    updateChild,
    removeChild, // Added removeChild
    completeOnboarding,
    updateSubscription,
    getAllUsers,
    approveUser,
    rejectUser,
    deleteUser,
    updateUserByAdmin
  } = useAuth();

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      adminLogin,
      register,
      logout,
      updateUser,
      addChild,
      updateChild,
      removeChild, // Added removeChild
      completeOnboarding,
      updateSubscription,
      getAllUsers, // Exposed admin functions
      approveUser,
      rejectUser,
      deleteUser,
      updateUserByAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

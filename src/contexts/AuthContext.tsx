import { createContext, useContext, ReactNode } from 'react';
import { useAuth, User, Child, UserRole } from '@/hooks/useAuth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; email: string; password: string; role: UserRole; phone?: string }) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  addChild: (child: Omit<Child, 'id' | 'createdAt' | 'avatar'>) => Child | undefined;
  updateChild: (childId: string, updates: Partial<Child>) => void;
  removeChild: (childId: string) => void;
  completeOnboarding: () => void;
  updateSubscription: (plan: 'single' | 'family', status: 'active' | 'pending' | 'expired') => void;
  // Admin functions
  getAllUsers: () => User[];
  approveUser: (userId: string) => void;
  rejectUser: (userId: string) => void;
  deleteUser: (userId: string) => void;
  updateUserByAdmin: (userId: string, updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  
  return (
    <AuthContext.Provider value={auth}>
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

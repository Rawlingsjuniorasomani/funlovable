










import { create } from 'zustand';

export interface ParentAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  subscriptionId?: string;
}

export interface ParentSubscription {
  id: string;
  parentId: string;
  parentName: string;
  parentEmail: string;
  plan: 'single' | 'family';
  planName: string;
  amount: number;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  startDate: string;
  expiresAt: string;
  paymentMethod?: string;
  autoRenew: boolean;
}

export interface ParentPayment {
  id: string;
  parentId: string;
  parentName: string;
  parentEmail: string;
  subscriptionId?: string;
  plan: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  date: string;
  paymentMethod?: string;
}

export interface LinkedChild {
  id: string;
  parentId: string;
  childId: string;
  childName: string;
  childEmail: string;
  role: 'student';
  linkedAt: string;
  grade?: string;
  class?: string;
}

export interface LinkedTeacher {
  id: string;
  parentId: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  subject?: string;
  linkedAt: string;
  linkedFor: string; 
}

interface ParentDataState {
  parents: ParentAccount[];
  subscriptions: ParentSubscription[];
  payments: ParentPayment[];
  linkedChildren: LinkedChild[];
  linkedTeachers: LinkedTeacher[];

  
  registerParent: (parent: Omit<ParentAccount, 'id' | 'createdAt'>) => ParentAccount;
  updateParent: (id: string, data: Partial<ParentAccount>) => void;

  
  createSubscription: (sub: Omit<ParentSubscription, 'id'>) => ParentSubscription;
  updateSubscription: (id: string, data: Partial<ParentSubscription>) => void;
  cancelSubscription: (id: string) => void;

  
  addPayment: (payment: Omit<ParentPayment, 'id'>) => ParentPayment;
  updatePayment: (id: string, data: Partial<ParentPayment>) => void;

  
  linkChild: (data: Omit<LinkedChild, 'id' | 'linkedAt'>) => LinkedChild;
  unlinkChild: (id: string) => void;

  
  linkTeacher: (data: Omit<LinkedTeacher, 'id' | 'linkedAt'>) => LinkedTeacher;
  unlinkTeacher: (id: string) => void;

  
  getAllSubscriptions: () => ParentSubscription[];
  getAllPayments: () => ParentPayment[];
  getParentChildren: (parentId: string) => LinkedChild[];
  getParentTeachers: (parentId: string) => LinkedTeacher[];
  getRecentActivity: () => { type: string; description: string; date: string }[];
}

const generateId = () => Math.random().toString(36).substr(2, 9);


const initialParents: ParentAccount[] = [];

const initialSubscriptions: ParentSubscription[] = [];

const initialPayments: ParentPayment[] = [];

const initialChildren: LinkedChild[] = [];

const initialTeachers: LinkedTeacher[] = [];

export const useParentData = create<ParentDataState>((set, get) => ({
  parents: initialParents,
  subscriptions: initialSubscriptions,
  payments: initialPayments,
  linkedChildren: initialChildren,
  linkedTeachers: initialTeachers,

  registerParent: (parent) => {
    const newParent: ParentAccount = {
      ...parent,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ parents: [...state.parents, newParent] }));
    return newParent;
  },

  updateParent: (id, data) => {
    set((state) => ({
      parents: state.parents.map(p => p.id === id ? { ...p, ...data } : p)
    }));
  },

  createSubscription: (sub) => {
    const newSub: ParentSubscription = { ...sub, id: generateId() };
    set((state) => ({ subscriptions: [...state.subscriptions, newSub] }));
    return newSub;
  },

  updateSubscription: (id, data) => {
    set((state) => ({
      subscriptions: state.subscriptions.map(s => s.id === id ? { ...s, ...data } : s)
    }));
  },

  cancelSubscription: (id) => {
    set((state) => ({
      subscriptions: state.subscriptions.map(s =>
        s.id === id ? { ...s, status: 'cancelled' as const } : s
      )
    }));
  },

  addPayment: (payment) => {
    const newPayment: ParentPayment = { ...payment, id: generateId() };
    set((state) => ({ payments: [...state.payments, newPayment] }));
    return newPayment;
  },

  updatePayment: (id, data) => {
    set((state) => ({
      payments: state.payments.map(p => p.id === id ? { ...p, ...data } : p)
    }));
  },

  linkChild: (data) => {
    const newLink: LinkedChild = {
      ...data,
      id: generateId(),
      linkedAt: new Date().toISOString(),
    };
    set((state) => ({ linkedChildren: [...state.linkedChildren, newLink] }));
    return newLink;
  },

  unlinkChild: (id) => {
    set((state) => ({
      linkedChildren: state.linkedChildren.filter(c => c.id !== id)
    }));
  },

  linkTeacher: (data) => {
    const newLink: LinkedTeacher = {
      ...data,
      id: generateId(),
      linkedAt: new Date().toISOString(),
    };
    set((state) => ({ linkedTeachers: [...state.linkedTeachers, newLink] }));
    return newLink;
  },

  unlinkTeacher: (id) => {
    set((state) => ({
      linkedTeachers: state.linkedTeachers.filter(t => t.id !== id)
    }));
  },

  getAllSubscriptions: () => get().subscriptions,
  getAllPayments: () => get().payments,
  getParentChildren: (parentId) => get().linkedChildren.filter(c => c.parentId === parentId),
  getParentTeachers: (parentId) => get().linkedTeachers.filter(t => t.parentId === parentId),

  getRecentActivity: () => {
    const activities: { type: string; description: string; date: string }[] = [];

    get().payments.slice(-5).forEach(p => {
      activities.push({
        type: 'payment',
        description: `${p.parentName} made a $${p.amount} payment`,
        date: p.date
      });
    });

    get().linkedChildren.slice(-5).forEach(c => {
      activities.push({
        type: 'child',
        description: `${c.childName} was added as a student`,
        date: c.linkedAt
      });
    });

    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
  },
}));


export const recordPayment = (payment: ParentPayment) => {
  console.warn("recordPayment is deprecated. Use paymentsAPI instead.");
};

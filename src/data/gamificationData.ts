export interface LeaderboardEntry {
  id: string;
  name: string;
  grade: string;
  level: number;
  xp: number;
  streak: number;
  quizzesCompleted: number;
  avgScore: number;
  avatar: string;
  rank?: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: any;
  unlocked: boolean;
  dateEarned?: string;
}

export interface Certificate {
  id: string;
  subject: string;
  level: string;
  teacher: string;
  dateEarned: string;
}







export const LEADERBOARD_DATA: LeaderboardEntry[] = [];

export const BADGES: Badge[] = [];

export const CERTIFICATES: Certificate[] = [];

export const getCurrentStudentStats = () => {
  
  return {
    xp: 0,
    streak: 0,
  } as { xp: number; streak: number };
};

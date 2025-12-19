import { useState, useEffect, useCallback } from "react";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  type: "quizzes" | "lessons" | "streak" | "perfect" | "xp";
  unlockedAt?: string;
}

export interface GamificationState {
  xp: number;
  level: number;
  streak: number;
  lastActivity: string;
  quizzesCompleted: number;
  lessonsCompleted: number;
  perfectScores: number;
  achievements: string[];
}

const XP_PER_LEVEL = 500;
const XP_REWARDS = {
  quizComplete: 50,
  lessonComplete: 30,
  perfectScore: 100,
  streakBonus: 25,
  correctAnswer: 10,
};

export const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: "first_quiz", name: "Quiz Starter", description: "Complete your first quiz", icon: "🎯", requirement: 1, type: "quizzes" },
  { id: "quiz_master", name: "Quiz Master", description: "Complete 10 quizzes", icon: "🏆", requirement: 10, type: "quizzes" },
  { id: "quiz_legend", name: "Quiz Legend", description: "Complete 50 quizzes", icon: "👑", requirement: 50, type: "quizzes" },
  { id: "first_lesson", name: "Knowledge Seeker", description: "Complete your first lesson", icon: "📚", requirement: 1, type: "lessons" },
  { id: "lesson_pro", name: "Lesson Pro", description: "Complete 10 lessons", icon: "🎓", requirement: 10, type: "lessons" },
  { id: "perfect_one", name: "Perfectionist", description: "Get a perfect score on a quiz", icon: "⭐", requirement: 1, type: "perfect" },
  { id: "perfect_five", name: "Flawless", description: "Get 5 perfect scores", icon: "💎", requirement: 5, type: "perfect" },
  { id: "streak_3", name: "On Fire", description: "Maintain a 3-day streak", icon: "🔥", requirement: 3, type: "streak" },
  { id: "streak_7", name: "Unstoppable", description: "Maintain a 7-day streak", icon: "⚡", requirement: 7, type: "streak" },
  { id: "streak_30", name: "Dedicated Learner", description: "Maintain a 30-day streak", icon: "🌟", requirement: 30, type: "streak" },
  { id: "xp_1000", name: "Rising Star", description: "Earn 1,000 XP", icon: "✨", requirement: 1000, type: "xp" },
  { id: "xp_5000", name: "Superstar", description: "Earn 5,000 XP", icon: "🌠", requirement: 5000, type: "xp" },
  { id: "xp_10000", name: "Legend", description: "Earn 10,000 XP", icon: "🏅", requirement: 10000, type: "xp" },
];

const defaultState: GamificationState = {
  xp: 0,
  level: 1,
  streak: 0,
  lastActivity: "",
  quizzesCompleted: 0,
  lessonsCompleted: 0,
  perfectScores: 0,
  achievements: [],
};

export function useGamification() {
  const [state, setState] = useState<GamificationState>(defaultState);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  // No localStorage persistence - state resets on page reload
  // In production, gamification data should come from backend API

  const saveState = useCallback((newState: GamificationState) => {
    // Store in memory only (not localStorage)
    setState(newState);
  }, []);

  const calculateLevel = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1;

  const checkAchievements = useCallback((currentState: GamificationState): string[] => {
    const newUnlocked: string[] = [];
    
    ALL_ACHIEVEMENTS.forEach((achievement) => {
      if (currentState.achievements.includes(achievement.id)) return;
      
      let unlocked = false;
      switch (achievement.type) {
        case "quizzes":
          unlocked = currentState.quizzesCompleted >= achievement.requirement;
          break;
        case "lessons":
          unlocked = currentState.lessonsCompleted >= achievement.requirement;
          break;
        case "perfect":
          unlocked = currentState.perfectScores >= achievement.requirement;
          break;
        case "streak":
          unlocked = currentState.streak >= achievement.requirement;
          break;
        case "xp":
          unlocked = currentState.xp >= achievement.requirement;
          break;
      }
      
      if (unlocked) {
        newUnlocked.push(achievement.id);
      }
    });
    
    return newUnlocked;
  }, []);

  const updateStreak = useCallback((currentState: GamificationState): GamificationState => {
    const today = new Date().toDateString();
    const lastDate = currentState.lastActivity ? new Date(currentState.lastActivity).toDateString() : "";
    
    if (lastDate === today) {
      return currentState;
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isConsecutive = lastDate === yesterday.toDateString();
    
    return {
      ...currentState,
      streak: isConsecutive ? currentState.streak + 1 : 1,
      lastActivity: new Date().toISOString(),
    };
  }, []);

  const addXP = useCallback((amount: number, reason: string) => {
    setState((prev) => {
      let updated = updateStreak(prev);
      const streakBonus = updated.streak >= 3 ? XP_REWARDS.streakBonus : 0;
      const totalXP = updated.xp + amount + streakBonus;
      
      updated = {
        ...updated,
        xp: totalXP,
        level: calculateLevel(totalXP),
      };
      
      const newUnlocked = checkAchievements(updated);
      if (newUnlocked.length > 0) {
        updated.achievements = [...updated.achievements, ...newUnlocked];
        const unlockedAchievements = ALL_ACHIEVEMENTS.filter((a) => newUnlocked.includes(a.id));
        setNewAchievements(unlockedAchievements);
      }
      
      saveState(updated);
      return updated;
    });
  }, [checkAchievements, saveState, updateStreak]);

  const completeQuiz = useCallback((score: number, total: number) => {
    const isPerfect = score === total;
    const baseXP = XP_REWARDS.quizComplete + (score * XP_REWARDS.correctAnswer);
    const perfectBonus = isPerfect ? XP_REWARDS.perfectScore : 0;
    
    setState((prev) => {
      let updated = updateStreak(prev);
      const totalXP = updated.xp + baseXP + perfectBonus;
      
      updated = {
        ...updated,
        xp: totalXP,
        level: calculateLevel(totalXP),
        quizzesCompleted: updated.quizzesCompleted + 1,
        perfectScores: isPerfect ? updated.perfectScores + 1 : updated.perfectScores,
      };
      
      const newUnlocked = checkAchievements(updated);
      if (newUnlocked.length > 0) {
        updated.achievements = [...updated.achievements, ...newUnlocked];
        const unlockedAchievements = ALL_ACHIEVEMENTS.filter((a) => newUnlocked.includes(a.id));
        setNewAchievements(unlockedAchievements);
      }
      
      saveState(updated);
      return updated;
    });
    
    return baseXP + perfectBonus;
  }, [checkAchievements, saveState, updateStreak]);

  const completeLesson = useCallback(() => {
    setState((prev) => {
      let updated = updateStreak(prev);
      const totalXP = updated.xp + XP_REWARDS.lessonComplete;
      
      updated = {
        ...updated,
        xp: totalXP,
        level: calculateLevel(totalXP),
        lessonsCompleted: updated.lessonsCompleted + 1,
      };
      
      const newUnlocked = checkAchievements(updated);
      if (newUnlocked.length > 0) {
        updated.achievements = [...updated.achievements, ...newUnlocked];
        const unlockedAchievements = ALL_ACHIEVEMENTS.filter((a) => newUnlocked.includes(a.id));
        setNewAchievements(unlockedAchievements);
      }
      
      saveState(updated);
      return updated;
    });
    
    return XP_REWARDS.lessonComplete;
  }, [checkAchievements, saveState, updateStreak]);

  const clearNewAchievements = useCallback(() => {
    setNewAchievements([]);
  }, []);

  const getXPToNextLevel = () => {
    const currentLevelXP = (state.level - 1) * XP_PER_LEVEL;
    const nextLevelXP = state.level * XP_PER_LEVEL;
    return {
      current: state.xp - currentLevelXP,
      required: XP_PER_LEVEL,
      total: nextLevelXP - state.xp,
    };
  };

  return {
    ...state,
    newAchievements,
    addXP,
    completeQuiz,
    completeLesson,
    clearNewAchievements,
    getXPToNextLevel,
    XP_REWARDS,
  };
}

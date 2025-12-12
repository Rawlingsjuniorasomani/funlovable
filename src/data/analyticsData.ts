// Mock analytics data store for localStorage-based analytics

const ANALYTICS_KEY = "lovable_analytics";

export interface AnalyticsEvent {
  id: string;
  type: "registration" | "payment" | "login" | "quiz_completed" | "lesson_viewed" | "class_attended";
  userId?: string;
  userType: "student" | "parent" | "teacher" | "admin";
  amount?: number;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface DailyStats {
  date: string;
  registrations: number;
  payments: number;
  revenue: number;
  activeUsers: number;
  quizzes: number;
  lessonsViewed: number;
}

// Generate mock data for the last 30 days
function generateMockData(): { events: AnalyticsEvent[]; dailyStats: DailyStats[] } {
  const events: AnalyticsEvent[] = [];
  const dailyStats: DailyStats[] = [];

  const now = new Date();

  // Return empty data
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    dailyStats.push({
      date: dateStr,
      registrations: 0,
      payments: 0,
      revenue: 0,
      activeUsers: 0,
      quizzes: 0,
      lessonsViewed: 0,
    });
  }

  return { events, dailyStats };
}

export function getAnalyticsData(): { events: AnalyticsEvent[]; dailyStats: DailyStats[] } {
  const stored = localStorage.getItem(ANALYTICS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }

  const data = generateMockData();
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
  return data;
}

export function recordEvent(event: Omit<AnalyticsEvent, "id" | "timestamp">): AnalyticsEvent {
  const data = getAnalyticsData();
  const newEvent: AnalyticsEvent = {
    ...event,
    id: `event_${Date.now()}`,
    timestamp: new Date().toISOString(),
  };

  data.events.push(newEvent);

  // Update daily stats
  const today = new Date().toISOString().split('T')[0];
  let todayStats = data.dailyStats.find(s => s.date === today);

  if (!todayStats) {
    todayStats = {
      date: today,
      registrations: 0,
      payments: 0,
      revenue: 0,
      activeUsers: 0,
      quizzes: 0,
      lessonsViewed: 0,
    };
    data.dailyStats.push(todayStats);
  }

  switch (event.type) {
    case "registration":
      todayStats.registrations++;
      break;
    case "payment":
      todayStats.payments++;
      todayStats.revenue += event.amount || 0;
      break;
    case "quiz_completed":
      todayStats.quizzes++;
      break;
    case "lesson_viewed":
      todayStats.lessonsViewed++;
      break;
    case "login":
      todayStats.activeUsers++;
      break;
  }

  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
  return newEvent;
}

export function getOverviewMetrics() {
  const { dailyStats } = getAnalyticsData();
  const last7Days = dailyStats.slice(-7);
  const previous7Days = dailyStats.slice(-14, -7);

  const current = {
    registrations: last7Days.reduce((sum, d) => sum + d.registrations, 0),
    revenue: last7Days.reduce((sum, d) => sum + d.revenue, 0),
    activeUsers: Math.round(last7Days.reduce((sum, d) => sum + d.activeUsers, 0) / 7),
    quizzes: last7Days.reduce((sum, d) => sum + d.quizzes, 0),
  };

  const previous = {
    registrations: previous7Days.reduce((sum, d) => sum + d.registrations, 0),
    revenue: previous7Days.reduce((sum, d) => sum + d.revenue, 0),
    activeUsers: Math.round(previous7Days.reduce((sum, d) => sum + d.activeUsers, 0) / 7),
    quizzes: previous7Days.reduce((sum, d) => sum + d.quizzes, 0),
  };

  const calculateChange = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  };

  return {
    registrations: { value: current.registrations, change: calculateChange(current.registrations, previous.registrations) },
    revenue: { value: current.revenue, change: calculateChange(current.revenue, previous.revenue) },
    activeUsers: { value: current.activeUsers, change: calculateChange(current.activeUsers, previous.activeUsers) },
    quizzes: { value: current.quizzes, change: calculateChange(current.quizzes, previous.quizzes) },
  };
}

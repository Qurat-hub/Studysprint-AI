export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Difficulty = 'easy' | 'moderate' | 'hard' | 'extreme';
export type Status = 'todo' | 'in_progress' | 'completed' | 'archived';

export interface Assignment {
  id: string;
  title: string;
  course: string;
  description: string;
  deadline: string; // ISO date string
  priority: Priority;
  difficulty: Difficulty;
  estimatedHours: number;
  status: Status;
  progress: number; // 0 to 100
  tags: string[];
  attachments?: string[];
  createdAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  deadline: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  subject: string;
  description: string;
  milestones: Milestone[];
  deadline: string;
  members: string[];
  checklist: { id: string; text: string; completed: boolean }[];
  progress: number;
  resources: { name: string; url: string }[];
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  course: string;
  content: string;
  category: string;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'assignment' | 'exam' | 'study_session' | 'project';
  course: string;
  date: string; // YYYY-MM-DD
  time?: string;
  color?: string;
  completed?: boolean;
}

export interface StudySessionLog {
  id: string;
  date: string;
  durationMinutes: number;
  type: 'pomodoro' | 'custom' | 'focus_mode';
  subject: string;
  notes?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  university: string;
  degree: string;
  semester: string;
  major: string;
  interests: string[];
  studyGoals: string[];
  preferredStudyHours: string;
  xp: number;
  level: number;
  streak: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  isUnlocked: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'deadline' | 'exam' | 'reminder' | 'ai' | 'streak';
  timestamp: string;
  isRead: boolean;
}

// AI Plan Structure Output Types
export interface AIScheduleItem {
  timeSlot: string;
  task: string;
  course: string;
  focusArea: string;
  recommendedDurationMinutes: number;
}

export interface AIStudyPlanResult {
  summary: string;
  priorityAnalysis: {
    urgent: string[];
    important: string[];
    flexible: string[];
  };
  dailyPlan: AIScheduleItem[];
  taskBreakdown: {
    taskName: string;
    course: string;
    estimatedHours: number;
    subtasks: string[];
  }[];
  revisionPlan: string[];
  motivationalAdvice: string;
  productivityTips: string[];
  totalEstimatedHours: number;
}

export interface AIAssignmentHelperResult {
  summary: string;
  importantTopics: string[];
  checklist: string[];
  recommendedResources: { title: string; description: string }[];
  suggestedTimeline: { day: string; goal: string }[];
  difficultyEstimation: string;
  estimatedHours: number;
}

export interface AIExamPlannerResult {
  overallStrategy: string;
  dailyTimetable: { day: string; subject: string; topic: string; duration: string }[];
  revisionSessions: string[];
  practiceSessions: string[];
  mockTestSchedule: string[];
}

export interface AIProductivityCoachResult {
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
  weeklySuggestions: string[];
  recommendedStudyHabits: string[];
  motivation: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  structuredCard?: AIStudyPlanResult | AIAssignmentHelperResult | AIExamPlannerResult | AIProductivityCoachResult;
}

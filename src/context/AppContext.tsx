import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import {
  Assignment,
  Project,
  Note,
  CalendarEvent,
  UserProfile,
  StudySessionLog,
  AppNotification,
  ChatMessage,
} from '../types';

export type NavTab =
  | 'dashboard'
  | 'assignments'
  | 'projects'
  | 'planner'
  | 'calendar'
  | 'ai_assistant'
  | 'notes'
  | 'timer'
  | 'analytics'
  | 'settings'
  | 'profile';

export const defaultEmptyProfile: UserProfile = {
  id: '',
  name: 'Student',
  email: '',
  avatar: '',
  university: 'University / College',
  degree: 'Degree Program',
  semester: 'Current Term',
  major: 'General Studies',
  interests: [],
  studyGoals: [],
  preferredStudyHours: 'Morning (8 AM - 12 PM)',
  xp: 0,
  level: 1,
  streak: 0,
  badges: [],
};

interface AppContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  // Auth state
  authLoading: boolean;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authPage: 'login' | 'register' | 'forgot' | 'verification' | 'profile_setup';
  setAuthPage: (page: 'login' | 'register' | 'forgot' | 'verification' | 'profile_setup') => void;
  login: (email?: string, password?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: () => Promise<void>;
  register: (name: string, email: string, password?: string) => Promise<void>;
  sendResetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;

  // Profile & Gamification
  user: UserProfile;
  updateProfile: (updated: Partial<UserProfile>) => Promise<void>;
  addXP: (amount: number, reason?: string) => Promise<void>;
  triggerConfetti: () => void;

  // Data Collections
  assignments: Assignment[];
  addAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt'>) => Promise<void>;
  updateAssignment: (id: string, updated: Partial<Assignment>) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;

  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => Promise<void>;
  updateProject: (id: string, updated: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  toggleMilestone: (projectId: string, milestoneId: string) => Promise<void>;

  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'updatedAt'>) => Promise<void>;
  updateNote: (id: string, updated: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;

  calendarEvents: CalendarEvent[];
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
  deleteCalendarEvent: (id: string) => Promise<void>;

  studyLogs: StudySessionLog[];
  logStudySession: (minutes: number, type: 'pomodoro' | 'custom' | 'focus_mode', subject: string) => Promise<void>;

  notifications: AppNotification[];
  markNotificationRead: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;

  // UI Mobile State
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;

  // Search & Global Filter
  globalSearch: string;
  setGlobalSearch: (term: string) => void;

  // Theme & Settings
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  accentColor: string;
  setAccentColor: (color: string) => void;

  // AI Floating Chat
  isFloatingAIOpen: boolean;
  setIsFloatingAIOpen: (open: boolean) => void;
  chatMessages: ChatMessage[];
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authPage, setAuthPage] = useState<'login' | 'register' | 'forgot' | 'verification' | 'profile_setup'>('login');

  // User Profile State
  const [user, setUser] = useState<UserProfile>(defaultEmptyProfile);

  // Collections State
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [studyLogs, setStudyLogs] = useState<StudySessionLog[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // UI State
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('studysprint_dark');
    return saved ? JSON.parse(saved) : false;
  });
  const [accentColor, setAccentColor] = useState('#CC5F3B');
  const [isFloatingAIOpen, setIsFloatingAIOpen] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('studysprint_dark', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);
  const theme = isDarkMode ? 'dark' : 'light';

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#CC5F3B', '#D5B7A0', '#4CAF50', '#2196F3'],
      });
    } catch {
      // ignore in SSR / unsupported DOM
    }
  };

  // Sync Auth State & Firestore Subcollections in Realtime
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        setIsAuthenticated(true);
        setShowAuthModal(false);

        const uid = fbUser.uid;

        // 1. Listen to user document
        const unsubUser = onSnapshot(doc(db, 'users', uid), (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setUser({
              id: uid,
              name: data.fullName || fbUser.displayName || 'Student',
              email: data.email || fbUser.email || '',
              avatar: data.avatar || fbUser.photoURL || '',
              university: data.university || 'University / College',
              degree: data.degree || 'Degree Program',
              semester: data.semester || 'Current Term',
              major: data.major || 'General Major',
              interests: data.interests || [],
              studyGoals: data.studyGoals || [],
              preferredStudyHours: data.preferredStudyHours || 'Morning (8 AM - 12 PM)',
              xp: data.xp ?? 0,
              level: data.level ?? 1,
              streak: data.streak ?? 0,
              badges: data.badges || [],
            });
          } else {
            // First time user document creation
            const initialDoc = {
              uid,
              fullName: fbUser.displayName || 'Student',
              email: fbUser.email || '',
              avatar: fbUser.photoURL || '',
              university: 'University / College',
              degree: 'Degree Program',
              semester: 'Current Term',
              major: 'General Major',
              interests: [],
              studyGoals: [],
              preferredStudyHours: 'Morning (8 AM - 12 PM)',
              xp: 0,
              level: 1,
              streak: 0,
              badges: [],
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              emailVerified: fbUser.emailVerified,
            };
            setDoc(doc(db, 'users', uid), initialDoc, { merge: true });
          }
        });

        // 2. Listen to assignments
        const unsubAssignments = onSnapshot(
          collection(db, 'users', uid, 'assignments'),
          (snap) => {
            const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Assignment));
            setAssignments(items);
          },
          (err) => console.error('Assignments listener error:', err)
        );

        // 3. Listen to projects
        const unsubProjects = onSnapshot(
          collection(db, 'users', uid, 'projects'),
          (snap) => {
            const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Project));
            setProjects(items);
          },
          (err) => console.error('Projects listener error:', err)
        );

        // 4. Listen to notes
        const unsubNotes = onSnapshot(
          collection(db, 'users', uid, 'notes'),
          (snap) => {
            const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Note));
            setNotes(items);
          },
          (err) => console.error('Notes listener error:', err)
        );

        // 5. Listen to calendar events
        const unsubEvents = onSnapshot(
          collection(db, 'users', uid, 'calendarEvents'),
          (snap) => {
            const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as CalendarEvent));
            setCalendarEvents(items);
          },
          (err) => console.error('Calendar listener error:', err)
        );

        // 6. Listen to study sessions
        const unsubStudy = onSnapshot(
          collection(db, 'users', uid, 'studySessions'),
          (snap) => {
            const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as StudySessionLog));
            setStudyLogs(items);
          },
          (err) => console.error('Study sessions listener error:', err)
        );

        // 7. Listen to notifications
        const unsubNotifs = onSnapshot(
          collection(db, 'users', uid, 'notifications'),
          (snap) => {
            const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AppNotification));
            setNotifications(items);
          },
          (err) => console.error('Notifications listener error:', err)
        );

        // 8. Listen to chat messages
        const unsubChat = onSnapshot(
          collection(db, 'users', uid, 'chatMessages'),
          (snap) => {
            const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ChatMessage));
            setChatMessages(items);
          },
          (err) => console.error('Chat messages listener error:', err)
        );

        return () => {
          unsubUser();
          unsubAssignments();
          unsubProjects();
          unsubNotes();
          unsubEvents();
          unsubStudy();
          unsubNotifs();
          unsubChat();
        };
      } else {
        setIsAuthenticated(false);
        setUser(defaultEmptyProfile);
        setAssignments([]);
        setProjects([]);
        setNotes([]);
        setCalendarEvents([]);
        setStudyLogs([]);
        setNotifications([]);
        setChatMessages([]);
        setShowAuthModal(true);
        setAuthPage('login');
      }
      setAuthLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // Profile Management & Gamification
  const updateProfile = async (updated: Partial<UserProfile>) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const userRef = doc(db, 'users', uid);

    const payload: Record<string, any> = {};
    if (updated.name !== undefined) payload.fullName = updated.name;
    if (updated.email !== undefined) payload.email = updated.email;
    if (updated.avatar !== undefined) payload.avatar = updated.avatar;
    if (updated.university !== undefined) payload.university = updated.university;
    if (updated.degree !== undefined) payload.degree = updated.degree;
    if (updated.semester !== undefined) payload.semester = updated.semester;
    if (updated.major !== undefined) payload.major = updated.major;
    if (updated.interests !== undefined) payload.interests = updated.interests;
    if (updated.studyGoals !== undefined) payload.studyGoals = updated.studyGoals;
    if (updated.preferredStudyHours !== undefined) payload.preferredStudyHours = updated.preferredStudyHours;
    if (updated.xp !== undefined) payload.xp = updated.xp;
    if (updated.level !== undefined) payload.level = updated.level;
    if (updated.streak !== undefined) payload.streak = updated.streak;

    await setDoc(userRef, payload, { merge: true });
  };

  const addXP = async (amount: number, reason?: string) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const newXp = (user.xp || 0) + amount;
    const newLevel = Math.floor(newXp / 500) + 1;
    await setDoc(doc(db, 'users', uid), { xp: newXp, level: newLevel }, { merge: true });
  };

  // Auth Operations
  const login = async (email?: string, password?: string) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const loginAsGuest = async () => {
    try {
      const cred = await signInAnonymously(auth);
      const fbUser = cred.user;
      const userRef = doc(db, 'users', fbUser.uid);
      const guestDoc = {
        uid: fbUser.uid,
        fullName: 'Demo Student',
        email: 'demo@studysprint.ai',
        university: 'Stanford University',
        degree: 'Bachelor of Science',
        semester: 'Fall 2026',
        major: 'Computer Science',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        emailVerified: false,
      };
      await setDoc(userRef, guestDoc, { merge: true });
    } catch (err) {
      console.warn('Anonymous sign-in fallback:', err);
      setIsAuthenticated(true);
      setShowAuthModal(false);
    }
  };

  const register = async (name: string, email: string, password?: string) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const fbUser = cred.user;

    const userRef = doc(db, 'users', fbUser.uid);
    const userDocData = {
      uid: fbUser.uid,
      fullName: name || fbUser.displayName || 'Student',
      email: email,
      university: 'University / College',
      degree: 'Degree Program',
      semester: 'Current Term',
      major: 'General Major',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      emailVerified: fbUser.emailVerified,
    };
    await setDoc(userRef, userDocData, { merge: true });
    setAuthPage('profile_setup');
  };

  const sendResetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    await signOut(auth);
    setIsAuthenticated(false);
    setShowAuthModal(true);
    setAuthPage('login');
  };

  // CRUD Assignments
  const addAssignment = async (assignmentData: Omit<Assignment, 'id' | 'createdAt'>) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const newRef = doc(collection(db, 'users', uid, 'assignments'));
    const newAsgn: Assignment = {
      ...assignmentData,
      id: newRef.id,
      createdAt: new Date().toISOString(),
    };
    await setDoc(newRef, newAsgn);
    triggerConfetti();
  };

  const updateAssignment = async (id: string, updated: Partial<Assignment>) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    await setDoc(doc(db, 'users', uid, 'assignments', id), updated, { merge: true });
    if (updated.status === 'completed') {
      await addXP(100, 'Completed Assignment');
      triggerConfetti();
    }
  };

  const deleteAssignment = async (id: string) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    await deleteDoc(doc(db, 'users', uid, 'assignments', id));
  };

  // CRUD Projects
  const addProject = async (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const newRef = doc(collection(db, 'users', uid, 'projects'));
    const newProj: Project = {
      ...projectData,
      id: newRef.id,
      createdAt: new Date().toISOString(),
    };
    await setDoc(newRef, newProj);
    triggerConfetti();
  };

  const updateProject = async (id: string, updated: Partial<Project>) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    await setDoc(doc(db, 'users', uid, 'projects', id), updated, { merge: true });
  };

  const deleteProject = async (id: string) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    await deleteDoc(doc(db, 'users', uid, 'projects', id));
  };

  const toggleMilestone = async (projectId: string, milestoneId: string) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;
    const updatedMilestones = proj.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    const completedCount = updatedMilestones.filter((m) => m.completed).length;
    const progress =
      updatedMilestones.length > 0
        ? Math.round((completedCount / updatedMilestones.length) * 100)
        : 0;
    await setDoc(
      doc(db, 'users', uid, 'projects', projectId),
      { milestones: updatedMilestones, progress },
      { merge: true }
    );
  };

  // CRUD Notes
  const addNote = async (noteData: Omit<Note, 'id' | 'updatedAt'>) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const newRef = doc(collection(db, 'users', uid, 'notes'));
    const newNote: Note = {
      ...noteData,
      id: newRef.id,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(newRef, newNote);
  };

  const updateNote = async (id: string, updated: Partial<Note>) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    await setDoc(
      doc(db, 'users', uid, 'notes', id),
      { ...updated, updatedAt: new Date().toISOString() },
      { merge: true }
    );
  };

  const deleteNote = async (id: string) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    await deleteDoc(doc(db, 'users', uid, 'notes', id));
  };

  // CRUD Calendar Events
  const addCalendarEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const newRef = doc(collection(db, 'users', uid, 'calendarEvents'));
    const newEvt: CalendarEvent = {
      ...eventData,
      id: newRef.id,
    };
    await setDoc(newRef, newEvt);
    triggerConfetti();
  };

  const deleteCalendarEvent = async (id: string) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    await deleteDoc(doc(db, 'users', uid, 'calendarEvents', id));
  };

  // Study Session Logger
  const logStudySession = async (
    minutes: number,
    type: 'pomodoro' | 'custom' | 'focus_mode',
    subject: string
  ) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const newRef = doc(collection(db, 'users', uid, 'studySessions'));
    const newLog: StudySessionLog = {
      id: newRef.id,
      date: new Date().toISOString(),
      durationMinutes: minutes,
      type: type,
      subject: subject || 'General Study',
    };
    await setDoc(newRef, newLog);
    await addXP(Math.round(minutes * 2), `Logged ${minutes} min focus session`);
    triggerConfetti();
  };

  // Notifications
  const markNotificationRead = async (id: string) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    await setDoc(doc(db, 'users', uid, 'notifications', id), { read: true }, { merge: true });
  };

  const clearAllNotifications = async () => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const snap = await getDocs(collection(db, 'users', uid, 'notifications'));
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  };

  // AI Chat
  const addChatMessage = async (msgData: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const newRef = doc(collection(db, 'users', uid, 'chatMessages'));
    const newMsg: ChatMessage = {
      ...msgData,
      id: newRef.id,
      timestamp: new Date().toISOString(),
    };
    await setDoc(newRef, newMsg);
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        authLoading,
        firebaseUser,
        isAuthenticated,
        showAuthModal,
        setShowAuthModal,
        authPage,
        setAuthPage,
        login,
        loginWithGoogle,
        loginAsGuest,
        register,
        sendResetPassword,
        logout,
        user,
        updateProfile,
        addXP,
        triggerConfetti,
        assignments,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        projects,
        addProject,
        updateProject,
        deleteProject,
        toggleMilestone,
        notes,
        addNote,
        updateNote,
        deleteNote,
        calendarEvents,
        addCalendarEvent,
        deleteCalendarEvent,
        studyLogs,
        logStudySession,
        notifications,
        markNotificationRead,
        clearAllNotifications,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        globalSearch,
        setGlobalSearch,
        isDarkMode,
        setIsDarkMode,
        theme,
        toggleTheme,
        accentColor,
        setAccentColor,
        isFloatingAIOpen,
        setIsFloatingAIOpen,
        chatMessages,
        addChatMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

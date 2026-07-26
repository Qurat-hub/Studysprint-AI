import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  FolderKanban,
  Sparkles,
  Calendar,
  Bot,
  FileText,
  Timer,
  BarChart3,
  Settings,
  UserCheck,
  Zap,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useApp, NavTab } from '../../context/AppContext';

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen: propMobileOpen, setMobileOpen: propSetMobileOpen }) => {
  const {
    activeTab,
    setActiveTab,
    assignments,
    user,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
  } = useApp();

  const isMobileOpen = propMobileOpen !== undefined ? propMobileOpen : isMobileSidebarOpen;
  const setMobileOpen = propSetMobileOpen || setIsMobileSidebarOpen;

  const pendingAssignmentsCount = assignments.filter((a) => a.status !== 'completed').length;

  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: string | number; isAi?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assignments', label: 'Assignments', icon: BookOpen, badge: pendingAssignmentsCount > 0 ? pendingAssignmentsCount : undefined },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'planner', label: 'AI Study Planner', icon: Sparkles, isAi: true },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'ai_assistant', label: 'AI Assistant', icon: Bot, isAi: true },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'timer', label: 'Study Timer', icon: Timer },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: UserCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (tab: NavTab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed bottom-0 top-0 z-50 flex w-64 flex-col bg-[#583832] text-white shadow-2xl transition-transform duration-300 dark:bg-[#181414] lg:static lg:z-20 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <div
            onClick={() => handleNavClick('dashboard')}
            className="flex cursor-pointer items-center gap-2.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#CC5F3B] shadow-md shadow-[#CC5F3B]/30">
              <Zap className="h-5 w-5 fill-white text-white" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white">
                StudySprint <span className="text-[#CC5F3B]">AI</span>
              </h1>
              <p className="text-[10px] font-medium text-[#D5B7A0] opacity-80">Academic Velocity</p>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-xl p-1 text-slate-300 hover:bg-white/10 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`group relative flex w-full items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#CC5F3B] text-white shadow-lg shadow-[#CC5F3B]/25'
                    : 'text-[#D5B7A0] hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : item.isAi ? 'text-[#CC5F3B]' : 'text-[#6C7A94]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.isAi && !isActive && (
                    <span className="rounded-md bg-[#CC5F3B]/20 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-[#CC5F3B]">
                      AI
                    </span>
                  )}

                  {item.badge !== undefined && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                        isActive ? 'bg-white text-[#CC5F3B]' : 'bg-[#CC5F3B] text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Gamification Progress Bottom Card */}
        <div className="p-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#D5B7A0]">Level {user.level} Student</span>
              <span className="font-extrabold text-[#CC5F3B]">{user.xp} XP</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-black/30">
              <div
                className="h-full bg-gradient-to-r from-[#CC5F3B] to-amber-400 transition-all duration-500"
                style={{ width: `${(user.xp % 500) / 5}%` }}
              />
            </div>
            <p className="mt-1.5 text-[10px] text-[#D5B7A0]/70">
              {500 - (user.xp % 500)} XP to reach Level {user.level + 1}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

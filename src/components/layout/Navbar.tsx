import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Flame,
  Bell,
  Plus,
  Sun,
  Moon,
  Zap,
  User,
  Settings,
  LogOut,
  Calendar,
  BookOpen,
  Clock,
  Menu,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NotificationDrawer } from '../common/NotificationDrawer';

export const Navbar: React.FC = () => {
  const {
    user,
    globalSearch,
    setGlobalSearch,
    isDarkMode,
    toggleTheme,
    notifications,
    setIsFloatingAIOpen,
    setActiveTab,
    setIsMobileSidebarOpen,
    logout,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md dark:border-neutral-800 dark:bg-[#1F1B1A]/80 md:px-6">
      {/* Search Bar */}
      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:bg-neutral-800 dark:text-neutral-200 lg:hidden"
          title="Open Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative flex w-48 items-center sm:w-64 md:w-80 lg:w-96">
          <Search className="absolute left-3.5 h-4 w-4 text-[#6C7A94]" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search assignments, projects, notes, courses..."
            className="w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] py-2 pl-10 pr-4 text-xs font-medium text-slate-800 transition placeholder:text-slate-400 focus:border-[#CC5F3B] focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-[#2B2523] dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-[#CC5F3B] md:text-sm"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Streak & XP Pill */}
        <div
          onClick={() => setActiveTab('profile')}
          className="flex cursor-pointer items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50/70 px-3 py-1.5 transition hover:scale-105 dark:border-amber-900/40 dark:bg-amber-950/30"
        >
          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <Flame className="h-4 w-4 fill-amber-500 animate-pulse" />
            <span className="text-xs font-bold md:text-sm">{user.streak}d</span>
          </div>
          <div className="h-3 w-px bg-amber-300 dark:bg-amber-800" />
          <div className="flex items-center gap-1 text-[#CC5F3B]">
            <Zap className="h-3.5 w-3.5 fill-[#CC5F3B]" />
            <span className="text-xs font-extrabold md:text-sm">Lvl {user.level}</span>
          </div>
        </div>

        {/* AI Sprint Planner Quick Button */}
        <button
          onClick={() => setIsFloatingAIOpen(true)}
          className="hidden items-center gap-1.5 rounded-2xl bg-[#CC5F3B] px-3.5 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-[#692E1B] active:scale-95 sm:flex"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Ask AI</span>
        </button>

        {/* Quick Action Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#583832]/10 text-[#583832] transition hover:bg-[#583832]/20 dark:bg-neutral-800 dark:text-neutral-200"
            title="Quick Action"
          >
            <Plus className="h-4 w-4" />
          </button>

          {isQuickActionOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-neutral-800 dark:bg-[#2B2523]">
              <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                Quick Actions
              </div>
              <button
                onClick={() => {
                  setActiveTab('assignments');
                  setIsQuickActionOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-[#F8F6F5] dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                <BookOpen className="h-4 w-4 text-[#CC5F3B]" />
                <span>Add Assignment</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('planner');
                  setIsQuickActionOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-[#F8F6F5] dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                <Sparkles className="h-4 w-4 text-[#CC5F3B]" />
                <span>Generate AI Study Plan</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('timer');
                  setIsQuickActionOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-[#F8F6F5] dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                <Clock className="h-4 w-4 text-[#6C7A94]" />
                <span>Start Focus Timer</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('calendar');
                  setIsQuickActionOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-[#F8F6F5] dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                <Calendar className="h-4 w-4 text-[#6C7A94]" />
                <span>Add Calendar Event</span>
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-neutral-800 dark:text-neutral-300"
          title="Toggle Dark / Light Theme"
        >
          {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
        </button>

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-neutral-800 dark:text-neutral-300"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#E53935] text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && <NotificationDrawer onClose={() => setIsNotifOpen(false)} />}
        </div>

        {/* User Profile Avatar Menu */}
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 rounded-full border border-slate-200 p-0.5 transition hover:ring-2 hover:ring-[#CC5F3B]/30 dark:border-neutral-700"
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#CC5F3B] text-xs font-black text-white">
                {user.name ? user.name.charAt(0).toUpperCase() : 'S'}
              </div>
            )}
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-neutral-800 dark:bg-[#2B2523]">
              <div className="border-b border-slate-100 px-3 py-2.5 dark:border-neutral-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</p>
                <p className="truncate text-[11px] text-slate-400">{user.email}</p>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-[#CC5F3B]">
                  <span>{user.university}</span>
                  <span>•</span>
                  <span>{user.semester}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveTab('profile');
                  setIsProfileMenuOpen(false);
                }}
                className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-[#F8F6F5] dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                <User className="h-4 w-4 text-[#6C7A94]" />
                <span>My Profile & Stats</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('settings');
                  setIsProfileMenuOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-[#F8F6F5] dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                <Settings className="h-4 w-4 text-[#6C7A94]" />
                <span>Preferences & Settings</span>
              </button>

              <div className="my-1 border-t border-slate-100 dark:border-neutral-800" />

              <button
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#E53935] transition hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

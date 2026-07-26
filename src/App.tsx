import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { AuthModal } from './components/auth/AuthModal';

import { Dashboard } from './components/dashboard/Dashboard';
import { AssignmentsView } from './components/assignments/AssignmentsView';
import { ProjectsView } from './components/projects/ProjectsView';
import { AIPlannerView } from './components/planner/AIPlannerView';
import { CalendarView } from './components/calendar/CalendarView';
import { AIAssistantView } from './components/ai/AIAssistantView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { NotesView } from './components/notes/NotesView';
import { PomodoroView } from './components/timer/PomodoroView';
import { ProfileView } from './components/profile/ProfileView';
import { SettingsView } from './components/settings/SettingsView';

import { Sparkles, Bot, X, Send, Zap } from 'lucide-react';
import { sendChatMessage } from './services/aiService';

const MainContent: React.FC = () => {
  const {
    authLoading,
    isAuthenticated,
    activeTab,
    isFloatingAIOpen,
    setIsFloatingAIOpen,
    chatMessages,
    addChatMessage,
  } = useApp();

  const [floatingInput, setFloatingInput] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);

  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F8F6F5] dark:bg-[#1C1817]">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#CC5F3B] text-white shadow-lg shadow-[#CC5F3B]/30 animate-pulse">
            <Zap className="h-6 w-6 fill-white" />
          </div>
          <span className="text-xs font-bold text-slate-600 dark:text-neutral-300">
            Initializing StudySprint AI...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8F6F5] dark:bg-[#1C1817]">
        <AuthModal />
      </div>
    );
  }

  const handleSendQuickAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!floatingInput.trim()) return;

    const text = floatingInput;
    setFloatingInput('');
    addChatMessage({ sender: 'user', text });
    setIsTyping(true);

    try {
      const reply = await sendChatMessage(text);
      addChatMessage({ sender: 'ai', text: reply });
    } catch (err) {
      addChatMessage({ sender: 'ai', text: 'Sorry, I hit a temporary hiccup. Try again!' });
    } finally {
      setIsTyping(false);
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'assignments':
        return <AssignmentsView />;
      case 'projects':
        return <ProjectsView />;
      case 'planner':
        return <AIPlannerView />;
      case 'calendar':
        return <CalendarView />;
      case 'ai_hub':
        return <AIAssistantView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'notes':
        return <NotesView />;
      case 'timer':
        return <PomodoroView />;
      case 'profile':
        return <ProfileView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F5] text-slate-900 transition-colors duration-200 dark:bg-[#1C1817] dark:text-neutral-100">
      <Navbar />

      <div className="flex pt-16">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-x-hidden">
          {renderActiveView()}
        </main>
      </div>

      <AuthModal />

      {/* Floating Quick AI Floating Widget */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isFloatingAIOpen ? (
          <button
            onClick={() => setIsFloatingAIOpen(true)}
            className="flex items-center gap-2 rounded-full bg-[#CC5F3B] p-3.5 sm:px-5 sm:py-3.5 text-xs font-black text-white shadow-2xl shadow-[#CC5F3B]/50 hover:bg-[#692E1B] transition active:scale-95"
          >
            <Sparkles className="h-5 w-5 animate-pulse text-amber-300" />
            <span className="hidden sm:inline">Ask AI Assistant</span>
          </button>
        ) : (
          <div className="flex h-[420px] w-80 sm:w-96 flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-[#2B2523]">
            {/* Quick Chat Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-[#583832] p-4 text-white dark:border-neutral-800 dark:bg-[#181414]">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#CC5F3B]">
                  <Sparkles className="h-4 w-4 fill-white" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">StudySprint AI Assistant</h4>
                  <p className="text-[10px] text-[#D5B7A0]">Instant Academic Helper</p>
                </div>
              </div>
              <button
                onClick={() => setIsFloatingAIOpen(false)}
                className="rounded-lg p-1 text-slate-300 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Messages list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {chatMessages.slice(-6).map((m) => (
                <div
                  key={m.id}
                  className={`rounded-2xl p-3 leading-relaxed ${
                    m.sender === 'ai'
                      ? 'bg-[#F8F6F5] text-slate-800 dark:bg-neutral-800 dark:text-neutral-200'
                      : 'bg-[#CC5F3B] text-white ml-6'
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {isTyping && (
                <div className="text-[11px] text-slate-400 font-medium">StudySprint AI is typing...</div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendQuickAI} className="border-t border-slate-100 p-3 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={floatingInput}
                  onChange={(e) => setFloatingInput(e.target.value)}
                  placeholder="Ask a quick study question..."
                  className="w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] py-2 px-3 text-xs font-medium focus:border-[#CC5F3B] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!floatingInput.trim()}
                  className="rounded-2xl bg-[#CC5F3B] p-2 text-white hover:bg-[#692E1B] disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

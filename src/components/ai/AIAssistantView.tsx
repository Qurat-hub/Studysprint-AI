import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  User,
  GraduationCap,
  BookOpen,
  Calendar,
  TrendingUp,
  Zap,
  CheckCircle2,
  HelpCircle,
  BrainCircuit,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  generateAssignmentHelp,
  generateExamPlan,
  generateCoachingReport,
  sendChatMessage,
} from '../../services/aiService';

export const AIAssistantView: React.FC = () => {
  const { chatMessages, addChatMessage, user, assignments, studyLogs } = useApp();

  const [activeToolTab, setActiveToolTab] = useState<'chat' | 'assignment' | 'exam' | 'coach'>('chat');
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Assignment helper state
  const [asgnInstructions, setAsgnInstructions] = useState('');
  const [asgnTitle, setAsgnTitle] = useState('');
  const [asgnResult, setAsgnResult] = useState<any | null>(null);
  const [isAsgnLoading, setIsAsgnLoading] = useState(false);

  // Exam planner state
  const [subjects, setSubjects] = useState('Operating Systems, Database Systems, Computer Architecture');
  const [availableHours, setAvailableHours] = useState(4);
  const [examResult, setExamResult] = useState<any | null>(null);
  const [isExamLoading, setIsExamLoading] = useState(false);

  // Coach state
  const [coachResult, setCoachResult] = useState<any | null>(null);
  const [isCoachLoading, setIsCoachLoading] = useState(false);

  const suggestedPrompts = [
    'How should I divide my study time between OS and DB?',
    'Give me an active recall strategy for memorizing formulas.',
    'I have 2 hours left today. What should I prioritize?',
    'Explain B+ Tree indexing simply with an example.',
  ];

  const handleSendMessage = async (msgText?: string) => {
    const text = msgText || chatInput;
    if (!text.trim()) return;

    // Add user message
    addChatMessage({ sender: 'user', text });
    setChatInput('');
    setIsTyping(true);

    try {
      const reply = await sendChatMessage(text);
      addChatMessage({ sender: 'ai', text: reply });
    } catch (err) {
      addChatMessage({ sender: 'ai', text: 'I encountered an error processing that request. Please try again!' });
    } finally {
      setIsTyping(false);
    }
  };

  const handleRunAssignmentHelper = async () => {
    if (!asgnInstructions.trim()) return;
    setIsAsgnLoading(true);
    try {
      const result = await generateAssignmentHelp(asgnInstructions, asgnTitle, 'General');
      setAsgnResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAsgnLoading(false);
    }
  };

  const handleRunExamPlanner = async () => {
    setIsExamLoading(true);
    const subList = subjects.split(',').map((s) => s.trim()).filter(Boolean);
    try {
      const result = await generateExamPlan(subList, {}, availableHours);
      setExamResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExamLoading(false);
    }
  };

  const handleRunCoach = async () => {
    setIsCoachLoading(true);
    try {
      const result = await generateCoachingReport({
        completedCount: assignments.filter((a) => a.status === 'completed').length,
        pendingCount: assignments.filter((a) => a.status !== 'completed').length,
        currentStreak: user.streak,
        hoursThisWeek: 18,
      });
      setCoachResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCoachLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            AI Academic Assistant Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-neutral-400">
            Powered by Gemini AI — tailored academic coaching, assignment breakdowns, and exam strategizer
          </p>
        </div>

        {/* Tool Navigation Switcher */}
        <div className="flex flex-wrap items-center rounded-2xl border border-slate-200 bg-white p-1 text-xs font-bold dark:border-neutral-800 dark:bg-[#2B2523]">
          <button
            onClick={() => setActiveToolTab('chat')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 transition ${
              activeToolTab === 'chat' ? 'bg-[#CC5F3B] text-white' : 'text-slate-600 dark:text-neutral-300'
            }`}
          >
            <Bot className="h-3.5 w-3.5" />
            <span>AI Chat</span>
          </button>

          <button
            onClick={() => setActiveToolTab('assignment')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 transition ${
              activeToolTab === 'assignment' ? 'bg-[#CC5F3B] text-white' : 'text-slate-600 dark:text-neutral-300'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Assignment Helper</span>
          </button>

          <button
            onClick={() => setActiveToolTab('exam')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 transition ${
              activeToolTab === 'exam' ? 'bg-[#CC5F3B] text-white' : 'text-slate-600 dark:text-neutral-300'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Exam Planner</span>
          </button>

          <button
            onClick={() => setActiveToolTab('coach')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 transition ${
              activeToolTab === 'coach' ? 'bg-[#CC5F3B] text-white' : 'text-slate-600 dark:text-neutral-300'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Productivity Coach</span>
          </button>
        </div>
      </div>

      {/* TOOL 1: AI Chat Assistant */}
      {activeToolTab === 'chat' && (
        <div className="flex h-[600px] flex-col overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-[#2B2523]">
          {/* Chat Messages Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {chatMessages.map((msg) => {
              const isAi = msg.sender === 'ai';

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}
                >
                  {isAi && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#CC5F3B] text-white shadow-md">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-xl rounded-[22px] px-4 py-3 text-xs leading-relaxed ${
                      isAi
                        ? 'bg-[#F8F6F5] text-slate-800 dark:bg-neutral-800 dark:text-neutral-200'
                        : 'bg-[#CC5F3B] text-white'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span
                      className={`mt-1.5 block text-[9px] font-medium ${
                        isAi ? 'text-slate-400' : 'text-white/80'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  {!isAi && (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 shrink-0 rounded-xl object-cover"
                    />
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-neutral-500">
                <BrainCircuit className="h-4 w-4 animate-spin text-[#CC5F3B]" />
                <span>StudySprint AI is crafting a response...</span>
              </div>
            )}
          </div>

          {/* Suggested Prompts Bar */}
          <div className="border-t border-slate-100 bg-[#F8F6F5]/60 p-3 dark:border-neutral-800 dark:bg-neutral-800/30">
            <div className="flex flex-wrap gap-1.5">
              {suggestedPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(p)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-700 hover:border-[#CC5F3B] transition dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                >
                  💡 {p}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <div className="border-t border-slate-100 p-4 dark:border-neutral-800 dark:bg-[#2B2523]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask StudySprint AI anything about your coursework..."
                className="w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] py-3 px-4 text-xs font-medium text-slate-800 focus:border-[#CC5F3B] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#CC5F3B] text-white shadow-md hover:bg-[#692E1B] transition disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TOOL 2: AI Assignment Helper */}
      {activeToolTab === 'assignment' && (
        <div className="space-y-6">
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-[#2B2523]">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">AI Assignment Instruction Breakdown</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">
              Paste assignment instructions or prompt criteria below. AI will summarize key topics, step-by-step checklist, and timeline.
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-neutral-300">Assignment Title</label>
                <input
                  type="text"
                  value={asgnTitle}
                  onChange={(e) => setAsgnTitle(e.target.value)}
                  placeholder="e.g. Distributed Consensus Algorithms Lab"
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] p-2.5 font-medium focus:border-[#CC5F3B] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-neutral-300">Assignment Instructions / Prompt</label>
                <textarea
                  rows={4}
                  value={asgnInstructions}
                  onChange={(e) => setAsgnInstructions(e.target.value)}
                  placeholder="Paste instructions, rubric requirements, or topic guidelines..."
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] p-3 font-medium focus:border-[#CC5F3B] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <button
                onClick={handleRunAssignmentHelper}
                disabled={isAsgnLoading || !asgnInstructions.trim()}
                className="flex items-center gap-2 rounded-2xl bg-[#CC5F3B] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#692E1B] transition disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                <span>{isAsgnLoading ? 'Analyzing Instructions...' : 'Analyze & Breakdown Assignment'}</span>
              </button>
            </div>
          </div>

          {asgnResult && (
            <div className="rounded-[28px] border border-amber-200 bg-amber-50/40 p-6 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20 space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Summary</h3>
                <p className="mt-1 text-xs text-slate-700 dark:text-neutral-300">{asgnResult.summary}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">Recommended Checklist</h4>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-700 dark:text-neutral-300">
                  {asgnResult.checklist.map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#4CAF50]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TOOL 3: AI Exam Planner */}
      {activeToolTab === 'exam' && (
        <div className="space-y-6">
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-[#2B2523]">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">AI Exam Timetable Planner</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">
              Generate a high-yield revision timetable and mock practice strategy for your upcoming exams.
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-neutral-300">Subjects / Exam Courses</label>
                <input
                  type="text"
                  value={subjects}
                  onChange={(e) => setSubjects(e.target.value)}
                  placeholder="Operating Systems, Database Systems, Web Development"
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] p-2.5 font-medium focus:border-[#CC5F3B] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-neutral-300">Daily Study Hours Available</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={availableHours}
                  onChange={(e) => setAvailableHours(Number(e.target.value))}
                  className="mt-1 w-full max-w-xs rounded-2xl border border-slate-200 bg-[#F8F6F5] p-2.5 font-medium focus:border-[#CC5F3B] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <button
                onClick={handleRunExamPlanner}
                disabled={isExamLoading}
                className="flex items-center gap-2 rounded-2xl bg-[#CC5F3B] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#692E1B] transition disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                <span>{isExamLoading ? 'Generating Timetable...' : 'Generate Exam Timetable'}</span>
              </button>
            </div>
          </div>

          {examResult && (
            <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-[#2B2523] space-y-4">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Exam Strategy Overview</h3>
              <p className="text-xs text-slate-700 dark:text-neutral-300">{examResult.overallStrategy}</p>

              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Daily Revision Schedule</h4>
                {examResult.dailyTimetable.map((slot: any, i: number) => (
                  <div key={i} className="flex items-center justify-between rounded-xl bg-[#F8F6F5] p-3 text-xs dark:bg-neutral-800/40">
                    <span className="font-bold text-[#CC5F3B]">{slot.day}</span>
                    <span className="font-semibold text-slate-800 dark:text-white">{slot.subject} ({slot.topic})</span>
                    <span className="text-slate-400">{slot.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TOOL 4: AI Productivity Coach */}
      {activeToolTab === 'coach' && (
        <div className="space-y-6">
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-[#2B2523]">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">AI Productivity & Study Coach</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">
              Evaluates your study logs, streak, completion rates, and generates tailored habits.
            </p>

            <button
              onClick={handleRunCoach}
              disabled={isCoachLoading}
              className="mt-4 flex items-center gap-2 rounded-2xl bg-[#CC5F3B] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#692E1B] transition disabled:opacity-50"
            >
              <Zap className="h-4 w-4" />
              <span>{isCoachLoading ? 'Analyzing Performance...' : 'Run Productivity Analysis'}</span>
            </button>
          </div>

          {coachResult && (
            <div className="rounded-[28px] bg-gradient-to-br from-[#583832] to-[#692E1B] p-6 text-white shadow-xl space-y-4">
              <h3 className="text-base font-extrabold">Coaching Report Summary</h3>
              <p className="text-xs text-[#D5B7A0] leading-relaxed">{coachResult.summary}</p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/10 p-4">
                  <h4 className="font-bold text-xs text-amber-300">Strengths</h4>
                  <ul className="mt-2 space-y-1 text-xs text-[#D5B7A0]">
                    {coachResult.strengths.map((s: string, i: number) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <h4 className="font-bold text-xs text-emerald-300">Weekly Suggestions</h4>
                  <ul className="mt-2 space-y-1 text-xs text-[#D5B7A0]">
                    {coachResult.weeklySuggestions.map((w: string, i: number) => (
                      <li key={i}>• {w}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

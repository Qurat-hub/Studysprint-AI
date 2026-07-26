import React from 'react';
import {
  Sparkles,
  Flame,
  Zap,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Plus,
  Quote,
  Activity,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useApp } from '../../context/AppContext';

export const Dashboard: React.FC = () => {
  const {
    user,
    assignments,
    projects,
    calendarEvents,
    studyLogs,
    setActiveTab,
    setIsFloatingAIOpen,
    updateAssignment,
  } = useApp();

  const pendingAssignments = assignments.filter((a) => a.status !== 'completed');
  const completedAssignments = assignments.filter((a) => a.status === 'completed');

  // Productivity Score Calculation (0 - 100)
  const completionRate =
    assignments.length > 0 ? Math.round((completedAssignments.length / assignments.length) * 100) : 100;
  const productivityScore = Math.min(100, Math.round(completionRate * 0.6 + user.streak * 4 + user.level * 3));

  // Today's Date
  const todayStr = new Date().toISOString().split('T')[0];
  const todayEvents = calendarEvents.filter((e) => e.date === todayStr);

  // Upcoming Exams
  const upcomingExams = calendarEvents.filter((e) => e.type === 'exam');

  // Chart Data for Weekly Productivity
  const weeklyData = [
    { day: 'Mon', hours: 3.2, score: 78 },
    { day: 'Tue', hours: 4.5, score: 85 },
    { day: 'Wed', hours: 2.8, score: 72 },
    { day: 'Thu', hours: 5.1, score: 92 },
    { day: 'Fri', hours: 4.0, score: 88 },
    { day: 'Sat', hours: 6.2, score: 96 },
    { day: 'Sun', hours: 4.8, score: 90 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#583832] via-[#692E1B] to-[#CC5F3B] p-6 text-white shadow-xl md:p-8">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md text-[#D5B7A0]">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>{user.university} • {user.semester}</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
              Welcome back, {user.name}! 🚀
            </h1>
            <p className="max-w-xl text-xs sm:text-sm text-[#D5B7A0]">
              You have <span className="font-bold text-white">{pendingAssignments.length} pending deadlines</span> this week. AI generated a 3-step focus schedule for your top priorities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('planner')}
              className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-extrabold text-[#583832] shadow-md transition hover:bg-amber-50 active:scale-95"
            >
              <Sparkles className="h-4 w-4 text-[#CC5F3B]" />
              <span>Generate AI Sprint Plan</span>
            </button>
            <button
              onClick={() => setActiveTab('timer')}
              className="flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/25 active:scale-95"
            >
              <Clock className="h-4 w-4" />
              <span>Start Focus Session</span>
            </button>
          </div>
        </div>

        {/* Abstract Background Design Element */}
        <div className="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Productivity Score */}
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-[#2B2523]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">Productivity Score</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{productivityScore}</span>
            <span className="text-[11px] font-bold text-emerald-600">/ 100</span>
          </div>
          <p className="mt-1 text-[10px] text-slate-400">Top 5% in {user.major}</p>
        </div>

        {/* Study Streak */}
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-[#2B2523]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">Study Streak</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Flame className="h-4 w-4 fill-amber-500" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{user.streak} Days</span>
          </div>
          <p className="mt-1 text-[10px] text-amber-600 font-medium">Keep it burning! 🔥</p>
        </div>

        {/* Level & XP */}
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-[#2B2523]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">Level & XP</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#CC5F3B]/10 text-[#CC5F3B]">
              <Zap className="h-4 w-4 fill-[#CC5F3B]" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">Lvl {user.level}</span>
            <span className="text-[11px] font-bold text-[#CC5F3B]">{user.xp} XP</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-neutral-800">
            <div
              className="h-full bg-[#CC5F3B]"
              style={{ width: `${(user.xp % 500) / 5}%` }}
            />
          </div>
        </div>

        {/* Assignments Pending */}
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-[#2B2523]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">Pending Deadlines</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{pendingAssignments.length}</span>
            <span className="text-[11px] font-bold text-slate-400">Tasks</span>
          </div>
          <p className="mt-1 text-[10px] text-slate-400">{completedAssignments.length} completed this week</p>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols on Large) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Upcoming Deadlines & Recent Assignments */}
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-[#2B2523]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Upcoming Deadlines & Tasks</h2>
                <p className="text-xs text-slate-500 dark:text-neutral-400">Sorted by urgency and AI priority score</p>
              </div>
              <button
                onClick={() => setActiveTab('assignments')}
                className="flex items-center gap-1 text-xs font-bold text-[#CC5F3B] hover:underline"
              >
                <span>View All</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {assignments.slice(0, 4).map((asgn) => {
                const isUrgent = asgn.priority === 'urgent' || asgn.priority === 'high';

                return (
                  <div
                    key={asgn.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-[#F8F6F5] p-3.5 transition hover:border-slate-300 dark:border-neutral-800/80 dark:bg-neutral-800/40 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() =>
                          updateAssignment(asgn.id, {
                            status: asgn.status === 'completed' ? 'in_progress' : 'completed',
                            progress: asgn.status === 'completed' ? 50 : 100,
                          })
                        }
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition ${
                          asgn.status === 'completed'
                            ? 'border-[#4CAF50] bg-[#4CAF50] text-white'
                            : 'border-slate-300 bg-white hover:border-[#CC5F3B] dark:border-neutral-600 dark:bg-neutral-800'
                        }`}
                      >
                        {asgn.status === 'completed' && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{asgn.title}</span>
                          {isUrgent && (
                            <span className="rounded-md bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-600 dark:bg-red-950/40 dark:text-red-400">
                              Urgent
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-neutral-400">{asgn.course}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-right">
                        <span className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300">
                          Due {new Date(asgn.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-[10px] text-slate-400">{asgn.estimatedHours}h est. study</span>
                      </div>
                      <div className="w-16">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-neutral-700">
                          <div
                            className="h-full bg-[#CC5F3B]"
                            style={{ width: `${asgn.progress}%` }}
                          />
                        </div>
                        <span className="mt-0.5 block text-center text-[9px] font-bold text-slate-400">
                          {asgn.progress}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly Productivity Analytics Chart */}
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-[#2B2523]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Weekly Study Hours & Score</h2>
                <p className="text-xs text-slate-500 dark:text-neutral-400">Logged focus time vs efficiency rating</p>
              </div>
              <button
                onClick={() => setActiveTab('analytics')}
                className="flex items-center gap-1 text-xs font-bold text-[#CC5F3B] hover:underline"
              >
                <span>Analytics Hub</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-4 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#CC5F3B" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#CC5F3B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6C7A94' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6C7A94' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#2B2523',
                      borderColor: '#CC5F3B',
                      borderRadius: '16px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke="#CC5F3B"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorHours)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-6">
          {/* Recent AI Suggestions */}
          <div className="rounded-[28px] border border-[#CC5F3B]/30 bg-gradient-to-b from-[#CC5F3B]/10 to-transparent p-5 shadow-sm dark:bg-neutral-800/40">
            <div className="flex items-center gap-2 text-[#CC5F3B]">
              <Sparkles className="h-5 w-5" />
              <h2 className="text-sm font-bold">AI Assistant Coach</h2>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-neutral-300">
              "You have 2 high-priority items due in 48 hours: <span className="font-bold">Database Lab 4</span> and <span className="font-bold">OS Quiz 3</span>. I recommend scheduling a 90-minute Pomodoro session this evening."
            </p>

            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={() => setActiveTab('planner')}
                className="flex w-full items-center justify-between rounded-xl bg-[#CC5F3B] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#692E1B]"
              >
                <span>Generate Smart Schedule</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-[#2B2523]">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Today's Schedule</h2>
              <Calendar className="h-4 w-4 text-[#6C7A94]" />
            </div>

            <div className="mt-3 space-y-2.5">
              {todayEvents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400 dark:border-neutral-700">
                  No events set for today. Use Calendar or AI Planner to populate your day.
                </div>
              ) : (
                todayEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-[#F8F6F5] p-3 text-xs dark:border-neutral-800 dark:bg-neutral-800/50"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: evt.color || '#CC5F3B' }}
                      />
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">{evt.title}</p>
                        <p className="text-[10px] text-slate-400">{evt.course}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-slate-500">{evt.time || 'All Day'}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Motivational Quote */}
          <div className="relative overflow-hidden rounded-[28px] bg-[#583832] p-5 text-white dark:bg-[#181414]">
            <Quote className="absolute right-3 top-3 h-12 w-12 text-white/10" />
            <p className="relative z-10 text-xs italic text-[#D5B7A0]">
              "Consistency is not about perfection. It is about taking small, deliberate steps towards your academic goals every single day."
            </p>
            <p className="mt-3 text-[10px] font-bold text-[#CC5F3B]">— StudySprint AI Coach</p>
          </div>
        </div>
      </div>
    </div>
  );
};

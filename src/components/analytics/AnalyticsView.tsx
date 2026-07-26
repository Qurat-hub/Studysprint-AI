import React from 'react';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  BookOpen,
  Award,
  Sparkles,
  Flame,
  BarChart2,
  Calendar,
  Activity,
  Layers,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { useApp } from '../../context/AppContext';

export const AnalyticsView: React.FC = () => {
  const { user, assignments, studyLogs, projects, calendarEvents } = useApp();

  // 1. Assignment Metrics
  const completedAssignments = assignments.filter((a) => a.status === 'completed');
  const pendingAssignments = assignments.filter((a) => a.status !== 'completed');
  const assignmentCompletionRate =
    assignments.length > 0 ? Math.round((completedAssignments.length / assignments.length) * 100) : 0;

  // 2. Project & Milestone Metrics
  let totalMilestones = 0;
  let completedMilestones = 0;
  projects.forEach((p) => {
    if (p.milestones && p.milestones.length > 0) {
      totalMilestones += p.milestones.length;
      completedMilestones += p.milestones.filter((m) => m.completed).length;
    }
  });
  const taskCompletionPercentage =
    totalMilestones + assignments.length > 0
      ? Math.round(
          ((completedMilestones + completedAssignments.length) /
            (totalMilestones + assignments.length)) *
            100
        )
      : 0;

  // 3. Upcoming Deadlines in next 7 days
  const now = new Date();
  const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingDeadlines = assignments.filter((a) => {
    if (a.status === 'completed') return false;
    const due = new Date(a.deadline);
    return due >= now && due <= next7Days;
  });

  // 4. Focus Hours Metrics (Weekly & Monthly)
  const totalFocusMinutes = studyLogs.reduce((acc, log) => acc + (log.durationMinutes || 0), 0);
  const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);

  // Group study logs by day of current week (Mon .. Sun)
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const currentWeekHoursMap: Record<string, number> = {
    Mon: 0,
    Tue: 0,
    Wed: 0,
    Thu: 0,
    Fri: 0,
    Sat: 0,
    Sun: 0,
  };

  const startOfWeek = new Date();
  const currentDayIndex = startOfWeek.getDay(); // 0 is Sun
  const distanceToMon = (currentDayIndex + 6) % 7;
  startOfWeek.setDate(startOfWeek.getDate() - distanceToMon);
  startOfWeek.setHours(0, 0, 0, 0);

  studyLogs.forEach((log) => {
    const logDate = new Date(log.date || (log as any).timestamp || Date.now());
    if (logDate >= startOfWeek) {
      const dayIdx = (logDate.getDay() + 6) % 7;
      const dayName = daysOfWeek[dayIdx];
      if (dayName) {
        currentWeekHoursMap[dayName] += (log.durationMinutes || 0) / 60;
      }
    }
  });

  const weeklyHoursChartData = daysOfWeek.map((day) => ({
    day,
    hours: Number(currentWeekHoursMap[day].toFixed(1)),
  }));

  const weeklyFocusTotal = Object.values(currentWeekHoursMap).reduce((a, b) => a + b, 0);

  // 5. Subject Time Distribution
  const subjectHoursMap: Record<string, number> = {};
  studyLogs.forEach((log) => {
    const subj = log.subject || 'General Study';
    subjectHoursMap[subj] = (subjectHoursMap[subj] || 0) + (log.durationMinutes || 0) / 60;
  });

  // Fallback to assignments courses if study logs don't exist yet
  if (Object.keys(subjectHoursMap).length === 0 && assignments.length > 0) {
    assignments.forEach((a) => {
      subjectHoursMap[a.course] = (subjectHoursMap[a.course] || 0) + (a.estimatedHours || 2);
    });
  }

  const palette = ['#CC5F3B', '#D5B7A0', '#6C7A94', '#692E1B', '#4CAF50', '#2196F3', '#9C27B0'];
  const subjectChartData = Object.entries(subjectHoursMap).map(([name, hours], idx) => ({
    name,
    hours: Number(hours.toFixed(1)),
    color: palette[idx % palette.length],
  }));

  // 6. Productivity Score calculation
  const productivityScore = Math.min(
    100,
    Math.round(
      assignmentCompletionRate * 0.4 +
        user.streak * 4 +
        user.level * 3 +
        Math.min(30, weeklyFocusTotal * 2)
    )
  );

  // 7. Recent Activity List
  const recentActivities = [
    ...studyLogs.map((l) => ({
      id: l.id,
      title: `Logged ${l.durationMinutes} min study session in ${l.subject || 'General'}`,
      timestamp: l.date || (l as any).timestamp || new Date().toISOString(),
      type: 'study',
    })),
    ...completedAssignments.map((a) => ({
      id: a.id,
      title: `Completed assignment "${a.title}"`,
      timestamp: a.deadline,
      type: 'task',
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Academic Analytics & Performance Insights
        </h1>
        <p className="text-xs text-slate-500 dark:text-neutral-400">
          Real-time user specific analytics calculated directly from your assignments, focus logs, and study habits
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-[#2B2523]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Focus Time</span>
            <Clock className="h-4 w-4 text-[#CC5F3B]" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{totalFocusHours} hrs</p>
          <span className="text-[10px] text-emerald-600 font-bold">
            {weeklyFocusTotal.toFixed(1)} hrs this week
          </span>
        </div>

        <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-[#2B2523]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Completion Rate</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{assignmentCompletionRate}%</p>
          <span className="text-[10px] text-slate-400">
            {completedAssignments.length} done, {pendingAssignments.length} pending
          </span>
        </div>

        <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-[#2B2523]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Current Streak</span>
            <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{user.streak} Days</p>
          <span className="text-[10px] text-amber-600 font-bold">Productivity Momentum</span>
        </div>

        <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-[#2B2523]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Productivity Score</span>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{productivityScore} / 100</p>
          <span className="text-[10px] text-[#CC5F3B] font-bold">Level {user.level} ({user.xp} XP)</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart 1: Daily Focus Hours This Week */}
        <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-[#2B2523]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Weekly Study Hours</h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400">Logged Pomodoro and study session hours this week</p>
            </div>
            <span className="rounded-xl bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600 dark:bg-neutral-800 dark:text-neutral-300">
              {weeklyFocusTotal.toFixed(1)} hrs total
            </span>
          </div>

          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyHoursChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Bar dataKey="hours" fill="#CC5F3B" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Subject Allocation */}
        <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-[#2B2523]">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Subject Time Breakdown</h2>
          <p className="text-xs text-slate-500 dark:text-neutral-400">Hours allocated across active courses</p>

          {subjectChartData.length > 0 ? (
            <div className="mt-4 flex flex-col items-center justify-center sm:flex-row gap-6">
              <div className="h-56 w-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="hours"
                    >
                      {subjectChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 text-xs">
                {subjectChartData.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-slate-700 dark:text-neutral-300">{item.name}:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{item.hours}h</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-12 text-center text-xs text-slate-400">
              No study logs or subject assignments logged yet.
            </div>
          )}
        </div>
      </div>

      {/* Second Row: Detailed Breakdown & Activity Stream */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Summary Cards */}
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-[#2B2523]">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              <BookOpen className="h-4 w-4 text-[#CC5F3B]" />
              <h3 className="text-xs font-bold">Upcoming Deadlines (7 Days)</h3>
            </div>
            <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{upcomingDeadlines.length}</p>
            <p className="mt-1 text-[11px] text-slate-500">
              {upcomingDeadlines.length === 0 ? 'No urgent deadlines this week!' : 'Assignments due soon'}
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-[#2B2523]">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              <Layers className="h-4 w-4 text-emerald-500" />
              <h3 className="text-xs font-bold">Overall Task Completion Rate</h3>
            </div>
            <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{taskCompletionPercentage}%</p>
            <p className="mt-1 text-[11px] text-slate-500">Calculated across all assignments and project milestones</p>
          </div>
        </div>

        {/* Recent Activity Stream */}
        <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-[#2B2523] lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Recent Activity History</h2>
            <Activity className="h-4 w-4 text-[#CC5F3B]" />
          </div>

          <div className="mt-4 space-y-3">
            {recentActivities.map((act) => (
              <div
                key={act.id}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-[#F8F6F5] p-3 text-xs dark:border-neutral-800/80 dark:bg-neutral-800/40"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#CC5F3B]/10 text-[#CC5F3B]">
                    {act.type === 'study' ? <Clock className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-neutral-200">{act.title}</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {new Date(act.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}

            {recentActivities.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                No recent activity logged yet. Complete tasks or start a study timer to generate analytics!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

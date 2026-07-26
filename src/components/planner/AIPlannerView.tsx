import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  Flame,
  Plus,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateStudyPlan } from '../../services/aiService';
import { AIStudyPlanResult } from '../../types';

export const AIPlannerView: React.FC = () => {
  const { addCalendarEvent, triggerConfetti, addXP } = useApp();

  const [promptInput, setPromptInput] = useState(
    'I have Database Lab, Operating Systems quiz and Software Engineering project due within 5 days.'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [planResult, setPlanResult] = useState<AIStudyPlanResult | null>(null);

  const samplePrompts = [
    'I have Database Lab, Operating Systems quiz and Software Engineering project due within 5 days.',
    'I have Cloud Computing midterm exam in 3 days and 2 lab reports due this Friday.',
    'Help me plan 4 hours of study time every evening for Machine Learning and Web Development.',
  ];

  const handleGeneratePlan = async (queryToUse?: string) => {
    const q = queryToUse || promptInput;
    if (!q.trim()) return;

    setIsLoading(true);
    try {
      const result = await generateStudyPlan(q);
      setPlanResult(result);
      triggerConfetti();
      addXP(150, 'Generated AI Study Sprint Plan');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyToCalendar = () => {
    if (!planResult) return;
    const today = new Date().toISOString().split('T')[0];

    planResult.dailyPlan.forEach((item, idx) => {
      addCalendarEvent({
        title: item.task,
        type: 'study_session',
        course: item.course,
        date: today,
        time: item.timeSlot,
        color: '#CC5F3B',
      });
    });

    triggerConfetti();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#583832] via-[#692E1B] to-[#CC5F3B] p-6 text-white shadow-xl md:p-8">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md text-[#D5B7A0]">
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>Flagship AI Feature</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">AI Study Sprint Planner</h1>
          <p className="max-w-2xl text-xs sm:text-sm text-[#D5B7A0]">
            Enter your current academic workload, exams, or upcoming deadlines. StudySprint AI will calculate priority matrix, daily hourly schedules, task breakdowns, and motivational study strategies.
          </p>
        </div>
      </div>

      {/* Input Form Card */}
      <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-[#2B2523]">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
          Describe your upcoming academic deadlines or courses
        </label>

        <div className="mt-2 relative">
          <textarea
            rows={3}
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="e.g. 'I have Database Lab, Operating Systems quiz and Software Engineering project due within 5 days.'"
            className="w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] p-4 text-xs font-medium text-slate-800 focus:border-[#CC5F3B] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
        </div>

        {/* Quick Sample Chips */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400">Try Sample:</span>
          {samplePrompts.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setPromptInput(sample);
                handleGeneratePlan(sample);
              }}
              className="rounded-xl border border-slate-200 bg-[#F8F6F5] px-3 py-1 text-[11px] font-semibold text-slate-700 hover:border-[#CC5F3B] hover:bg-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-[#CC5F3B]"
            >
              "{sample.slice(0, 38)}..."
            </button>
          ))}
        </div>

        {/* Generate Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => handleGeneratePlan()}
            disabled={isLoading || !promptInput.trim()}
            className="flex items-center gap-2 rounded-2xl bg-[#CC5F3B] px-6 py-3 text-xs font-extrabold text-white shadow-lg shadow-[#CC5F3B]/30 hover:bg-[#692E1B] transition active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Zap className="h-4 w-4 animate-spin" />
                <span>Analyzing Workload with Gemini AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Intelligent Study Plan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Plan Output (Structured Cards) */}
      {planResult && (
        <div className="space-y-6">
          {/* Summary & Key Action Bar */}
          <div className="flex flex-col gap-4 rounded-[28px] border border-amber-200 bg-amber-50/50 p-6 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
                <Sparkles className="h-5 w-5 fill-amber-500 text-amber-500" />
                <h2 className="text-base font-extrabold">Executive Summary</h2>
              </div>
              <p className="text-xs text-slate-700 dark:text-neutral-300 max-w-2xl">{planResult.summary}</p>
            </div>

            <button
              onClick={handleApplyToCalendar}
              className="flex items-center gap-2 rounded-2xl bg-[#CC5F3B] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#692E1B] transition shrink-0"
            >
              <Calendar className="h-4 w-4" />
              <span>Add Schedule to Calendar (+100 XP)</span>
            </button>
          </div>

          {/* Priority Matrix Cards */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
              1. Priority Analysis Matrix
            </h3>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Urgent */}
              <div className="rounded-[24px] border border-red-200 bg-red-50/60 p-4 dark:border-red-950/40 dark:bg-red-950/20">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-extrabold text-xs">
                  <AlertCircle className="h-4 w-4" />
                  <span>Urgent (Do First)</span>
                </div>
                <ul className="mt-2 space-y-1.5 text-xs font-medium text-slate-800 dark:text-neutral-200">
                  {planResult.priorityAnalysis.urgent.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-red-500">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Important */}
              <div className="rounded-[24px] border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-950/40 dark:bg-amber-950/20">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-extrabold text-xs">
                  <Clock className="h-4 w-4" />
                  <span>Important (Schedule)</span>
                </div>
                <ul className="mt-2 space-y-1.5 text-xs font-medium text-slate-800 dark:text-neutral-200">
                  {planResult.priorityAnalysis.important.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-500">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Flexible */}
              <div className="rounded-[24px] border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-950/40 dark:bg-blue-950/20">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-extrabold text-xs">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Flexible (Delegate / Fit In)</span>
                </div>
                <ul className="mt-2 space-y-1.5 text-xs font-medium text-slate-800 dark:text-neutral-200">
                  {planResult.priorityAnalysis.flexible.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-blue-500">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Daily Schedule Timetable */}
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-[#2B2523]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-neutral-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                2. Recommended Daily Schedule ({planResult.totalEstimatedHours} Hours Total)
              </h3>
              <span className="text-xs font-bold text-[#CC5F3B]">
                {planResult.dailyPlan.length} Focus Blocks
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {planResult.dailyPlan.map((slot, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-[#F8F6F5] p-3.5 dark:border-neutral-800 dark:bg-neutral-800/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#CC5F3B]/10 text-[#CC5F3B] font-bold text-xs">
                      #{i + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">{slot.task}</span>
                        <span className="rounded-md bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-neutral-700 dark:text-neutral-300">
                          {slot.course}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-neutral-400">
                        Focus Area: {slot.focusArea}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-neutral-300">
                    <span className="rounded-xl bg-white px-3 py-1 shadow-sm dark:bg-neutral-800">
                      {slot.timeSlot}
                    </span>
                    <span className="text-slate-400">{slot.recommendedDurationMinutes} mins</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Task Breakdown & Subtasks */}
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-[#2B2523]">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">3. Task Breakdown & Subtasks</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {planResult.taskBreakdown.map((tb, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-100 bg-[#F8F6F5] p-4 dark:border-neutral-800 dark:bg-neutral-800/30">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">{tb.taskName}</h4>
                    <span className="text-[10px] font-bold text-[#CC5F3B]">{tb.estimatedHours}h est.</span>
                  </div>
                  <ul className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-neutral-300">
                    {tb.subtasks.map((st, sIdx) => (
                      <li key={sIdx} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#4CAF50] shrink-0" />
                        <span>{st}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Productivity Tips & Advice Card */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-[28px] bg-[#583832] p-5 text-white dark:bg-[#181414]">
              <div className="flex items-center gap-2 text-[#D5B7A0]">
                <Flame className="h-5 w-5 text-amber-400" />
                <h4 className="font-bold text-xs uppercase tracking-wider">Motivational Strategy</h4>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-[#D5B7A0]">
                "{planResult.motivationalAdvice}"
              </p>
            </div>

            <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 dark:border-neutral-800 dark:bg-[#2B2523]">
              <div className="flex items-center gap-2 text-[#CC5F3B]">
                <Lightbulb className="h-5 w-5" />
                <h4 className="font-bold text-xs uppercase tracking-wider">Productivity Hacks</h4>
              </div>
              <ul className="mt-3 space-y-2 text-xs text-slate-700 dark:text-neutral-300">
                {planResult.productivityTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="font-bold text-[#CC5F3B]">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

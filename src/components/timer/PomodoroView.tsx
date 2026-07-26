import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  Clock,
  Flame,
  Award,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PomodoroView: React.FC = () => {
  const { assignments, addXP, triggerConfetti } = useApp();

  const [mode, setMode] = useState<'work' | 'short_break' | 'long_break'>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(assignments[0]?.id || '');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [completedSessionsCount, setCompletedSessionsCount] = useState(3);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Time durations based on mode
  const modeDurations = {
    work: 25 * 60,
    short_break: 5 * 60,
    long_break: 15 * 60,
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      triggerConfetti();
      addXP(25, 'Completed 25-minute Pomodoro Focus Session');
      setCompletedSessionsCount((c) => c + 1);

      if (mode === 'work') {
        setMode('short_break');
        setTimeLeft(modeDurations.short_break);
      } else {
        setMode('work');
        setTimeLeft(modeDurations.work);
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode]);

  const handleModeSwitch = (newMode: 'work' | 'short_break' | 'long_break') => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(modeDurations[newMode]);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(modeDurations[mode]);
  };

  const toggleAmbientAudio = () => {
    setIsAudioPlaying(!isAudioPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progressPercentage = Math.round(
    ((modeDurations[mode] - timeLeft) / modeDurations[mode]) * 100
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Pomodoro Focus Timer</h1>
        <p className="text-xs text-slate-500 dark:text-neutral-400">
          Supercharge your study sessions with timed focus blocks, ambient study audio, and automatic XP rewards
        </p>
      </div>

      {/* Main Timer Display Card */}
      <div className="mx-auto max-w-xl rounded-[32px] border border-slate-200/80 bg-white p-8 shadow-xl text-center dark:border-neutral-800 dark:bg-[#2B2523]">
        {/* Mode Selector Tabs */}
        <div className="inline-flex rounded-2xl border border-slate-200 bg-[#F8F6F5] p-1.5 text-xs font-bold dark:border-neutral-700 dark:bg-neutral-800">
          <button
            onClick={() => handleModeSwitch('work')}
            className={`rounded-xl px-4 py-2 transition ${
              mode === 'work' ? 'bg-[#CC5F3B] text-white shadow-md' : 'text-slate-600 dark:text-neutral-300'
            }`}
          >
            🧠 Deep Focus (25m)
          </button>
          <button
            onClick={() => handleModeSwitch('short_break')}
            className={`rounded-xl px-4 py-2 transition ${
              mode === 'short_break' ? 'bg-[#CC5F3B] text-white shadow-md' : 'text-slate-600 dark:text-neutral-300'
            }`}
          >
            ☕ Short Break (5m)
          </button>
          <button
            onClick={() => handleModeSwitch('long_break')}
            className={`rounded-xl px-4 py-2 transition ${
              mode === 'long_break' ? 'bg-[#CC5F3B] text-white shadow-md' : 'text-slate-600 dark:text-neutral-300'
            }`}
          >
            🌴 Long Break (15m)
          </button>
        </div>

        {/* Big Time Countdown */}
        <div className="my-8">
          <div className="text-6xl sm:text-7xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
            {formatTime(timeLeft)}
          </div>
          <p className="mt-2 text-xs font-semibold text-[#CC5F3B]">
            {mode === 'work' ? 'Stay locked in — eliminate distractions!' : 'Rest your eyes & stretch!'}
          </p>

          {/* Progress Bar */}
          <div className="mx-auto mt-6 h-2.5 max-w-xs overflow-hidden rounded-full bg-slate-100 dark:bg-neutral-800">
            <div
              className="h-full bg-gradient-to-r from-[#CC5F3B] to-amber-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Task Link Selector */}
        <div className="mb-6 rounded-2xl bg-[#F8F6F5] p-3 text-left dark:bg-neutral-800/50">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Linked Assignment / Course
          </label>
          <select
            value={selectedAssignmentId}
            onChange={(e) => setSelectedAssignmentId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-800 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          >
            {assignments.map((asgn) => (
              <option key={asgn.id} value={asgn.id}>
                {asgn.course} — {asgn.title}
              </option>
            ))}
          </select>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={resetTimer}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
            title="Reset Timer"
          >
            <RotateCcw className="h-5 w-5" />
          </button>

          <button
            onClick={toggleTimer}
            className="flex h-14 min-w-[160px] items-center justify-center gap-2 rounded-2xl bg-[#CC5F3B] px-6 text-sm font-black text-white shadow-xl shadow-[#CC5F3B]/30 hover:bg-[#692E1B] transition active:scale-95"
          >
            {isRunning ? (
              <>
                <Pause className="h-5 w-5" />
                <span>Pause Session</span>
              </>
            ) : (
              <>
                <Play className="h-5 w-5 fill-white" />
                <span>Start Session</span>
              </>
            )}
          </button>

          <button
            onClick={toggleAmbientAudio}
            className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition ${
              isAudioPlaying
                ? 'border-[#CC5F3B] bg-[#CC5F3B]/10 text-[#CC5F3B]'
                : 'border-slate-200 bg-white text-slate-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
            }`}
            title="Toggle Ambient Focus Noise"
          >
            {isAudioPlaying ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </button>
        </div>

        {/* Gamification Session Counter */}
        <div className="mt-8 flex items-center justify-center gap-6 border-t border-slate-100 pt-4 text-xs dark:border-neutral-800">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-neutral-300">
            <CheckCircle2 className="h-4 w-4 text-[#4CAF50]" />
            <span>{completedSessionsCount} Sessions Today</span>
          </div>

          <div className="flex items-center gap-1.5 font-bold text-[#CC5F3B]">
            <Award className="h-4 w-4" />
            <span>+{completedSessionsCount * 25} XP Earned</span>
          </div>
        </div>
      </div>
    </div>
  );
};

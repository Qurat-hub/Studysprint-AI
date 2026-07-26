import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  BookOpen,
  AlertTriangle,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CalendarEvent } from '../../types';

export const CalendarView: React.FC = () => {
  const { calendarEvents, addCalendarEvent, assignments } = useApp();

  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'assignment' | 'exam' | 'study_session' | 'project'>('study_session');
  const [course, setCourse] = useState('CS301 - Operating Systems');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:00');
  const [color, setColor] = useState('#CC5F3B');

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    addCalendarEvent({
      title,
      type,
      course,
      date,
      time,
      color,
    });
    setIsModalOpen(false);
    setTitle('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Academic Calendar</h1>
          <p className="text-xs text-slate-500 dark:text-neutral-400">
            Color-coded timetable for exam dates, assignment submissions, and study sprints
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-2xl border border-slate-200 bg-white p-1 text-xs font-bold dark:border-neutral-800 dark:bg-[#2B2523]">
            <button
              onClick={() => setViewMode('month')}
              className={`rounded-xl px-3 py-1.5 transition ${
                viewMode === 'month' ? 'bg-[#CC5F3B] text-white' : 'text-slate-600 dark:text-neutral-300'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`rounded-xl px-3 py-1.5 transition ${
                viewMode === 'week' ? 'bg-[#CC5F3B] text-white' : 'text-slate-600 dark:text-neutral-300'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`rounded-xl px-3 py-1.5 transition ${
                viewMode === 'day' ? 'bg-[#CC5F3B] text-white' : 'text-slate-600 dark:text-neutral-300'
              }`}
            >
              Day
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-2xl bg-[#CC5F3B] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#CC5F3B]/30 hover:bg-[#692E1B] transition active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Month Navigation Control */}
      <div className="flex items-center justify-between rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-[#2B2523]">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevMonth}
            className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-neutral-700 dark:text-neutral-300"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="text-base font-black text-slate-900 dark:text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={handleNextMonth}
            className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-neutral-700 dark:text-neutral-300"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={() => setCurrentDate(new Date())}
          className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-neutral-700 dark:text-neutral-200"
        >
          Today
        </button>
      </div>

      {/* Month Grid View */}
      {viewMode === 'month' && (
        <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-[#2B2523]">
          {/* Day Names Header */}
          <div className="grid grid-cols-7 border-b border-slate-100 bg-[#F8F6F5] p-3 text-center text-xs font-extrabold text-slate-500 dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-400">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-neutral-800">
            {/* Blank offset cells */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`offset_${i}`} className="h-28 bg-[#F8F6F5]/40 dark:bg-neutral-900/20" />
            ))}

            {/* Calendar Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayEvents = calendarEvents.filter((e) => e.date === dateKey);

              const isToday =
                new Date().getDate() === dayNum &&
                new Date().getMonth() === currentDate.getMonth() &&
                new Date().getFullYear() === currentDate.getFullYear();

              return (
                <div
                  key={dayNum}
                  className={`h-28 p-1.5 transition hover:bg-slate-50/80 dark:hover:bg-neutral-800/30 ${
                    isToday ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        isToday ? 'bg-[#CC5F3B] text-white' : 'text-slate-700 dark:text-neutral-300'
                      }`}
                    >
                      {dayNum}
                    </span>
                  </div>

                  <div className="mt-1 space-y-1 overflow-y-auto max-h-20">
                    {dayEvents.map((evt) => (
                      <div
                        key={evt.id}
                        className="truncate rounded-lg px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs"
                        style={{ backgroundColor: evt.color || '#CC5F3B' }}
                        title={`${evt.title} (${evt.time || 'All day'})`}
                      >
                        {evt.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week / Day View List */}
      {(viewMode === 'week' || viewMode === 'day') && (
        <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-[#2B2523]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            {viewMode === 'week' ? 'Upcoming 7-Day Timeline' : 'Today\'s Hourly Schedule'}
          </h3>

          <div className="mt-4 space-y-3">
            {calendarEvents.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No events scheduled.</p>
            ) : (
              calendarEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-[#F8F6F5] p-3.5 text-xs dark:border-neutral-800 dark:bg-neutral-800/40"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-3.5 w-3.5 rounded-full"
                      style={{ backgroundColor: evt.color || '#CC5F3B' }}
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{evt.title}</h4>
                      <p className="text-[11px] text-slate-500">{evt.course} • {evt.type.toUpperCase()}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="block font-bold text-slate-800 dark:text-white">{evt.date}</span>
                    <span className="text-[11px] text-slate-400">{evt.time || 'All Day'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-[#2B2523]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-neutral-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Calendar Event</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-neutral-300">Event Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. OS Quiz 3 / Midterm Review"
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] p-2.5 font-medium text-slate-800 focus:border-[#CC5F3B] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-neutral-300">Event Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] p-2.5 font-medium text-slate-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    <option value="assignment">Assignment Due</option>
                    <option value="exam">Exam / Quiz</option>
                    <option value="study_session">Study Sprint</option>
                    <option value="project">Project Meeting</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-neutral-300">Course Code</label>
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="CS301"
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] p-2.5 font-medium text-slate-800 focus:border-[#CC5F3B] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-neutral-300">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] p-2.5 font-medium text-slate-800 focus:border-[#CC5F3B] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-neutral-300">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] p-2.5 font-medium text-slate-800 focus:border-[#CC5F3B] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-2xl bg-slate-100 px-4 py-2 font-bold text-slate-600 dark:bg-neutral-800 dark:text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-[#CC5F3B] px-5 py-2 font-bold text-white shadow-md hover:bg-[#692E1B]"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

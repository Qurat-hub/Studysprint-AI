import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trash2,
  Edit,
  X,
  Tag,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Assignment, Priority, Difficulty, Status } from '../../types';
import { generateAssignmentHelp } from '../../services/aiService';

export const AssignmentsView: React.FC = () => {
  const { assignments, addAssignment, updateAssignment, deleteAssignment, globalSearch, setActiveTab, triggerConfetti } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'title'>('deadline');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
  const [priority, setPriority] = useState<Priority>('medium');
  const [difficulty, setDifficulty] = useState<Difficulty>('moderate');
  const [estimatedHours, setEstimatedHours] = useState(3);
  const [status, setStatus] = useState<Status>('todo');
  const [progress, setProgress] = useState(0);
  const [tagsInput, setTagsInput] = useState('Assignment, Homework');

  // AI Breakdown State
  const [aiLoadingId, setAiLoadingId] = useState<string | null>(null);
  const [aiBreakdownModal, setAiBreakdownModal] = useState<any | null>(null);

  const courses = Array.from(new Set(assignments.map((a) => a.course)));

  // Filter & Search Logic
  const filteredAssignments = assignments.filter((asgn) => {
    const activeSearch = searchQuery || globalSearch;
    const matchesSearch =
      asgn.title.toLowerCase().includes(activeSearch.toLowerCase()) ||
      asgn.course.toLowerCase().includes(activeSearch.toLowerCase()) ||
      asgn.description.toLowerCase().includes(activeSearch.toLowerCase());

    const matchesCourse = selectedCourse === 'all' || asgn.course === selectedCourse;
    const matchesPriority = selectedPriority === 'all' || asgn.priority === selectedPriority;
    const matchesStatus = selectedStatus === 'all' || asgn.status === selectedStatus;

    return matchesSearch && matchesCourse && matchesPriority && matchesStatus;
  });

  // Sort Logic
  const sortedAssignments = [...filteredAssignments].sort((a, b) => {
    if (sortBy === 'deadline') {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    if (sortBy === 'priority') {
      const pMap = { urgent: 4, high: 3, medium: 2, low: 1 };
      return pMap[b.priority] - pMap[a.priority];
    }
    return a.title.localeCompare(b.title);
  });

  const handleOpenAddModal = () => {
    setEditingId(null);
    setTitle('');
    setCourse('CS301 - Operating Systems');
    setDescription('');
    setDeadline(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
    setPriority('medium');
    setDifficulty('moderate');
    setEstimatedHours(3);
    setStatus('todo');
    setProgress(0);
    setTagsInput('CS, Homework');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (asgn: Assignment) => {
    setEditingId(asgn.id);
    setTitle(asgn.title);
    setCourse(asgn.course);
    setDescription(asgn.description);
    setDeadline(asgn.deadline.slice(0, 16));
    setPriority(asgn.priority);
    setDifficulty(asgn.difficulty);
    setEstimatedHours(asgn.estimatedHours);
    setStatus(asgn.status);
    setProgress(asgn.progress);
    setTagsInput(asgn.tags.join(', '));
    setIsModalOpen(true);
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

    if (editingId) {
      updateAssignment(editingId, {
        title,
        course,
        description,
        deadline: new Date(deadline).toISOString(),
        priority,
        difficulty,
        estimatedHours,
        status,
        progress,
        tags,
      });
    } else {
      addAssignment({
        title,
        course,
        description,
        deadline: new Date(deadline).toISOString(),
        priority,
        difficulty,
        estimatedHours,
        status,
        progress,
        tags,
      });
    }

    setIsModalOpen(false);
  };

  const handleAIBreakdown = async (asgn: Assignment) => {
    setAiLoadingId(asgn.id);
    try {
      const breakdown = await generateAssignmentHelp(asgn.description || asgn.title, asgn.title, asgn.course);
      setAiBreakdownModal({ assignment: asgn, result: breakdown });
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoadingId(null);
    }
  };

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'urgent':
        return <span className="rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:bg-red-950/40 dark:text-red-400">Urgent</span>;
      case 'high':
        return <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">High</span>;
      case 'medium':
        return <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">Medium</span>;
      default:
        return <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-neutral-800 dark:text-neutral-300">Low</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Assignments & Tasks</h1>
          <p className="text-xs text-slate-500 dark:text-neutral-400">
            Track coursework deadlines, estimate study hours, and leverage AI task breakdowns
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 rounded-2xl bg-[#CC5F3B] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#CC5F3B]/30 hover:bg-[#692E1B] transition active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Assignment</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-[#2B2523] md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assignments by title or course..."
            className="w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] py-2 pl-10 pr-4 text-xs font-medium text-slate-800 focus:border-[#CC5F3B] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Course Filter */}
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-[#F8F6F5] px-3 py-2 font-medium text-slate-700 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          >
            <option value="all">All Courses</option>
            {courses.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-[#F8F6F5] px-3 py-2 font-medium text-slate-700 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-[#F8F6F5] px-3 py-2 font-medium text-slate-700 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          {/* Sort By */}
          <button
            onClick={() => setSortBy(sortBy === 'deadline' ? 'priority' : 'deadline')}
            className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-600 hover:bg-slate-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span>Sort: {sortBy}</span>
          </button>
        </div>
      </div>

      {/* Assignment Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {sortedAssignments.length === 0 ? (
          <div className="col-span-2 rounded-[28px] border border-dashed border-slate-300 p-12 text-center text-slate-400 dark:border-neutral-700">
            <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-3 text-sm font-bold">No assignments found</p>
            <p className="text-xs">Adjust your search filter or add a new assignment above.</p>
          </div>
        ) : (
          sortedAssignments.map((asgn) => {
            const isCompleted = asgn.status === 'completed';

            return (
              <div
                key={asgn.id}
                className={`relative flex flex-col justify-between rounded-[28px] border p-5 transition shadow-sm hover:shadow-md ${
                  isCompleted
                    ? 'border-emerald-200 bg-emerald-50/30 dark:border-emerald-950/40 dark:bg-emerald-950/10'
                    : 'border-slate-200/80 bg-white dark:border-neutral-800 dark:bg-[#2B2523]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#CC5F3B]">{asgn.course}</span>
                        {getPriorityBadge(asgn.priority)}
                      </div>
                      <h3
                        className={`text-base font-extrabold text-slate-900 dark:text-white ${
                          isCompleted ? 'line-through opacity-70' : ''
                        }`}
                      >
                        {asgn.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleAIBreakdown(asgn)}
                        disabled={aiLoadingId === asgn.id}
                        className="flex h-8 items-center gap-1 rounded-xl bg-[#CC5F3B]/10 px-2.5 text-[11px] font-bold text-[#CC5F3B] hover:bg-[#CC5F3B]/20 transition"
                        title="Generate AI Task Breakdown"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>{aiLoadingId === asgn.id ? 'Analyzing...' : 'AI Help'}</span>
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(asgn)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteAssignment(asgn.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-slate-600 dark:text-neutral-300 line-clamp-2">
                    {asgn.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {asgn.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-[#F8F6F5] px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-neutral-800 dark:text-neutral-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-3 dark:border-neutral-800">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-neutral-400">
                      <Clock className="h-3.5 w-3.5 text-[#6C7A94]" />
                      <span>
                        Due {new Date(asgn.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        const newStatus = isCompleted ? 'in_progress' : 'completed';
                        updateAssignment(asgn.id, { status: newStatus, progress: isCompleted ? 50 : 100 });
                      }}
                      className={`flex items-center gap-1 rounded-xl px-3 py-1 text-xs font-bold transition ${
                        isCompleted
                          ? 'bg-[#4CAF50] text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-[#CC5F3B] hover:text-white dark:bg-neutral-800 dark:text-neutral-200'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>{isCompleted ? 'Completed' : 'Mark Done'}</span>
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-neutral-800">
                      <div
                        className="h-full bg-gradient-to-r from-[#CC5F3B] to-emerald-500 transition-all duration-300"
                        style={{ width: `${asgn.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{asgn.progress}%</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-[#2B2523]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-neutral-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingId ? 'Edit Assignment' : 'Create New Assignment'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-neutral-300">Assignment Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Database Lab 4: Indexing"
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] p-2.5 font-medium text-slate-800 focus:border-[#CC5F3B] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-neutral-300">Course / Code</label>
                  <input
                    type="text"
                    required
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="CS302 - Database Systems"
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] p-2.5 font-medium text-slate-800 focus:border-[#CC5F3B] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-neutral-300">Deadline Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] p-2.5 font-medium text-slate-800 focus:border-[#CC5F3B] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-neutral-300">Description & Rubric Notes</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details, rubric requirements, submitted file format..."
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] p-2.5 font-medium text-slate-800 focus:border-[#CC5F3B] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-neutral-300">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] p-2.5 font-medium text-slate-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-neutral-300">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] p-2.5 font-medium text-slate-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    <option value="easy">Easy</option>
                    <option value="moderate">Moderate</option>
                    <option value="hard">Hard</option>
                    <option value="extreme">Extreme</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-neutral-300">Est. Hours</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(Number(e.target.value))}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] p-2.5 font-medium text-slate-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-neutral-300">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] p-2.5 font-medium text-slate-800 focus:border-[#CC5F3B] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
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
                  {editingId ? 'Save Changes' : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Assignment Breakdown Modal */}
      {aiBreakdownModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-[28px] border border-[#CC5F3B]/30 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-[#2B2523]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-neutral-800">
              <div className="flex items-center gap-2 text-[#CC5F3B]">
                <Sparkles className="h-5 w-5" />
                <h3 className="text-base font-bold">AI Assignment Breakdown</h3>
              </div>
              <button onClick={() => setAiBreakdownModal(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="rounded-2xl bg-[#F8F6F5] p-4 dark:bg-neutral-800/50">
                <h4 className="font-bold text-slate-900 dark:text-white">{aiBreakdownModal.assignment.title}</h4>
                <p className="mt-1 text-slate-600 dark:text-neutral-300">{aiBreakdownModal.result.summary}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">Important Topics to Master:</h4>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {aiBreakdownModal.result.importantTopics.map((topic: string, i: number) => (
                    <span key={i} className="rounded-lg bg-amber-100 px-2.5 py-1 text-amber-800 font-semibold dark:bg-amber-950/40 dark:text-amber-300">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">Actionable Checklist:</h4>
                <ul className="mt-2 space-y-1.5">
                  {aiBreakdownModal.result.checklist.map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-slate-700 dark:text-neutral-300">
                      <Check className="h-4 w-4 text-[#4CAF50]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">Suggested Multi-Day Timeline:</h4>
                <div className="mt-2 space-y-2">
                  {aiBreakdownModal.result.suggestedTimeline.map((step: any, i: number) => (
                    <div key={i} className="flex items-center justify-between rounded-xl border border-slate-100 p-2.5 dark:border-neutral-800">
                      <span className="font-extrabold text-[#CC5F3B]">{step.day}</span>
                      <span className="text-slate-700 dark:text-neutral-300">{step.goal}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setAiBreakdownModal(null)}
                className="rounded-2xl bg-[#CC5F3B] px-5 py-2 text-xs font-bold text-white"
              >
                Got It, Thanks AI!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

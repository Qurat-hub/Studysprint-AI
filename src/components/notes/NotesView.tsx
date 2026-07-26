import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Sparkles,
  Layers,
  Tag,
  Trash2,
  Edit,
  X,
  Download,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Note } from '../../types';
import { generateNoteSummary, generateFlashcards } from '../../services/aiService';

export const NotesView: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote, globalSearch } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('CS301 - Operating Systems');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('Lecture, OS');

  // AI Feature Modals
  const [activeNoteForAI, setActiveNoteForAI] = useState<Note | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiFlashcards, setAiFlashcards] = useState<Array<{ question: string; answer: string }> | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const courses = Array.from(new Set(notes.map((n) => n.course)));

  const filteredNotes = notes.filter((n) => {
    const activeSearch = searchQuery || globalSearch;
    const matchesSearch =
      n.title.toLowerCase().includes(activeSearch.toLowerCase()) ||
      n.content.toLowerCase().includes(activeSearch.toLowerCase()) ||
      n.course.toLowerCase().includes(activeSearch.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || n.course === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const handleOpenAddModal = () => {
    setEditingId(null);
    setTitle('');
    setCourse('CS301 - Operating Systems');
    setContent('');
    setTagsInput('Lecture, OS');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (note: Note) => {
    setEditingId(note.id);
    setTitle(note.title);
    setCourse(note.course);
    setContent(note.content);
    setTagsInput(note.tags.join(', '));
    setIsModalOpen(true);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

    if (editingId) {
      updateNote(editingId, { title, course, content, tags });
    } else {
      addNote({ title, course, content, tags });
    }
    setIsModalOpen(false);
  };

  const handleGenerateSummary = async (note: Note) => {
    setActiveNoteForAI(note);
    setAiSummary(null);
    setAiFlashcards(null);
    setIsAiLoading(true);

    try {
      const summary = await generateNoteSummary(note.content, note.title);
      setAiSummary(summary);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGenerateFlashcards = async (note: Note) => {
    setActiveNoteForAI(note);
    setAiSummary(null);
    setAiFlashcards(null);
    setIsAiLoading(true);

    try {
      const cards = await generateFlashcards(note.content, note.title);
      setAiFlashcards(cards);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Smart Course Notes</h1>
          <p className="text-xs text-slate-500 dark:text-neutral-400">
            Organize lecture notes, generate AI summaries, and create instant revision flashcards
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 rounded-2xl bg-[#CC5F3B] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#CC5F3B]/30 hover:bg-[#692E1B] transition active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Add Lecture Note</span>
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
            placeholder="Search notes content or tags..."
            className="w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] py-2 pl-10 pr-4 text-xs font-medium text-slate-800 focus:border-[#CC5F3B] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
        </div>

        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="rounded-2xl border border-slate-200 bg-[#F8F6F5] px-3 py-2 text-xs font-medium text-slate-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
        >
          <option value="all">All Courses</option>
          {courses.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filteredNotes.length === 0 ? (
          <div className="col-span-2 rounded-[28px] border border-dashed border-slate-300 p-12 text-center text-slate-400 dark:border-neutral-700">
            <FileText className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-3 text-sm font-bold">No notes found</p>
            <p className="text-xs">Create a lecture note or adjust search query.</p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className="flex flex-col justify-between rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-[#2B2523]"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#CC5F3B]">{note.course}</span>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">{note.title}</h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(note)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-neutral-300 line-clamp-4 whitespace-pre-wrap">
                  {note.content}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {note.tags.map((t, i) => (
                    <span
                      key={i}
                      className="rounded-md bg-[#F8F6F5] px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-neutral-800 dark:text-neutral-300"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI Actions Row */}
              <div className="mt-5 border-t border-slate-100 pt-3 dark:border-neutral-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  Updated {new Date(note.updatedAt).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleGenerateSummary(note)}
                    className="flex items-center gap-1 rounded-xl bg-[#CC5F3B]/10 px-2.5 py-1 text-[11px] font-bold text-[#CC5F3B] hover:bg-[#CC5F3B]/20 transition"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>AI Summary</span>
                  </button>

                  <button
                    onClick={() => handleGenerateFlashcards(note)}
                    className="flex items-center gap-1 rounded-xl bg-purple-100 px-2.5 py-1 text-[11px] font-bold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 hover:bg-purple-200 transition"
                  >
                    <Layers className="h-3.5 w-3.5" />
                    <span>Flashcards</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-[#2B2523]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-neutral-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingId ? 'Edit Note' : 'Create Course Note'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-neutral-300">Note Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Page Replacement Algorithms & Thrashing"
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] p-2.5 font-medium text-slate-800 focus:border-[#CC5F3B] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-neutral-300">Course</label>
                <input
                  type="text"
                  required
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] p-2.5 font-medium text-slate-800 focus:border-[#CC5F3B] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-neutral-300">Content (Markdown / Text)</label>
                <textarea
                  rows={6}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type or paste lecture notes..."
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] p-3 font-medium text-slate-800 focus:border-[#CC5F3B] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
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
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Output Modal (Summary or Flashcards) */}
      {activeNoteForAI && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-[#2B2523]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-neutral-800">
              <div className="flex items-center gap-2 text-[#CC5F3B]">
                <Sparkles className="h-5 w-5" />
                <h3 className="text-base font-bold">
                  {aiSummary ? 'AI Executive Summary' : 'AI Generated Flashcards'}
                </h3>
              </div>
              <button onClick={() => setActiveNoteForAI(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 text-xs space-y-4">
              {isAiLoading ? (
                <div className="py-8 text-center text-slate-500">Generating AI Insights...</div>
              ) : aiSummary ? (
                <div className="rounded-2xl bg-[#F8F6F5] p-4 text-slate-800 dark:bg-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap">
                  {aiSummary}
                </div>
              ) : aiFlashcards ? (
                <div className="space-y-3">
                  {aiFlashcards.map((fc, i) => (
                    <div key={i} className="rounded-2xl border border-slate-200 bg-[#F8F6F5] p-3.5 dark:border-neutral-700 dark:bg-neutral-800">
                      <p className="font-bold text-[#CC5F3B]">Q{i + 1}: {fc.question}</p>
                      <p className="mt-1.5 text-slate-700 dark:text-neutral-200 font-medium">{fc.answer}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveNoteForAI(null)}
                className="rounded-2xl bg-[#CC5F3B] px-5 py-2 text-xs font-bold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Users,
  CheckSquare,
  Clock,
  Link as LinkIcon,
  Trash2,
  Edit,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Project } from '../../types';

export const ProjectsView: React.FC = () => {
  const { projects, addProject, updateProject, deleteProject, toggleMilestone, globalSearch } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  const [membersInput, setMembersInput] = useState('Alex Rivera, Sarah Chen');

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
      p.subject.toLowerCase().includes(globalSearch.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setEditingId(null);
    setName('');
    setSubject('CS490 - Cloud Computing');
    setDescription('');
    setDeadline(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
    setMembersInput('Alex Rivera, Maya Lin');
    setIsModalOpen(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    const members = membersInput.split(',').map((m) => m.trim()).filter(Boolean);

    if (editingId) {
      updateProject(editingId, { name, subject, description, deadline, members });
    } else {
      addProject({
        name,
        subject,
        description,
        deadline,
        members,
        progress: 0,
        milestones: [
          { id: 'm_' + Date.now() + '_1', title: 'Phase 1: Project Architecture & Setup', deadline: deadline, completed: false },
          { id: 'm_' + Date.now() + '_2', title: 'Phase 2: Core Development & Implementation', deadline: deadline, completed: false },
        ],
        checklist: [
          { id: 'c_1', text: 'Initialize repository and setup CI/CD', completed: false },
          { id: 'c_2', text: 'Write technical documentation draft', completed: false },
        ],
        resources: [{ name: 'Project Guidelines Document', url: 'https://university.edu' }],
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Academic Projects</h1>
          <p className="text-xs text-slate-500 dark:text-neutral-400">
            Manage multi-person group capstones, research milestones, and deliverables
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 rounded-2xl bg-[#CC5F3B] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#CC5F3B]/30 hover:bg-[#692E1B] transition active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>New Project Capstone</span>
        </button>
      </div>

      {/* Projects List */}
      <div className="space-y-6">
        {filteredProjects.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 p-12 text-center text-slate-400 dark:border-neutral-700">
            <FolderKanban className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-3 text-sm font-bold">No active projects</p>
            <p className="text-xs">Create a project to manage milestones and group tasks.</p>
          </div>
        ) : (
          filteredProjects.map((proj) => {
            const completedMilestones = proj.milestones.filter((m) => m.completed).length;

            return (
              <div
                key={proj.id}
                className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-[#2B2523]"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#CC5F3B]">{proj.subject}</span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">{proj.name}</h3>
                    <p className="text-xs text-slate-600 dark:text-neutral-300 max-w-2xl">{proj.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => deleteProject(proj.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500"
                      title="Delete project"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar & Key Meta */}
                <div className="mt-4 grid grid-cols-1 gap-4 border-y border-slate-100 py-3 dark:border-neutral-800 sm:grid-cols-3">
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="h-4 w-4 text-[#6C7A94]" />
                    <span className="text-slate-600 dark:text-neutral-300">
                      Deadline: <span className="font-bold text-slate-900 dark:text-white">{proj.deadline}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <Users className="h-4 w-4 text-[#6C7A94]" />
                    <span className="text-slate-600 dark:text-neutral-300">
                      Team: <span className="font-bold text-slate-900 dark:text-white">{proj.members.join(', ')}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <CheckSquare className="h-4 w-4 text-[#6C7A94]" />
                    <span className="text-slate-600 dark:text-neutral-300">
                      Milestones: <span className="font-bold text-[#CC5F3B]">{completedMilestones} / {proj.milestones.length}</span>
                    </span>
                  </div>
                </div>

                {/* Milestones List */}
                <div className="mt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                    Milestone Roadmap
                  </h4>
                  <div className="mt-2 space-y-2">
                    {proj.milestones.map((ms) => (
                      <div
                        key={ms.id}
                        onClick={() => toggleMilestone(proj.id, ms.id)}
                        className={`flex cursor-pointer items-center justify-between rounded-2xl border p-3 text-xs transition ${
                          ms.completed
                            ? 'border-emerald-200 bg-emerald-50/40 text-emerald-900 dark:border-emerald-950/40 dark:bg-emerald-950/20 dark:text-emerald-300'
                            : 'border-slate-100 bg-[#F8F6F5] text-slate-800 dark:border-neutral-800 dark:bg-neutral-800/40 dark:text-neutral-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2
                            className={`h-4 w-4 ${ms.completed ? 'text-emerald-500 fill-emerald-100' : 'text-slate-300'}`}
                          />
                          <span className={`font-semibold ${ms.completed ? 'line-through opacity-80' : ''}`}>
                            {ms.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">Target: {ms.deadline}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-[#2B2523]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-neutral-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Create New Project Capstone</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-neutral-300">Project Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Distributed Cloud Microservices Capstone"
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] p-2.5 font-medium text-slate-800 focus:border-[#CC5F3B] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-neutral-300">Subject / Course</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="CS490 - Cloud Computing"
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] p-2.5 font-medium text-slate-800 focus:border-[#CC5F3B] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-neutral-300">Final Deadline</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] p-2.5 font-medium text-slate-800 focus:border-[#CC5F3B] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-neutral-300">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Goals, deliverables, stack..."
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] p-2.5 font-medium text-slate-800 focus:border-[#CC5F3B] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-neutral-300">Team Members (comma separated)</label>
                <input
                  type="text"
                  value={membersInput}
                  onChange={(e) => setMembersInput(e.target.value)}
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
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

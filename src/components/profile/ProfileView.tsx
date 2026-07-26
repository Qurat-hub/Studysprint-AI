import React, { useState, useRef } from 'react';
import {
  User,
  GraduationCap,
  School,
  Award,
  Zap,
  Flame,
  CheckCircle2,
  Edit,
  Save,
  BookOpen,
  Camera,
  Trash2,
  Plus,
  Clock,
  X,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import { useApp } from '../../context/AppContext';

export const ProfileView: React.FC = () => {
  const { user, updateProfile, triggerConfetti, assignments, studyLogs } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [university, setUniversity] = useState(user.university);
  const [degree, setDegree] = useState(user.degree);
  const [semester, setSemester] = useState(user.semester);
  const [major, setMajor] = useState(user.major);
  const [preferredStudyHours, setPreferredStudyHours] = useState(user.preferredStudyHours || 'Morning (8 AM - 12 PM)');
  const [goals, setGoals] = useState<string[]>(user.studyGoals || []);
  const [newGoalInput, setNewGoalInput] = useState('');

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const completedAssignmentsCount = assignments.filter((a) => a.status === 'completed').length;
  const totalStudyMinutes = studyLogs.reduce((acc, log) => acc + (log.durationMinutes || 0), 0);
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);

  const handleSave = async () => {
    await updateProfile({
      name,
      university,
      degree,
      semester,
      major,
      preferredStudyHours,
      studyGoals: goals,
    });
    setIsEditing(false);
    triggerConfetti();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setAvatarError(null);

    try {
      const storageRef = ref(storage, `users/${user.id || 'me'}/avatar_${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      await updateProfile({ avatar: downloadUrl });
    } catch (err: any) {
      console.warn('Firebase Storage upload failed, using Data URL fallback:', err);
      // Fallback to data URL if storage bucket is unavailable
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const dataUrl = evt.target?.result as string;
        if (dataUrl) {
          await updateProfile({ avatar: dataUrl });
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    await updateProfile({ avatar: '' });
  };

  const handleAddGoal = () => {
    if (!newGoalInput.trim()) return;
    setGoals((prev) => [...prev, newGoalInput.trim()]);
    setNewGoalInput('');
  };

  const handleRemoveGoal = (index: number) => {
    setGoals((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Profile Banner */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-[#583832] via-[#692E1B] to-[#CC5F3B] p-6 text-white shadow-xl md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col items-center gap-5 sm:flex-row">
            {/* Avatar Section */}
            <div className="relative group">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-24 w-24 rounded-2xl border-2 border-white/30 object-cover shadow-lg"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-white/30 bg-white/10 text-3xl font-black text-white shadow-lg">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'S'}
                </div>
              )}

              {/* Uploading Overlay */}
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/60">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}

              {/* Upload Controls */}
              <div className="mt-2 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="flex items-center gap-1 rounded-xl bg-white/20 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-white/30 transition backdrop-blur-md"
                >
                  <Camera className="h-3 w-3" />
                  <span>Change</span>
                </button>
                {user.avatar && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="flex items-center gap-1 rounded-xl bg-red-500/30 px-2.5 py-1 text-[10px] font-bold text-red-200 hover:bg-red-500/50 transition backdrop-blur-md"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-black sm:text-3xl">{user.name}</h1>
              <p className="mt-1 text-xs text-[#D5B7A0]">
                {user.degree} • {user.major}
              </p>
              <p className="text-xs text-[#D5B7A0]/80">{user.university}</p>

              <div className="mt-3 flex flex-wrap justify-center sm:justify-start items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-xl bg-white/15 px-3 py-1 text-[11px] font-bold text-amber-300 backdrop-blur-md">
                  <Zap className="h-3.5 w-3.5 fill-amber-300" />
                  Level {user.level} Student
                </span>
                <span className="inline-flex items-center gap-1 rounded-xl bg-white/15 px-3 py-1 text-[11px] font-bold text-amber-200 backdrop-blur-md">
                  <Flame className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {user.streak} Day Streak
                </span>
                <span className="inline-flex items-center gap-1 rounded-xl bg-white/15 px-3 py-1 text-[11px] font-bold text-[#D5B7A0] backdrop-blur-md">
                  {user.xp} Total XP
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className="flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-xs font-bold text-[#583832] shadow-md hover:bg-amber-50 transition active:scale-95"
          >
            {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
            <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
          </button>
        </div>
      </div>

      {avatarError && (
        <div className="rounded-2xl bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
          {avatarError}
        </div>
      )}

      {/* User Performance Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-[#2B2523]">
          <span className="text-xs font-semibold text-slate-500">Study Hours Logged</span>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{totalStudyHours} hrs</p>
          <span className="text-[10px] text-emerald-600 font-bold">Total focus sessions</span>
        </div>

        <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-[#2B2523]">
          <span className="text-xs font-semibold text-slate-500">Completed Tasks</span>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{completedAssignmentsCount}</p>
          <span className="text-[10px] text-slate-400">Assignments finished</span>
        </div>

        <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-[#2B2523]">
          <span className="text-xs font-semibold text-slate-500">Academic Level</span>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">Level {user.level}</p>
          <span className="text-[10px] text-[#CC5F3B] font-bold">Next level: {(user.level * 500) - user.xp} XP</span>
        </div>

        <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-[#2B2523]">
          <span className="text-xs font-semibold text-slate-500">Active Streak</span>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{user.streak} Days</p>
          <span className="text-[10px] text-amber-600 font-bold">Consecutive activity</span>
        </div>
      </div>

      {/* Profile Academic Credentials Form */}
      <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-[#2B2523]">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Academic Details & Preferences</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs font-bold text-[#CC5F3B] hover:underline"
            >
              Edit Details
            </button>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 text-xs sm:grid-cols-2">
          {/* Full Name */}
          <div>
            <label className="block font-semibold text-slate-500 dark:text-neutral-400">Full Name</label>
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] p-3 font-bold text-slate-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            ) : (
              <p className="mt-1.5 text-sm font-extrabold text-slate-900 dark:text-white">{user.name}</p>
            )}
          </div>

          {/* University */}
          <div>
            <label className="block font-semibold text-slate-500 dark:text-neutral-400">University / College</label>
            {isEditing ? (
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] p-3 font-bold text-slate-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            ) : (
              <p className="mt-1.5 text-sm font-extrabold text-slate-900 dark:text-white">{user.university}</p>
            )}
          </div>

          {/* Degree */}
          <div>
            <label className="block font-semibold text-slate-500 dark:text-neutral-400">Degree Program</label>
            {isEditing ? (
              <input
                type="text"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] p-3 font-bold text-slate-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            ) : (
              <p className="mt-1.5 text-sm font-extrabold text-slate-900 dark:text-white">{user.degree}</p>
            )}
          </div>

          {/* Major */}
          <div>
            <label className="block font-semibold text-slate-500 dark:text-neutral-400">Major Field</label>
            {isEditing ? (
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] p-3 font-bold text-slate-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            ) : (
              <p className="mt-1.5 text-sm font-extrabold text-slate-900 dark:text-white">{user.major}</p>
            )}
          </div>

          {/* Semester */}
          <div>
            <label className="block font-semibold text-slate-500 dark:text-neutral-400">Semester / Academic Term</label>
            {isEditing ? (
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] p-3 font-bold text-slate-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            ) : (
              <p className="mt-1.5 text-sm font-extrabold text-slate-900 dark:text-white">{user.semester}</p>
            )}
          </div>

          {/* Preferred Study Hours */}
          <div>
            <label className="block font-semibold text-slate-500 dark:text-neutral-400">Preferred Study Time Window</label>
            {isEditing ? (
              <select
                value={preferredStudyHours}
                onChange={(e) => setPreferredStudyHours(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] p-3 font-bold text-slate-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              >
                <option value="Early Bird (5 AM - 9 AM)">Early Bird (5 AM - 9 AM)</option>
                <option value="Morning (8 AM - 12 PM)">Morning (8 AM - 12 PM)</option>
                <option value="Afternoon (1 PM - 5 PM)">Afternoon (1 PM - 5 PM)</option>
                <option value="Evening (6 PM - 10 PM)">Evening (6 PM - 10 PM)</option>
                <option value="Night Owl (10 PM - 2 AM)">Night Owl (10 PM - 2 AM)</option>
              </select>
            ) : (
              <p className="mt-1.5 text-sm font-extrabold text-slate-900 dark:text-white">
                {user.preferredStudyHours || 'Morning (8 AM - 12 PM)'}
              </p>
            )}
          </div>
        </div>

        {/* Study Goals Section */}
        <div className="mt-6 border-t border-slate-100 pt-5 dark:border-neutral-800">
          <label className="block font-semibold text-slate-500 dark:text-neutral-400 text-xs">Academic Goals</label>

          <div className="mt-3 flex flex-wrap gap-2">
            {goals.map((g, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-2xl border border-[#CC5F3B]/30 bg-[#CC5F3B]/10 px-3 py-1.5 text-xs font-bold text-[#CC5F3B] dark:bg-[#CC5F3B]/20"
              >
                <span>{g}</span>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => handleRemoveGoal(idx)}
                    className="hover:text-red-500 transition"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
            {goals.length === 0 && !isEditing && (
              <span className="text-xs italic text-slate-400">No study goals added yet.</span>
            )}
          </div>

          {isEditing && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="Add a new academic goal (e.g. Maintain 3.8+ GPA)..."
                value={newGoalInput}
                onChange={(e) => setNewGoalInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGoal())}
                className="w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] p-2.5 text-xs font-medium text-slate-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddGoal}
                className="flex shrink-0 items-center gap-1 rounded-2xl bg-[#CC5F3B] px-4 py-2 text-xs font-bold text-white hover:bg-[#b04f30] transition"
              >
                <Plus className="h-4 w-4" />
                <span>Add</span>
              </button>
            </div>
          )}
        </div>

        {isEditing && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-2xl bg-[#CC5F3B] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#b04f30] transition"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

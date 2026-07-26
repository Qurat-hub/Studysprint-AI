import React from 'react';
import {
  Settings,
  Moon,
  Sun,
  Bell,
  Sparkles,
  Database,
  Download,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SettingsView: React.FC = () => {
  const { theme, toggleTheme, notifications, triggerConfetti } = useApp();

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(localStorage.getItem('studysprint_state') || '{}');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'studysprint_backup.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerConfetti();
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all StudySprint local state? This will reload defaults.')) {
      localStorage.removeItem('studysprint_state');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Settings & Preferences</h1>
        <p className="text-xs text-slate-500 dark:text-neutral-400">
          Configure StudySprint theme, AI assistant settings, notifications, and local backups
        </p>
      </div>

      {/* Theme Settings Card */}
      <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-[#2B2523]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#CC5F3B]/10 text-[#CC5F3B]">
              {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Interface Theme Mode</h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Switch between warm light surface and dark contrast mode
              </p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="rounded-2xl border border-slate-200 bg-[#F8F6F5] px-4 py-2 text-xs font-bold text-slate-800 hover:border-[#CC5F3B] transition dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          >
            {theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          </button>
        </div>
      </div>

      {/* AI Assistant Settings */}
      <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-[#2B2523]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#CC5F3B]/10 text-[#CC5F3B]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Gemini AI Model Configuration</h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Server-side Gemini 2.5 Flash pipeline status & key verification
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-emerald-50 p-4 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="font-semibold">Gemini 2.5 Flash Server Proxy Active</span>
          </div>
          <span className="font-bold text-[10px] uppercase tracking-wider bg-emerald-200/60 dark:bg-emerald-900 px-2 py-0.5 rounded-md">
            Operational
          </span>
        </div>
      </div>

      {/* Data Backup & Local Storage */}
      <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-[#2B2523]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#CC5F3B]/10 text-[#CC5F3B]">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Data Storage & Portability</h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Export your study data as JSON or reset local database state
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={handleExportData}
            className="flex items-center gap-2 rounded-2xl bg-[#CC5F3B] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#692E1B] transition"
          >
            <Download className="h-4 w-4" />
            <span>Export Application JSON</span>
          </button>

          <button
            onClick={handleResetData}
            className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-100 transition dark:border-red-950/40 dark:bg-red-950/20 dark:text-red-400"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset Local State</span>
          </button>
        </div>
      </div>
    </div>
  );
};

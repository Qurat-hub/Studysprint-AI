import React from 'react';
import { Bell, Check, Trash2, X, AlertTriangle, Sparkles, Flame, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NotificationDrawerProps {
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ onClose }) => {
  const { notifications, markNotificationRead, clearAllNotifications } = useApp();

  const getIcon = (type: string) => {
    switch (type) {
      case 'deadline':
        return <AlertTriangle className="h-4 w-4 text-[#E53935]" />;
      case 'streak':
        return <Flame className="h-4 w-4 text-amber-500" />;
      case 'ai':
        return <Sparkles className="h-4 w-4 text-[#CC5F3B]" />;
      case 'exam':
        return <Calendar className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-[#6C7A94]" />;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-[24px] border border-slate-200 bg-white p-4 shadow-2xl dark:border-neutral-800 dark:bg-[#2B2523] z-50">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-[#CC5F3B]" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
        </div>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-red-500 transition"
              title="Clear all"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 max-h-80 overflow-y-auto space-y-2 pr-1">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 dark:text-neutral-500">
            No active notifications. All caught up! 🎉
          </div>
        ) : (
          notifications.map((notif, idx) => (
            <div
              key={`${notif.id}_${idx}`}
              onClick={() => markNotificationRead(notif.id)}
              className={`flex items-start gap-3 rounded-2xl p-3 transition cursor-pointer ${
                notif.isRead
                  ? 'bg-[#F8F6F5] dark:bg-neutral-800/40 opacity-75'
                  : 'bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30'
              }`}
            >
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-neutral-800">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{notif.title}</h4>
                  <span className="text-[10px] text-slate-400 shrink-0">{notif.timestamp}</span>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-600 dark:text-neutral-300 line-clamp-2">{notif.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

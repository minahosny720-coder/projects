import React from 'react';
import { FilterView } from '../types/task';
import { 
  CheckCircle2, 
  Clock, 
  Flame, 
  CalendarDays, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  Bell, 
  Plus, 
  Timer,
  Settings as SettingsIcon,
  FolderKanban
} from 'lucide-react';

interface TopBarProps {
  currentFilter: FilterView;
  onFilterChange: (filter: FilterView) => void;
  counts: {
    today: number;
    upcoming: number;
    urgent: number;
    completed: number;
    all: number;
  };
  streak: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenNewTask: () => void;
  onOpenFocus: () => void;
  onOpenSettings: () => void;
  onOpenProjects: () => void;
  projectsCount: number;
  hasActiveAlerts: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentFilter,
  onFilterChange,
  counts,
  streak,
  isDarkMode,
  onToggleDarkMode,
  soundEnabled,
  onToggleSound,
  onOpenNewTask,
  onOpenFocus,
  onOpenSettings,
  onOpenProjects,
  projectsCount,
  hasActiveAlerts,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
        
        {/* Zone 1: Single text element wordmark with clean icon */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold text-lg shadow-sm">
            مُ
          </div>
          <span className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
            مُنجز
          </span>
          {streak > 0 && (
            <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-800/60 tabular-nums">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{streak} {streak === 1 ? 'يوم مستمر' : 'أيام مستمرة'}</span>
            </div>
          )}
        </div>

        {/* Zone 2: Navigation filter tabs (Functional segmented buttons) */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/70 rounded-xl">
          <button
            onClick={() => onFilterChange('today')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              currentFilter === 'today'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <span>اليوم</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-zinc-200/60 dark:bg-zinc-700/60 tabular-nums">
              {counts.today}
            </span>
          </button>

          <button
            onClick={() => onFilterChange('upcoming')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              currentFilter === 'upcoming'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>القادمة</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-zinc-200/60 dark:bg-zinc-700/60 tabular-nums">
              {counts.upcoming}
            </span>
          </button>

          <button
            onClick={() => onFilterChange('urgent')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              currentFilter === 'urgent'
                ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>العاجلة</span>
            {counts.urgent > 0 && (
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 tabular-nums font-bold">
                {counts.urgent}
              </span>
            )}
          </button>

          <button
            onClick={() => onFilterChange('completed')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              currentFilter === 'completed'
                ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>المكتملة</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-zinc-200/60 dark:bg-zinc-700/60 tabular-nums">
              {counts.completed}
            </span>
          </button>

          <button
            onClick={() => onFilterChange('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              currentFilter === 'all'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <span>الكل</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-zinc-200/60 dark:bg-zinc-700/60 tabular-nums">
              {counts.all}
            </span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action group */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Projects Button */}
          <button
            onClick={onOpenProjects}
            title="إدارة المشاريع وأرقامها"
            className="p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
          >
            <FolderKanban className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline whitespace-nowrap">المشاريع</span>
            {projectsCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 tabular-nums font-bold">
                {projectsCount}
              </span>
            )}
          </button>

          {/* Pomodoro Focus Button */}
          <button
            onClick={onOpenFocus}
            title="جلسة تركيز (بومودورو)"
            className="p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
          >
            <Timer className="w-4 h-4 text-amber-500" />
            <span className="hidden lg:inline whitespace-nowrap">مؤقت التركيز</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'كتم التنبيهات الصوتية' : 'تفعيل التنبيهات الصوتية'}
            className="p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400" /> : <VolumeX className="w-4 h-4 text-zinc-400" />}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            title={isDarkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
            className="p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
          </button>

          {/* Settings / Backup */}
          <button
            onClick={onOpenSettings}
            title="الإعدادات والنسخ الاحتياطي"
            className="p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          {/* Primary CTA: Add Task */}
          <button
            onClick={onOpenNewTask}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg shadow-sm transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">مهمة جديدة</span>
          </button>
        </div>

      </div>

      {/* Mobile subnav bar */}
      <div className="flex md:hidden items-center justify-around px-2 py-2 border-t border-zinc-200/60 dark:border-zinc-800 overflow-x-auto">
        <button
          onClick={() => onFilterChange('today')}
          className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${currentFilter === 'today' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'text-zinc-600 dark:text-zinc-400'}`}
        >
          اليوم ({counts.today})
        </button>
        <button
          onClick={() => onFilterChange('upcoming')}
          className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${currentFilter === 'upcoming' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'text-zinc-600 dark:text-zinc-400'}`}
        >
          القادمة ({counts.upcoming})
        </button>
        <button
          onClick={() => onFilterChange('urgent')}
          className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${currentFilter === 'urgent' ? 'bg-rose-600 text-white' : 'text-rose-600 dark:text-rose-400'}`}
        >
          العاجلة ({counts.urgent})
        </button>
        <button
          onClick={() => onFilterChange('completed')}
          className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${currentFilter === 'completed' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'text-zinc-600 dark:text-zinc-400'}`}
        >
          المكتملة ({counts.completed})
        </button>
      </div>
    </header>
  );
};

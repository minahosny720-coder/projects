import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Task, Subtask, FilterView, SmartAlert, DailySummary, Priority, Project } from './types/task';
import { 
  loadTasksFromStorage, 
  saveTasksToStorage, 
  loadProjectsFromStorage,
  saveProjectsToStorage,
  loadSettings, 
  saveSettings, 
  UserSettings, 
  DEFAULT_CATEGORIES, 
  updateAndGetStreak,
  getDefaultSampleTasks,
  DEFAULT_PROJECTS
} from './utils/storage';
import { getTodayDateString, calculateMinutesRemaining } from './utils/date';
import { sound } from './utils/audio';
import { fireCelebrationConfetti } from './utils/confetti';
import { 
  requestNotificationPermission, 
  sendBrowserNotification, 
  getNotificationPermission 
} from './utils/notifications';

import { TopBar } from './components/TopBar';
import { SmartAlertBanner } from './components/SmartAlertBanner';
import { DailyBriefingCard } from './components/DailyBriefingCard';
import { QuickAddTask } from './components/QuickAddTask';
import { TaskCard } from './components/TaskCard';
import { TaskEditModal } from './components/TaskEditModal';
import { FocusPomodoroModal } from './components/FocusPomodoroModal';
import { SettingsModal } from './components/SettingsModal';
import { ProjectManagerModal } from './components/ProjectManagerModal';

import { 
  Search, 
  CheckCheck, 
  Inbox, 
  FolderKanban,
  X,
  Plus
} from 'lucide-react';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasksFromStorage());
  const [projects, setProjects] = useState<Project[]>(() => loadProjectsFromStorage());
  const [settings, setSettings] = useState<UserSettings>(() => loadSettings());
  const [filter, setFilter] = useState<FilterView>('today');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'dueTime' | 'priority' | 'created'>('dueTime');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Modal States
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);

  // Alerts State
  const [dismissedAlertIds, setDismissedAlertIds] = useState<Set<string>>(new Set());
  const notifiedTaskIdsRef = useRef<Set<string>>(new Set());
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() =>
    getNotificationPermission()
  );

  // Sync dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Sync audio enabled
  useEffect(() => {
    sound.setSoundEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Save tasks on changes
  useEffect(() => {
    saveTasksToStorage(tasks);
  }, [tasks]);

  // Save projects on changes
  useEffect(() => {
    saveProjectsToStorage(projects);
  }, [projects]);

  // Save settings on changes
  const handleUpdateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Streak calculations
  const streak = useMemo(() => {
    const hasCompletedToday = tasks.some(
      (t) => t.completed && t.completedAt && t.completedAt.startsWith(getTodayDateString())
    );
    return updateAndGetStreak(hasCompletedToday).currentStreak;
  }, [tasks]);

  // Request browser notification permission
  const handleRequestPermission = async () => {
    const perm = await requestNotificationPermission();
    setNotificationPermission(perm);
    if (perm === 'granted') {
      sendBrowserNotification('مُنجز: تم تفعيل التنبيهات الذكية!', {
        body: 'سنقوم بتنبيهك بمواعيد مهامك الهامة بدقة.',
      });
      sound.playReminderAlertChime();
    }
  };

  // Periodic Smart Alert Checker
  const activeAlerts = useMemo<SmartAlert[]>(() => {
    const today = getTodayDateString();
    const alerts: SmartAlert[] = [];

    tasks.forEach((task) => {
      if (task.completed) return;
      if (task.dueDate !== today || !task.dueTime) return;

      const mins = calculateMinutesRemaining(task.dueDate, task.dueTime);
      if (mins === null) return;

      const alertId = `${task.id}-${task.dueTime}`;
      if (dismissedAlertIds.has(alertId)) return;

      // Overdue
      if (mins < -1) {
        alerts.push({
          id: alertId,
          taskId: task.id,
          taskTitle: task.title,
          dueTime: task.dueTime,
          dueDate: task.dueDate,
          type: 'overdue',
          minutesRemaining: mins,
        });
      }
      // Due right now
      else if (mins >= -1 && mins <= 2) {
        alerts.push({
          id: alertId,
          taskId: task.id,
          taskTitle: task.title,
          dueTime: task.dueTime,
          dueDate: task.dueDate,
          type: 'due_now',
          minutesRemaining: mins,
        });
      }
      // Due soon
      else if (mins > 2 && mins <= Math.max(task.reminderOffsetMinutes ?? 15, 20)) {
        alerts.push({
          id: alertId,
          taskId: task.id,
          taskTitle: task.title,
          dueTime: task.dueTime,
          dueDate: task.dueDate,
          type: 'due_soon',
          minutesRemaining: mins,
        });
      }
    });

    return alerts;
  }, [tasks, dismissedAlertIds]);

  // Trigger Sound & Notification when new smart alert arrives
  useEffect(() => {
    activeAlerts.forEach((alert) => {
      if (!notifiedTaskIdsRef.current.has(alert.id)) {
        notifiedTaskIdsRef.current.add(alert.id);
        sound.playReminderAlertChime();

        if (notificationPermission === 'granted') {
          const bodyText =
            alert.type === 'overdue'
              ? `المهمة متأخرة عن موعدها المحدد (${alert.dueTime})`
              : alert.type === 'due_now'
              ? `حان موعد المهمة الآن!`
              : `متبقي ${alert.minutesRemaining} دقيقة على موعد المهمة`;

          sendBrowserNotification(`تنبيه مُنجز: ${alert.taskTitle}`, {
            body: bodyText,
          });
        }
      }
    });
  }, [activeAlerts, notificationPermission]);

  // Task actions
  const handleToggleComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextCompleted = !t.completed;
          if (nextCompleted) {
            sound.playTaskCompleteChime();
            fireCelebrationConfetti();
          }
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    const created: Task = {
      ...newTaskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [created, ...prev]);
    sound.playTaskCompleteChime();
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleUpdateSubtasks = (taskId: string, subtasks: Subtask[]) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, subtasks } : t)));
  };

  const handleSnoozeTask = (taskId: string, minutes: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId && t.dueTime) {
          const [h, m] = t.dueTime.split(':').map(Number);
          const dateObj = new Date();
          dateObj.setHours(h, m + minutes);
          const newH = String(dateObj.getHours()).padStart(2, '0');
          const newM = String(dateObj.getMinutes()).padStart(2, '0');
          return { ...t, dueTime: `${newH}:${newM}` };
        }
        return t;
      })
    );
  };

  const handleDismissAlert = (alertId: string) => {
    setDismissedAlertIds((prev) => new Set([...prev, alertId]));
  };

  const handleStartFocus = (task: Task) => {
    setFocusTask(task);
    setIsFocusModalOpen(true);
  };

  // Project management actions
  const handleAddProject = (newProjectData: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...newProjectData,
      id: `prj-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    setProjects((prev) => [...prev, newProject]);
  };

  const handleUpdateProject = (updated: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    // Synchronize tasks referencing this project
    setTasks((prev) =>
      prev.map((t) => {
        if (t.projectId === updated.id) {
          return {
            ...t,
            projectNumber: updated.number,
            projectName: updated.name,
          };
        }
        return t;
      })
    );
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    setTasks((prev) =>
      prev.map((t) => {
        if (t.projectId === projectId) {
          return {
            ...t,
            projectId: undefined,
            projectNumber: undefined,
            projectName: undefined,
          };
        }
        return t;
      })
    );
    if (selectedProjectFilter === projectId) {
      setSelectedProjectFilter('all');
    }
  };

  // Filter & Counts calculations
  const todayStr = getTodayDateString();
  const counts = useMemo(() => {
    return {
      today: tasks.filter((t) => t.dueDate === todayStr && !t.completed).length,
      upcoming: tasks.filter((t) => t.dueDate > todayStr && !t.completed).length,
      urgent: tasks.filter(
        (t) => (t.priority === 'urgent' || t.priority === 'high') && !t.completed
      ).length,
      completed: tasks.filter((t) => t.completed).length,
      all: tasks.length,
    };
  }, [tasks, todayStr]);

  // Currently filtered project object
  const activeProject = useMemo(() => {
    if (selectedProjectFilter === 'all') return null;
    return projects.find((p) => p.id === selectedProjectFilter || p.number === selectedProjectFilter) || null;
  }, [projects, selectedProjectFilter]);

  // Filtered task list
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // 1. Tab Filter
      if (filter === 'today' && (t.dueDate !== todayStr || t.completed)) return false;
      if (filter === 'upcoming' && (t.dueDate <= todayStr || t.completed)) return false;
      if (filter === 'urgent' && ((t.priority !== 'urgent' && t.priority !== 'high') || t.completed))
        return false;
      if (filter === 'completed' && !t.completed) return false;

      // 2. Category Filter
      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;

      // 3. Project Filter
      if (selectedProjectFilter !== 'all') {
        const matchesProjectId = t.projectId === selectedProjectFilter;
        const matchesProjectNum = t.projectNumber === selectedProjectFilter;
        if (!matchesProjectId && !matchesProjectNum) return false;
      }

      // 4. Search query (matches title, description, category, project number, project name)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesDesc = t.description?.toLowerCase().includes(query);
        const matchesCat = t.category.toLowerCase().includes(query);
        const matchesProjNum = t.projectNumber?.toLowerCase().includes(query);
        const matchesProjName = t.projectName?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesCat && !matchesProjNum && !matchesProjName) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'dueTime') {
        const timeA = a.dueTime || '99:99';
        const timeB = b.dueTime || '99:99';
        return timeA.localeCompare(timeB);
      }
      if (sortBy === 'priority') {
        const pOrder: Record<Priority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
        return pOrder[a.priority] - pOrder[b.priority];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks, filter, selectedCategory, selectedProjectFilter, searchQuery, sortBy, todayStr]);

  // Today tasks for summary
  const todayTasks = useMemo(() => {
    return tasks.filter((t) => t.dueDate === todayStr);
  }, [tasks, todayStr]);

  const dailySummary: DailySummary = useMemo(() => {
    const total = todayTasks.length;
    const completed = todayTasks.filter((t) => t.completed).length;
    const remaining = total - completed;
    const urgent = todayTasks.filter((t) => (t.priority === 'urgent' || t.priority === 'high') && !t.completed).length;
    const totalMins = todayTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 30), 0);
    const estimatedHours = Math.round((totalMins / 60) * 10) / 10;

    return {
      total,
      completed,
      remaining,
      urgent,
      estimatedHours,
      streak,
    };
  }, [todayTasks, streak]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Bar following Top Bar Contract */}
      <TopBar
        currentFilter={filter}
        onFilterChange={setFilter}
        counts={counts}
        streak={streak}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        soundEnabled={settings.soundEnabled}
        onToggleSound={() => handleUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
        onOpenNewTask={() => {
          // Focus input or scroll to top
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenFocus={() => {
          setFocusTask(null);
          setIsFocusModalOpen(true);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProjects={() => setIsProjectsModalOpen(true)}
        projectsCount={projects.length}
        hasActiveAlerts={activeAlerts.length > 0}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Smart Alerts Ribbon */}
        <SmartAlertBanner
          alerts={activeAlerts}
          onDismissAlert={handleDismissAlert}
          onCompleteTask={handleToggleComplete}
          onSnoozeTask={handleSnoozeTask}
          hasNotificationPermission={notificationPermission === 'granted'}
          onRequestNotificationPermission={handleRequestPermission}
        />

        {/* Daily Briefing Card (shown on Today view when no specific project is filtered) */}
        {filter === 'today' && selectedProjectFilter === 'all' && (
          <DailyBriefingCard
            summary={dailySummary}
            todayTasks={todayTasks}
            onSelectTaskForFocus={handleStartFocus}
          />
        )}

        {/* Active Project Filter Notice */}
        {activeProject && (
          <div className="flex items-center justify-between p-3 mb-4 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl text-xs text-blue-900 dark:text-blue-200">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>أنت تشاهد حالياً مهام مشروع:</span>
              <span className="font-mono font-bold bg-white dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                #{activeProject.number}
              </span>
              <span className="font-bold">{activeProject.name}</span>
            </div>
            <button
              onClick={() => setSelectedProjectFilter('all')}
              className="inline-flex items-center gap-1 font-semibold text-zinc-600 dark:text-zinc-300 hover:text-rose-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>إلغاء التصفية</span>
            </button>
          </div>
        )}

        {/* Quick Add Bar with Project Support */}
        <QuickAddTask 
          onAddTask={handleAddTask} 
          defaultDate={todayStr} 
          projects={projects}
          defaultProjectId={selectedProjectFilter !== 'all' ? selectedProjectFilter : undefined}
          onOpenProjectManager={() => setIsProjectsModalOpen(true)}
        />

        {/* Filters and Controls */}
        <div className="space-y-3 mb-6">
          
          {/* Projects Quick Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-xs text-zinc-400 dark:text-zinc-500 ml-1 font-medium whitespace-nowrap">
              المشروع:
            </span>
            <button
              onClick={() => setSelectedProjectFilter('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedProjectFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              كل المشاريع
            </button>
            {projects.map((prj) => (
              <button
                key={prj.id}
                onClick={() => setSelectedProjectFilter(prj.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  selectedProjectFilter === prj.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                <span className="font-mono text-[11px] opacity-80">#{prj.number}</span>
                <span>{prj.name}</span>
              </button>
            ))}
            <button
              onClick={() => setIsProjectsModalOpen(true)}
              className="p-1 text-zinc-400 hover:text-blue-600 rounded-lg transition-colors"
              title="إدارة وإضافة المشاريع"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Categories & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Categories Horizontal Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  selectedCategory === 'all'
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
                }`}
              >
                جميع التصنيفات
              </button>
              {DEFAULT_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    selectedCategory === cat.name
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Search & Sort Controls */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-52">
                <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث باسم المهمة أو رقم المشروع..."
                  className="w-full pl-3 pr-8 py-1.5 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 focus:outline-hidden"
                title="ترتيب المهام"
              >
                <option value="dueTime">حسب الوقت</option>
                <option value="priority">حسب الأولوية</option>
                <option value="created">الأحدث إضافة</option>
              </select>
            </div>
          </div>
        </div>

        {/* Task Cards List */}
        {filteredTasks.length > 0 ? (
          <div className="space-y-2.5">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteTask}
                onEdit={setEditingTask}
                onUpdateSubtasks={handleUpdateSubtasks}
                onStartFocus={handleStartFocus}
                onFilterProject={(pid) => setSelectedProjectFilter(pid)}
              />
            ))}
          </div>
        ) : (
          /* High-fidelity empty state */
          <div className="text-center py-16 px-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl">
            <div className="w-12 h-12 mx-auto mb-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500">
              {filter === 'completed' ? (
                <CheckCheck className="w-6 h-6 text-emerald-500" />
              ) : (
                <Inbox className="w-6 h-6" />
              )}
            </div>
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              {filter === 'completed'
                ? 'لم تكتمل أي مهام بعد'
                : searchQuery
                ? 'لم يتم العثور على نتائج للبحث'
                : selectedProjectFilter !== 'all'
                ? 'لا توجد مهام مسجلة لهذا المشروع بعد'
                : 'لا توجد مهام مسجلة هنا'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              {filter === 'completed'
                ? 'قم بإنجاز مهام اليوم وستظهر لك هنا تلقائياً.'
                : 'ابدأ يومك بإضافة مهمة جديدة وربطها برقم واسم المشروع المناسب.'}
            </p>
          </div>
        )}
      </main>

      {/* Modals */}
      <TaskEditModal
        task={editingTask}
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleUpdateTask}
        projects={projects}
      />

      <ProjectManagerModal
        isOpen={isProjectsModalOpen}
        onClose={() => setIsProjectsModalOpen(false)}
        projects={projects}
        tasks={tasks}
        onAddProject={handleAddProject}
        onUpdateProject={handleUpdateProject}
        onDeleteProject={handleDeleteProject}
        onSelectProjectFilter={(pid) => setSelectedProjectFilter(pid)}
      />

      <FocusPomodoroModal
        task={focusTask}
        isOpen={isFocusModalOpen}
        onClose={() => setIsFocusModalOpen(false)}
        onCompleteTask={handleToggleComplete}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        tasks={tasks}
        projects={projects}
        onImportTasks={(importedTasks, importedProjects) => {
          setTasks(importedTasks);
          if (importedProjects) {
            setProjects(importedProjects);
          }
        }}
        onResetTasks={() => {
          setTasks(getDefaultSampleTasks());
          setProjects(DEFAULT_PROJECTS);
        }}
      />

      {/* Footer */}
      <footer className="w-full py-6 text-center text-xs text-zinc-400 dark:text-zinc-600 border-t border-zinc-200/60 dark:border-zinc-800/80">
        <div className="flex items-center justify-center gap-2">
          <span>مُنجز © {new Date().getFullYear()}</span>
          <span aria-hidden="true">·</span>
          <span>إدارة المهام والمشاريع مع تنبيهات ذكية وتصميم هادئ وبسيط</span>
        </div>
      </footer>
    </div>
  );
}

import { Task, CategoryDef, Project } from '../types/task';

export const STORAGE_KEY_TASKS = 'munjiz_tasks_v1';
export const STORAGE_KEY_PROJECTS = 'munjiz_projects_v1';
export const STORAGE_KEY_SETTINGS = 'munjiz_settings_v1';
export const STORAGE_KEY_STREAK = 'munjiz_streak_v1';

export const DEFAULT_CATEGORIES: { id: string; name: string; color: string }[] = [
  { id: 'work', name: 'العمل', color: '#2563eb' },
  { id: 'personal', name: 'شخصي', color: '#16a34a' },
  { id: 'study', name: 'دراسة', color: '#9333ea' },
  { id: 'health', name: 'صحة', color: '#ea580c' },
  { id: 'shopping', name: 'تسوق', color: '#0891b2' },
  { id: 'general', name: 'عام', color: '#64748b' },
];

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'prj-1',
    number: 'PRJ-101',
    name: 'تطوير المنصة الرقمية',
    color: '#2563eb',
    description: 'تطوير واجهات وتطبيقات الويب وبوابات الدفع الإلكتروني',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prj-2',
    number: 'PRJ-102',
    name: 'حملة التسويق والنمو',
    color: '#16a34a',
    description: 'إطلاق الإعلانات وصناعة المحتوى واستقطاب الشركاء',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prj-3',
    number: 'PRJ-103',
    name: 'تجهيز وتطوير بيئة العمل',
    color: '#9333ea',
    description: 'تحسين وتأثيث المكتب والمعدات والأجهزة التقنية',
    createdAt: new Date().toISOString()
  }
];

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTomorrowString(): string {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDefaultSampleTasks(): Task[] {
  const today = getTodayString();
  const tomorrow = getTomorrowString();

  return [
    {
      id: 'task-1',
      title: 'إرسال المقترح النهائي لمشروع المنصة الرقمية',
      description: 'مراجعة بنود الميزانية وتنسيق ملف العرض قبل الإرسال بالبريد الإلكتروني للعميل.',
      completed: false,
      dueDate: today,
      dueTime: '13:00',
      priority: 'urgent',
      category: 'العمل',
      projectId: 'prj-1',
      projectNumber: 'PRJ-101',
      projectName: 'تطوير المنصة الرقمية',
      subtasks: [
        { id: 'sub-1', text: 'تدقيق أرقام الميزانية وجداول التسليم', completed: true },
        { id: 'sub-2', text: 'تصدير الملف بصيغة PDF عالية الجودة', completed: false },
        { id: 'sub-3', text: 'كتابة بريد التقديم وإرفاق المستند', completed: false }
      ],
      estimatedMinutes: 45,
      actualMinutes: 0,
      reminderOffsetMinutes: 10,
      createdAt: new Date().toISOString()
    },
    {
      id: 'task-2',
      title: 'تمارين رياضية وإطالة (كارديو 30 دقيقة)',
      description: 'المحافظة على النشاط البدني اليومي وتجديد الطاقة بعد ساعات الجلوس.',
      completed: false,
      dueDate: today,
      dueTime: '17:30',
      priority: 'medium',
      category: 'صحة',
      subtasks: [
        { id: 'sub-21', text: 'إحماء خفيف 5 دقائق', completed: false },
        { id: 'sub-22', text: 'جري متقطع أو دراجة 20 دقيقة', completed: false },
        { id: 'sub-23', text: 'تمارين إطالة واسترخاء', completed: false }
      ],
      estimatedMinutes: 30,
      reminderOffsetMinutes: 15,
      createdAt: new Date().toISOString()
    },
    {
      id: 'task-3',
      title: 'قراءة 20 صفحة من كتاب التطوير المهني',
      description: 'تلخيص أهم فكرتين وتدوين ملاحظة سريعة في دفتر الأفكار.',
      completed: true,
      completedAt: new Date().toISOString(),
      dueDate: today,
      dueTime: '10:00',
      priority: 'low',
      category: 'دراسة',
      subtasks: [
        { id: 'sub-31', text: 'قراءة الفصل الخامس بتركيز', completed: true },
        { id: 'sub-32', text: 'تدوين اقتباس ملهم', completed: true }
      ],
      estimatedMinutes: 25,
      reminderOffsetMinutes: 0,
      createdAt: new Date().toISOString()
    },
    {
      id: 'task-4',
      title: 'إعداد خطة المحتوى لحملة التسويق الرقمي',
      description: 'تحديد جدول النشر الأسبوعي والتصاميم المطلوبة للمنصات.',
      completed: false,
      dueDate: tomorrow,
      dueTime: '15:00',
      priority: 'high',
      category: 'العمل',
      projectId: 'prj-2',
      projectNumber: 'PRJ-102',
      projectName: 'حملة التسويق والنمو',
      subtasks: [
        { id: 'sub-41', text: 'صياغة أفكار المنشورات', completed: false },
        { id: 'sub-42', text: 'تجهيز الرسوم التوضيحية', completed: false }
      ],
      estimatedMinutes: 40,
      reminderOffsetMinutes: 30,
      createdAt: new Date().toISOString()
    }
  ];
}

export function loadProjectsFromStorage(): Project[] {
  if (typeof window === 'undefined') return DEFAULT_PROJECTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROJECTS);
    if (!raw) {
      saveProjectsToStorage(DEFAULT_PROJECTS);
      return DEFAULT_PROJECTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_PROJECTS;
  } catch (err) {
    console.error('Error loading projects:', err);
    return DEFAULT_PROJECTS;
  }
}

export function saveProjectsToStorage(projects: Project[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
  } catch (err) {
    console.error('Error saving projects:', err);
  }
}

export function loadTasksFromStorage(): Task[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TASKS);
    if (!raw) {
      const sample = getDefaultSampleTasks();
      saveTasksToStorage(sample);
      return sample;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return getDefaultSampleTasks();
  } catch (err) {
    console.error('Error reading tasks from storage:', err);
    return getDefaultSampleTasks();
  }
}

export function saveTasksToStorage(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  } catch (err) {
    console.error('Error saving tasks to storage:', err);
  }
}

export interface UserSettings {
  soundEnabled: boolean;
  browserNotificationsEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
  smartAlertOffsetMinutes: number; // default 15 mins before due
  pomodoroWorkMinutes: number;
  pomodoroBreakMinutes: number;
}

export const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  browserNotificationsEnabled: true,
  theme: 'light',
  smartAlertOffsetMinutes: 15,
  pomodoroWorkMinutes: 25,
  pomodoroBreakMinutes: 5,
};

export function loadSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.error('Error loading settings:', err);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: UserSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings:', err);
  }
}

export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate: string; // YYYY-MM-DD
}

export function updateAndGetStreak(taskCompletedToday: boolean): StreakData {
  if (typeof window === 'undefined') {
    return { currentStreak: 1, bestStreak: 1, lastCompletedDate: getTodayString() };
  }
  
  const today = getTodayString();
  let data: StreakData = { currentStreak: 0, bestStreak: 0, lastCompletedDate: '' };
  
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STREAK);
    if (raw) {
      data = JSON.parse(raw);
    }
  } catch {}

  if (!taskCompletedToday) {
    return data;
  }

  if (data.lastCompletedDate === today) {
    return data;
  }

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  if (data.lastCompletedDate === yesterday) {
    data.currentStreak += 1;
  } else {
    data.currentStreak = 1;
  }

  if (data.currentStreak > data.bestStreak) {
    data.bestStreak = data.currentStreak;
  }
  data.lastCompletedDate = today;

  try {
    localStorage.setItem(STORAGE_KEY_STREAK, JSON.stringify(data));
  } catch {}

  return data;
}

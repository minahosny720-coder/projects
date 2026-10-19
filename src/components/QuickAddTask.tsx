import React, { useState } from 'react';
import { Priority, Task, Project } from '../types/task';
import { getTodayDateString } from '../utils/date';
import { DEFAULT_CATEGORIES } from '../utils/storage';
import { 
  Plus, 
  Sparkles, 
  Calendar, 
  Clock, 
  Tag, 
  ChevronDown, 
  ChevronUp, 
  BellRing,
  FolderKanban,
  Hash
} from 'lucide-react';

interface QuickAddTaskProps {
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  projects: Project[];
  onOpenProjectManager?: () => void;
  defaultDate?: string;
  defaultProjectId?: string;
}

export const QuickAddTask: React.FC<QuickAddTaskProps> = ({ 
  onAddTask, 
  projects,
  onOpenProjectManager,
  defaultDate,
  defaultProjectId
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(defaultDate || getTodayDateString());
  const [dueTime, setDueTime] = useState('12:00');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState('العمل');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(defaultProjectId || '');
  const [reminderOffset, setReminderOffset] = useState<number>(10);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isParsingAI, setIsParsingAI] = useState(false);

  // Quick inline add project state
  const [isCreatingProjectInline, setIsCreatingProjectInline] = useState(false);
  const [newProjectNumber, setNewProjectNumber] = useState('');
  const [newProjectName, setNewProjectName] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    const matchedProject = projects.find((p) => p.id === selectedProjectId);

    onAddTask({
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate,
      dueTime: dueTime || undefined,
      priority,
      category,
      projectId: matchedProject?.id,
      projectNumber: matchedProject?.number,
      projectName: matchedProject?.name,
      subtasks: [],
      estimatedMinutes: 30,
      reminderOffsetMinutes: reminderOffset,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setIsExpanded(false);
  };

  const handleSmartAIParse = async () => {
    if (!title.trim() || isParsingAI) return;
    setIsParsingAI(true);
    try {
      const res = await fetch('/api/ai/parse-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: title })
      });
      const data = await res.json();
      if (data.title) setTitle(data.title);
      if (data.dueDate) setDueDate(data.dueDate);
      if (data.dueTime) setDueTime(data.dueTime);
      if (data.priority) setPriority(data.priority);
      if (data.category) setCategory(data.category);

      // Check if text matched any project number or name
      const foundProject = projects.find(
        (p) => title.toLowerCase().includes(p.number.toLowerCase()) || 
               title.toLowerCase().includes(p.name.toLowerCase())
      );
      if (foundProject) {
        setSelectedProjectId(foundProject.id);
      }

      setIsExpanded(true);
    } catch (err) {
      console.error('AI parse error:', err);
    } finally {
      setIsParsingAI(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl shadow-xs p-3 sm:p-4 mb-6 transition-all">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="اكتب مهمتك الجديدة... (مثال: إعداد تقرير مشروع PRJ-101 غداً 2 ظهراً)"
            className="flex-1 bg-transparent px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-hidden"
          />

          {/* AI Parse Button */}
          {title.trim().length > 3 && (
            <button
              type="button"
              onClick={handleSmartAIParse}
              disabled={isParsingAI}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 rounded-lg transition-colors border border-amber-200 dark:border-amber-800/60 whitespace-nowrap"
              title="تحليل النص واستخراج الموعد والأولوية تلقائياً بالذكاء الاصطناعي"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isParsingAI ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isParsingAI ? 'جاري الفهم...' : 'تحليل ذكي'}</span>
            </button>
          )}

          {/* Toggle More Details */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg transition-colors"
            title="خيارات إضافية للمهمة"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!title.trim()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 rounded-lg transition-colors whitespace-nowrap shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">إضافة</span>
          </button>
        </div>

        {/* Expandable options drawer */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 space-y-3.5">
            {/* Description */}
            <div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ملاحظات أو تفاصيل إضافية للمهمة..."
                rows={2}
                className="w-full text-xs p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              {/* Project Selection (Project Number and Name) */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                    <FolderKanban className="w-3.5 h-3.5 text-blue-600" />
                    <span>المشروع (رقم واسم):</span>
                  </label>
                  {onOpenProjectManager && (
                    <button
                      type="button"
                      onClick={onOpenProjectManager}
                      className="text-[11px] text-blue-600 hover:underline"
                    >
                      إدارة المشاريع
                    </button>
                  )}
                </div>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-blue-500"
                >
                  <option value="">بدون مشروع (عام)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.number} · {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-zinc-500 dark:text-zinc-400 mb-1 font-medium">
                  تاريخ الاستحقاق:
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 tabular-nums focus:outline-hidden focus:border-blue-500"
                />
              </div>

              {/* Due Time */}
              <div>
                <label className="block text-zinc-500 dark:text-zinc-400 mb-1 font-medium">
                  وقت التنبيه:
                </label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 tabular-nums focus:outline-hidden focus:border-blue-500"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-zinc-500 dark:text-zinc-400 mb-1 font-medium">
                  الأولوية:
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-blue-500"
                >
                  <option value="low">منخفضة</option>
                  <option value="medium">متوسطة</option>
                  <option value="high">عالية</option>
                  <option value="urgent">قصوى (عاجلة)</option>
                </select>
              </div>
            </div>

            {/* Category and Smart Reminder Offset */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
              {/* Category */}
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">التصنيف:</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
                >
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reminder buttons */}
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <span className="flex items-center gap-1 font-medium">
                  <BellRing className="w-3.5 h-3.5 text-blue-600" />
                  <span>تنبيه:</span>
                </span>
                <div className="flex items-center gap-1">
                  {[
                    { label: 'عند الموعد', val: 0 },
                    { label: 'قبل 10د', val: 10 },
                    { label: 'قبل 30د', val: 30 },
                    { label: 'قبل 1س', val: 60 }
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.val}
                      onClick={() => setReminderOffset(item.val)}
                      className={`px-2 py-0.5 rounded-md transition-colors ${
                        reminderOffset === item.val
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}
      </form>
    </div>
  );
};

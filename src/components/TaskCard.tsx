import React, { useState } from 'react';
import { Task, Subtask } from '../types/task';
import { formatTaskDueDate, formatTime12h, calculateMinutesRemaining } from '../utils/date';
import { sound } from '../utils/audio';
import { 
  Check, 
  Clock, 
  Sparkles, 
  Timer, 
  MoreHorizontal, 
  Trash2, 
  Edit3, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  ListTodo,
  CheckCircle2,
  Circle,
  FolderKanban
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onUpdateSubtasks: (taskId: string, subtasks: Subtask[]) => void;
  onStartFocus: (task: Task) => void;
  onFilterProject?: (projectId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onDelete,
  onEdit,
  onUpdateSubtasks,
  onStartFocus,
  onFilterProject,
}) => {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [isBreakingDownAI, setIsBreakingDownAI] = useState(false);

  const dueInfo = formatTaskDueDate(task.dueDate);
  const formattedTime = formatTime12h(task.dueTime);
  const minutesRemaining = calculateMinutesRemaining(task.dueDate, task.dueTime);

  const completedSubtasksCount = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasksCount = task.subtasks.length;

  const handleToggleSubtask = (subtaskId: string) => {
    const updated = task.subtasks.map((s) =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    onUpdateSubtasks(task.id, updated);
    sound.playTaskCompleteChime();
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskText.trim()) return;

    const newSub: Subtask = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text: newSubtaskText.trim(),
      completed: false,
    };
    onUpdateSubtasks(task.id, [...task.subtasks, newSub]);
    setNewSubtaskText('');
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    const updated = task.subtasks.filter((s) => s.id !== subtaskId);
    onUpdateSubtasks(task.id, updated);
  };

  const handleAIBreakdown = async () => {
    if (isBreakingDownAI) return;
    setIsBreakingDownAI(true);
    try {
      const res = await fetch('/api/ai/breakdown-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: task.title, description: task.description })
      });
      const data = await res.json();
      if (Array.isArray(data.subtasks) && data.subtasks.length > 0) {
        const newItems: Subtask[] = data.subtasks.map((text: string, idx: number) => ({
          id: `ai-sub-${Date.now()}-${idx}`,
          text,
          completed: false,
        }));
        onUpdateSubtasks(task.id, [...task.subtasks, ...newItems]);
        setShowSubtasks(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsBreakingDownAI(false);
    }
  };

  // Priority color indicators
  const getPriorityInfo = () => {
    switch (task.priority) {
      case 'urgent':
        return { label: 'قصوى', color: 'text-rose-600 dark:text-rose-400' };
      case 'high':
        return { label: 'عالية', color: 'text-amber-600 dark:text-amber-400' };
      case 'medium':
        return { label: 'متوسطة', color: 'text-blue-600 dark:text-blue-400' };
      case 'low':
      default:
        return { label: 'منخفضة', color: 'text-zinc-500 dark:text-zinc-400' };
    }
  };

  const priorityInfo = getPriorityInfo();

  return (
    <div
      className={`group bg-white dark:bg-zinc-900 border rounded-2xl transition-all duration-200 p-4 ${
        task.completed
          ? 'border-zinc-200/50 dark:border-zinc-800/60 opacity-65 bg-zinc-50/50 dark:bg-zinc-900/40'
          : 'border-zinc-200/90 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Custom checkmark toggle */}
        <button
          onClick={() => onToggleComplete(task.id)}
          className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-all shrink-0 ${
            task.completed
              ? 'bg-emerald-600 text-white'
              : 'border-2 border-zinc-300 dark:border-zinc-600 hover:border-blue-600 dark:hover:border-blue-400 text-transparent'
          }`}
          title={task.completed ? 'إلغاء الإكمال' : 'إكمال المهمة'}
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </button>

        {/* Task Title & Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`text-sm font-semibold leading-snug transition-all ${
                task.completed
                  ? 'line-through text-zinc-400 dark:text-zinc-500'
                  : 'text-zinc-900 dark:text-zinc-100'
              }`}
            >
              {task.title}
            </h3>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onStartFocus(task)}
                className="p-1 text-zinc-400 hover:text-amber-500 rounded-md transition-colors"
                title="بدء مؤقت التركيز لهذه المهمة"
              >
                <Timer className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEdit(task)}
                className="p-1 text-zinc-400 hover:text-blue-500 rounded-md transition-colors"
                title="تعديل المهمة"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="p-1 text-zinc-400 hover:text-rose-500 rounded-md transition-colors"
                title="حذف المهمة"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {task.description && (
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Zero-Pill Clean Metadata with unboxed text and typographic dots */}
          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            {/* Project Number & Name */}
            {(task.projectNumber || task.projectName) && (
              <>
                <button
                  type="button"
                  onClick={() => onFilterProject && onFilterProject(task.projectId || task.projectNumber || '')}
                  className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-colors"
                  title="تصفية المهام حسب هذا المشروع"
                >
                  <FolderKanban className="w-3.5 h-3.5" />
                  {task.projectNumber && (
                    <span className="font-mono tabular-nums">#{task.projectNumber}</span>
                  )}
                  {task.projectName && (
                    <span>{task.projectName}</span>
                  )}
                </button>
                <span aria-hidden="true">·</span>
              </>
            )}

            {/* Category */}
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {task.category}
            </span>

            <span aria-hidden="true">·</span>

            {/* Due Date & Time */}
            <span className={`inline-flex items-center gap-1 tabular-nums ${dueInfo.isOverdue && !task.completed ? 'text-rose-600 dark:text-rose-400 font-semibold' : ''}`}>
              <Clock className="w-3.5 h-3.5" />
              <span>{dueInfo.label}</span>
              {formattedTime && <span>{formattedTime}</span>}
            </span>

            <span aria-hidden="true">·</span>

            {/* Priority */}
            <span className={`font-medium ${priorityInfo.color}`}>
              أولوية {priorityInfo.label}
            </span>

            {/* Subtasks Counter indicator */}
            {totalSubtasksCount > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <button
                  onClick={() => setShowSubtasks(!showSubtasks)}
                  className="inline-flex items-center gap-1 font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 transition-colors tabular-nums"
                >
                  <ListTodo className="w-3.5 h-3.5" />
                  <span>
                    {completedSubtasksCount} / {totalSubtasksCount} خطوات
                  </span>
                  {showSubtasks ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </>
            )}

            {/* AI Breakdown prompt if no subtasks yet */}
            {totalSubtasksCount === 0 && !task.completed && (
              <>
                <span aria-hidden="true">·</span>
                <button
                  onClick={handleAIBreakdown}
                  disabled={isBreakingDownAI}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors"
                  title="تقسيم هذه المهمة تلقائياً إلى خطوات صغيرة"
                >
                  <Sparkles className={`w-3 h-3 ${isBreakingDownAI ? 'animate-spin' : ''}`} />
                  <span>{isBreakingDownAI ? 'جاري التقسيم...' : 'تقسيم ذكي (AI)'}</span>
                </button>
              </>
            )}
          </div>

          {/* Subtasks Accordion View */}
          {showSubtasks && (
            <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
              <div className="space-y-1.5">
                {task.subtasks.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between gap-2 text-xs py-1 px-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 group/sub"
                  >
                    <button
                      onClick={() => handleToggleSubtask(sub.id)}
                      className="flex items-center gap-2 text-right flex-1 min-w-0"
                    >
                      {sub.completed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      )}
                      <span
                        className={`truncate ${
                          sub.completed
                            ? 'line-through text-zinc-400 dark:text-zinc-500'
                            : 'text-zinc-800 dark:text-zinc-200'
                        }`}
                      >
                        {sub.text}
                      </span>
                    </button>
                    <button
                      onClick={() => handleDeleteSubtask(sub.id)}
                      className="opacity-0 group-hover/sub:opacity-100 text-zinc-400 hover:text-rose-500 p-0.5 rounded transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add subtask input */}
              <form onSubmit={handleAddSubtask} className="flex items-center gap-1.5 mt-2">
                <input
                  type="text"
                  value={newSubtaskText}
                  onChange={(e) => setNewSubtaskText(e.target.value)}
                  placeholder="أضف خطوة فرعية..."
                  className="flex-1 text-xs px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newSubtaskText.trim()}
                  className="p-1.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg text-zinc-800 dark:text-zinc-100 disabled:opacity-40 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

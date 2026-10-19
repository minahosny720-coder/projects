import React, { useState } from 'react';
import { Project, Task } from '../types/task';
import { 
  X, 
  Plus, 
  FolderKanban, 
  Hash, 
  Edit3, 
  Trash2, 
  Check, 
  Layers, 
  ArrowLeft,
  Filter
} from 'lucide-react';

interface ProjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  tasks: Task[];
  onAddProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onSelectProjectFilter: (projectId: string) => void;
}

const PRESET_COLORS = [
  '#2563eb', // blue
  '#16a34a', // green
  '#9333ea', // purple
  '#ea580c', // orange
  '#0891b2', // cyan
  '#e11d48', // rose
  '#4f46e5', // indigo
  '#d97706', // amber
];

export const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({
  isOpen,
  onClose,
  projects,
  tasks,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onSelectProjectFilter,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // Form states
  const [number, setNumber] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);

  if (!isOpen) return null;

  const handleOpenAdd = () => {
    setIsAdding(true);
    setEditingProjectId(null);
    // Suggest next project number
    const nextNum = projects.length + 101;
    setNumber(`PRJ-${nextNum}`);
    setName('');
    setDescription('');
    setColor(PRESET_COLORS[projects.length % PRESET_COLORS.length]);
  };

  const handleOpenEdit = (prj: Project) => {
    setEditingProjectId(prj.id);
    setIsAdding(true);
    setNumber(prj.number);
    setName(prj.name);
    setDescription(prj.description || '');
    setColor(prj.color || PRESET_COLORS[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !number.trim()) return;

    if (editingProjectId) {
      const existing = projects.find((p) => p.id === editingProjectId);
      if (existing) {
        onUpdateProject({
          ...existing,
          number: number.trim(),
          name: name.trim(),
          description: description.trim() || undefined,
          color,
        });
      }
    } else {
      onAddProject({
        number: number.trim(),
        name: name.trim(),
        description: description.trim() || undefined,
        color,
      });
    }

    setIsAdding(false);
    setEditingProjectId(null);
    setNumber('');
    setName('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-xl shadow-xl overflow-hidden transition-all animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-lg">
              <FolderKanban className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                إدارة المشاريع
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                إضافة أرقام وأسماء المشاريع وتصنيف المهام بحسب كل مشروع
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 max-h-[75vh] overflow-y-auto space-y-4">
          
          {/* Add / Edit Project Form */}
          {isAdding ? (
            <form onSubmit={handleSubmit} className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-700/60">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {editingProjectId ? 'تعديل بيانات المشروع' : 'إضافة مشروع جديد'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingProjectId(null);
                  }}
                  className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                >
                  إلغاء
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Project Number */}
                <div className="sm:col-span-1">
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    رقم المشروع / الكود *
                  </label>
                  <div className="relative">
                    <Hash className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      placeholder="PRJ-101"
                      required
                      className="w-full pr-8 pl-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Project Name */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    اسم المشروع *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: تطوير المنصة الرقمية"
                    required
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="text-xs">
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  وصف المشروع (اختياري)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ملاحظات أو نطاق عمل المشروع..."
                  rows={2}
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              {/* Color picker */}
              <div className="text-xs">
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  لون تمييز المشروع
                </label>
                <div className="flex items-center gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform flex items-center justify-center ${
                        color === c ? 'scale-115 ring-2 ring-offset-2 ring-zinc-400 dark:ring-offset-zinc-900' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingProjectId(null);
                  }}
                  className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
                >
                  {editingProjectId ? 'تحديث المشروع' : 'حفظ المشروع'}
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={handleOpenAdd}
              className="w-full py-2.5 px-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مشروع جديد (برقم واسم)</span>
            </button>
          )}

          {/* Projects List */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-1 font-medium">
              <span>المشاريع الحالية ({projects.length})</span>
              <span>انقر لتصفية المهام حسب المشروع</span>
            </div>

            {projects.map((project) => {
              const projectTasks = tasks.filter((t) => t.projectId === project.id || t.projectNumber === project.number);
              const completedCount = projectTasks.filter((t) => t.completed).length;
              const totalCount = projectTasks.length;
              const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

              return (
                <div
                  key={project.id}
                  className="p-3.5 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 mt-1"
                      style={{ backgroundColor: project.color || '#2563eb' }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {/* Project Number */}
                        <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 tabular-nums">
                          #{project.number}
                        </span>
                        {/* Project Name */}
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {project.name}
                        </span>
                      </div>

                      {project.description && (
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">
                          {project.description}
                        </p>
                      )}

                      {/* Tasks stats */}
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 tabular-nums">
                        <span>{totalCount} مهام</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-600 dark:text-emerald-400">{completedCount} مكتملة</span>
                        <span aria-hidden="true">·</span>
                        <span>{percent}% إنجاز</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => {
                        onSelectProjectFilter(project.id);
                        onClose();
                      }}
                      className="px-2.5 py-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 rounded-lg transition-colors flex items-center gap-1"
                      title="عرض مهام هذا المشروع فقط"
                    >
                      <Filter className="w-3 h-3" />
                      <span>عرض المهام</span>
                    </button>

                    <button
                      onClick={() => handleOpenEdit(project)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg transition-colors"
                      title="تعديل المشروع"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف المشروع "${project.name}"؟ ستظل المهام موجودة ولكن بدون مشروع.`)) {
                          onDeleteProject(project.id);
                        }
                      }}
                      className="p-1.5 text-zinc-400 hover:text-rose-500 rounded-lg transition-colors"
                      title="حذف المشروع"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-semibold shadow-xs"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};

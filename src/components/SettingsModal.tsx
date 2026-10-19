import React, { useRef } from 'react';
import { UserSettings } from '../utils/storage';
import { Task, Project } from '../types/task';
import { sound } from '../utils/audio';
import { requestNotificationPermission, sendBrowserNotification, getNotificationPermission } from '../utils/notifications';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Bell, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  ShieldCheck,
  Smartphone
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  tasks: Task[];
  projects?: Project[];
  onImportTasks: (tasks: Task[], projects?: Project[]) => void;
  onResetTasks: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  tasks,
  projects = [],
  onImportTasks,
  onResetTasks,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentPermission = getNotificationPermission();

  const handleTestSound = () => {
    sound.playReminderAlertChime();
  };

  const handleTestNotification = async () => {
    let perm = currentPermission;
    if (perm !== 'granted') {
      perm = await requestNotificationPermission();
    }
    if (perm === 'granted') {
      sendBrowserNotification('مُنجز: تجربة التنبيه الذكي 🔔', {
        body: 'التنبيهات تعمل بنجاح! ستصلك إشعارات قبل موعد مهامك اليومية.',
      });
      sound.playReminderAlertChime();
    }
  };

  const handleExportData = () => {
    const backupPayload = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      tasks,
      projects,
    };
    const dataStr = JSON.stringify(backupPayload, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `munjiz-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          // Legacy format (array of tasks)
          onImportTasks(parsed);
          alert('تم استيراد المهام بنجاح!');
          onClose();
        } else if (parsed && Array.isArray(parsed.tasks)) {
          // New format with tasks and projects
          onImportTasks(parsed.tasks, Array.isArray(parsed.projects) ? parsed.projects : undefined);
          alert('تم استيراد المهام والمشاريع بنجاح!');
          onClose();
        } else {
          alert('صيغة الملف غير متوافقة.');
        }
      } catch (err) {
        alert('تعذر قراءة الملف. تأكد من أنه ملف JSON صالح.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden transition-all animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            الإعدادات والتنبيهات
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
          {/* Sound & Chimes */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              التنبيهات الصوتية
            </h3>
            <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/80 dark:border-zinc-700">
              <div>
                <div className="font-semibold text-zinc-800 dark:text-zinc-200">الأصوات والنغمات</div>
                <div className="text-zinc-500 dark:text-zinc-400 mt-0.5">
                  نغمات لطيفة عند إكمال المهام ومواعيد التنبيه
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTestSound}
                  className="px-2.5 py-1 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
                >
                  تجربة النغمة
                </button>
                <button
                  onClick={() => onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
                  className={`p-2 rounded-lg transition-colors ${
                    settings.soundEnabled
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400'
                  }`}
                >
                  {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Browser Notifications */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              إشعارات المتصفح
            </h3>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-between">
              <div>
                <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                  حالة إذن الإشعارات:
                  <span className="font-normal mr-1.5">
                    {currentPermission === 'granted' ? 'مفعّلة ✅' : currentPermission === 'denied' ? 'محظورة ❌' : 'غير محددة'}
                  </span>
                </div>
                <div className="text-zinc-500 dark:text-zinc-400 mt-0.5">
                  تلقي إشعارات على جهازك عند اقتراب موعد المهمة
                </div>
              </div>
              <button
                onClick={handleTestNotification}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-xs"
              >
                {currentPermission === 'granted' ? 'إرسال إشعار تجريبي' : 'طلب الإذن'}
              </button>
            </div>
          </div>

          {/* Data Backup & Restore */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              النسخ الاحتياطي والبيانات
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleExportData}
                className="flex items-center justify-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 rounded-xl font-medium transition-colors text-zinc-800 dark:text-zinc-200"
              >
                <Download className="w-4 h-4 text-blue-600" />
                <span>تصدير المهام (JSON)</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 rounded-xl font-medium transition-colors text-zinc-800 dark:text-zinc-200"
              >
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>استيراد ملف المهام</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <button
              onClick={() => {
                if (confirm('هل أنت متأكد من استعادة المهام النموذجية الأولية؟')) {
                  onResetTasks();
                  onClose();
                }
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-zinc-500 hover:text-rose-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>استعادة المهام التجريبية الافتراضية</span>
            </button>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-semibold shadow-xs"
          >
            تم
          </button>
        </div>
      </div>
    </div>
  );
};

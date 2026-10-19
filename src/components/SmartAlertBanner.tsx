import React from 'react';
import { SmartAlert } from '../types/task';
import { AlertCircle, Clock, Bell, Check, ChevronRight, X } from 'lucide-react';

interface SmartAlertBannerProps {
  alerts: SmartAlert[];
  onDismissAlert: (id: string) => void;
  onCompleteTask: (taskId: string) => void;
  onSnoozeTask: (taskId: string, minutes: number) => void;
  hasNotificationPermission: boolean;
  onRequestNotificationPermission: () => void;
}

export const SmartAlertBanner: React.FC<SmartAlertBannerProps> = ({
  alerts,
  onDismissAlert,
  onCompleteTask,
  onSnoozeTask,
  hasNotificationPermission,
  onRequestNotificationPermission,
}) => {
  if (alerts.length === 0 && hasNotificationPermission) {
    return null;
  }

  return (
    <div className="space-y-2 mb-6">
      {/* If notifications are disabled in browser, offer an unobtrusive 1-click prompt */}
      {!hasNotificationPermission && (
        <div className="flex items-center justify-between p-3.5 bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 rounded-xl text-xs text-blue-900 dark:text-blue-200">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              فعّل إشعارات المتصفح لتصلك تنبيهات المهام الذكية في موعدها حتى لو كانت النافذة في الخلفية.
            </span>
          </div>
          <button
            onClick={onRequestNotificationPermission}
            className="px-3 py-1.5 font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs"
          >
            تفعيل الإشعارات
          </button>
        </div>
      )}

      {/* Active task alerts */}
      {alerts.map((alert) => {
        const isOverdue = alert.type === 'overdue';
        const isNow = alert.type === 'due_now';

        return (
          <div
            key={alert.id}
            className={`flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
              isOverdue
                ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
                : isNow
                ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
                : 'bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/60 text-indigo-900 dark:text-indigo-200'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {isOverdue ? (
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              ) : (
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 animate-pulse" />
              )}
              <div className="text-xs truncate">
                <span className="font-semibold">{alert.taskTitle}</span>
                <span className="mx-2 text-zinc-400" aria-hidden="true">·</span>
                <span className="tabular-nums font-medium">
                  {isOverdue
                    ? `تجاوز الموعد المحدد (${alert.dueTime})`
                    : isNow
                    ? 'حان موعد هذه المهمة الآن!'
                    : `متبقي ${alert.minutesRemaining} دقيقة (الموعد: ${alert.dueTime})`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => onCompleteTask(alert.taskId)}
                className="inline-flex items-center gap-1 px-2.5 py-1 font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>إنجاز</span>
              </button>

              <button
                onClick={() => onSnoozeTask(alert.taskId, 15)}
                className="px-2.5 py-1 font-medium bg-white/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-700 rounded-md border border-zinc-200 dark:border-zinc-700 transition-colors"
              >
                تأجيل 15د
              </button>

              <button
                onClick={() => onDismissAlert(alert.id)}
                className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-md transition-colors"
                title="تجاهل التنبيه"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

import React, { useState } from 'react';
import { DailySummary, Task } from '../types/task';
import { formatArabicDateHeader } from '../utils/date';
import { Sparkles, ChevronDown, ChevronUp, CheckCircle, Clock, Zap, Target } from 'lucide-react';

interface DailyBriefingCardProps {
  summary: DailySummary;
  todayTasks: Task[];
  onSelectTaskForFocus?: (task: Task) => void;
}

export const DailyBriefingCard: React.FC<DailyBriefingCardProps> = ({
  summary,
  todayTasks,
  onSelectTaskForFocus,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [suggestedFocus, setSuggestedFocus] = useState<string[]>([]);

  const percent = summary.total > 0 ? Math.round((summary.completed / summary.total) * 100) : 0;
  const arabicDate = formatArabicDateHeader();

  const handleGetAIBriefing = async () => {
    setIsLoadingAI(true);
    try {
      const res = await fetch('/api/ai/daily-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: todayTasks })
      });
      const data = await res.json();
      setAiAdvice(data.advice || 'ابدأ بإنجاز المهام الحرجة مبكراً لتحقيق أقصى إنتاجية اليوم.');
      setSuggestedFocus(data.suggestedFocus || []);
      setIsExpanded(true);
    } catch (err) {
      console.error(err);
      setAiAdvice('رتب أولوياتك وفقاً للمهام الأكثر أهمية وأخذ فترات راحة منتظمة.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-5 mb-6 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
        <div>
          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {arabicDate}
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-0.5">
            خطة اليوم
          </h1>
        </div>

        {/* Action: Smart AI Daily Planning */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleGetAIBriefing}
            disabled={isLoadingAI || todayTasks.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 rounded-lg transition-colors disabled:opacity-50"
            title="اقتراح ترتيب ذكي لمهام اليوم"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-500 ${isLoadingAI ? 'animate-spin' : ''}`} />
            <span>{isLoadingAI ? 'جاري التحليل...' : 'اقتراح خطة ذكية (AI)'}</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg transition-colors"
            title={isExpanded ? 'طي التفاصيل' : 'عرض التفاصيل'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Progress & metrics row */}
      <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
        <div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">الإنجاز اليومي</div>
          <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tabular-nums mt-0.5">
            {summary.completed} <span className="text-xs font-normal text-zinc-400">/ {summary.total}</span>
          </div>
        </div>

        <div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">المهام المتبقية</div>
          <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tabular-nums mt-0.5">
            {summary.remaining}
          </div>
        </div>

        <div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">مهام ذات أولوية</div>
          <div className="text-lg font-bold text-rose-600 dark:text-rose-400 tabular-nums mt-0.5">
            {summary.urgent}
          </div>
        </div>

        <div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">الوقت التقديري</div>
          <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tabular-nums mt-0.5">
            {summary.estimatedHours} <span className="text-xs font-normal text-zinc-400">ساعة</span>
          </div>
        </div>
      </div>

      {/* Clean progress bar */}
      <div className="mt-4">
        <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 tabular-nums">
          <span>{percent}% مكتمل</span>
          <span>{summary.remaining === 0 && summary.total > 0 ? 'رائع! أنجزت كل مهام اليوم' : `متبقي ${summary.remaining} مهام`}</span>
        </div>
      </div>

      {/* Expanded AI Advice & Focus suggestions */}
      {isExpanded && (aiAdvice || suggestedFocus.length > 0) && (
        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs space-y-3">
          {aiAdvice && (
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/60 dark:border-zinc-700/50 text-zinc-700 dark:text-zinc-300 leading-relaxed">
              <div className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-blue-600" />
                <span>توجيه المساعد الذكي:</span>
              </div>
              <p>{aiAdvice}</p>
            </div>
          )}

          {suggestedFocus.length > 0 && (
            <div>
              <div className="text-zinc-500 dark:text-zinc-400 mb-1.5 font-medium">المهام المقترحة للبدء بها:</div>
              <ul className="space-y-1">
                {suggestedFocus.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
                    <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 text-[10px] flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

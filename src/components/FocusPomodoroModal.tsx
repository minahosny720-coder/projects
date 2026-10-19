import React, { useState, useEffect } from 'react';
import { Task } from '../types/task';
import { sound } from '../utils/audio';
import { fireCelebrationConfetti } from '../utils/confetti';
import { X, Play, Pause, RotateCcw, CheckCircle2, Coffee, Flame } from 'lucide-react';

interface FocusPomodoroModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onCompleteTask?: (taskId: string) => void;
}

type Mode = 'work' | 'shortBreak' | 'longBreak';

export const FocusPomodoroModal: React.FC<FocusPomodoroModalProps> = ({
  task,
  isOpen,
  onClose,
  onCompleteTask,
}) => {
  const [mode, setMode] = useState<Mode>('work');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const getDuration = (m: Mode) => {
    switch (m) {
      case 'work':
        return 25 * 60;
      case 'shortBreak':
        return 5 * 60;
      case 'longBreak':
        return 15 * 60;
    }
  };

  useEffect(() => {
    setSecondsLeft(getDuration(mode));
    setIsRunning(false);
  }, [mode]);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      sound.playFocusCompleteChime();
      fireCelebrationConfetti();
      if (mode === 'work') {
        setSessionsCompleted((prev) => prev + 1);
        setMode('shortBreak');
      } else {
        setMode('work');
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft, mode]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const totalDuration = getDuration(mode);
  const progressPercent = ((totalDuration - secondsLeft) / totalDuration) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-md">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-8 text-center relative overflow-hidden animate-in fade-in zoom-in-95">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mode Selector */}
        <div className="flex items-center justify-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl max-w-xs mx-auto mb-6">
          <button
            onClick={() => setMode('work')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              mode === 'work'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            جلسة تركيز
          </button>
          <button
            onClick={() => setMode('shortBreak')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              mode === 'shortBreak'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            استراحة 5د
          </button>
          <button
            onClick={() => setMode('longBreak')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              mode === 'longBreak'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            استراحة 15د
          </button>
        </div>

        {/* Linked Task Info */}
        {task ? (
          <div className="mb-6 px-4 py-2 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 rounded-xl text-xs text-blue-900 dark:text-blue-200 truncate">
            <span className="text-zinc-400 dark:text-zinc-500 ml-1">أنت تركز على:</span>
            <span className="font-semibold">{task.title}</span>
          </div>
        ) : (
          <div className="mb-6 text-xs text-zinc-500">
            جلسة تركيز عامة بدون مهمة محددة
          </div>
        )}

        {/* Large Digital Timer with radial progress ring */}
        <div className="relative w-56 h-56 mx-auto flex items-center justify-center my-4">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="112"
              cy="112"
              r="96"
              className="stroke-zinc-100 dark:stroke-zinc-800"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="112"
              cy="112"
              r="96"
              className={`transition-all duration-500 ${
                mode === 'work' ? 'stroke-blue-600' : 'stroke-emerald-600'
              }`}
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 96}
              strokeDashoffset={2 * Math.PI * 96 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono tabular-nums tracking-tighter">
              {timeFormatted}
            </span>
            <span className="text-xs text-zinc-400 mt-2 flex items-center gap-1 font-medium">
              {mode === 'work' ? (
                <>
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>انغمس في العمل</span>
                </>
              ) : (
                <>
                  <Coffee className="w-3.5 h-3.5 text-emerald-500" />
                  <span>استرخِ واستعد طاقتك</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setSecondsLeft(getDuration(mode))}
            className="p-3 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="إعادة ضبط المؤقت"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-6 py-3.5 rounded-full font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md transition-all flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>إيقاف مؤقت</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white ml-0.5" />
                <span>بدء التركيز</span>
              </>
            )}
          </button>

          {task && onCompleteTask && !task.completed && (
            <button
              onClick={() => {
                onCompleteTask(task.id);
                sound.playTaskCompleteChime();
                fireCelebrationConfetti();
                onClose();
              }}
              className="p-3 text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="إكمال المهمة الآن"
            >
              <CheckCircle2 className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Completed Sessions Counter */}
        {sessionsCompleted > 0 && (
          <div className="mt-6 text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
            أكملت {sessionsCompleted} {sessionsCompleted === 1 ? 'جلسة تركيز' : 'جلسات تركيز'} اليوم 👏
          </div>
        )}
      </div>
    </div>
  );
};

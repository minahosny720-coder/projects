export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatArabicDateHeader(): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  return new Intl.DateTimeFormat('ar-EG', options).format(new Date());
}

export function formatTaskDueDate(dueDate: string): { label: string; isToday: boolean; isTomorrow: boolean; isOverdue: boolean } {
  const today = getTodayDateString();
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  if (dueDate === today) {
    return { label: 'اليوم', isToday: true, isTomorrow: false, isOverdue: false };
  }
  if (dueDate === tomorrow) {
    return { label: 'غداً', isToday: false, isTomorrow: true, isOverdue: false };
  }
  if (dueDate === yesterday) {
    return { label: 'أمس', isToday: false, isTomorrow: false, isOverdue: true };
  }

  const isOverdue = dueDate < today;
  try {
    const [y, m, d] = dueDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const formatted = new Intl.DateTimeFormat('ar-EG', { month: 'short', day: 'numeric' }).format(dateObj);
    return { label: formatted, isToday: false, isTomorrow: false, isOverdue };
  } catch {
    return { label: dueDate, isToday: false, isTomorrow: false, isOverdue };
  }
}

export function formatTime12h(time24?: string): string {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  if (isNaN(h)) return time24;

  const isPM = h >= 12;
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;

  const period = isPM ? 'م' : 'ص';
  return `${h}:${m} ${period}`;
}

export function calculateMinutesRemaining(dueDate: string, dueTime?: string): number | null {
  if (!dueTime) return null;
  const [y, m, d] = dueDate.split('-').map(Number);
  const [hh, mm] = dueTime.split(':').map(Number);
  if (isNaN(y) || isNaN(m) || isNaN(d) || isNaN(hh) || isNaN(mm)) return null;

  const targetDate = new Date(y, m - 1, d, hh, mm, 0);
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  return Math.round(diffMs / (60 * 1000));
}

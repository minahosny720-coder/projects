import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({ apiKey });
}

// Helper for Arabic date heuristics if AI is offline/not configured
function heuristicParseTask(text: string) {
  const clean = text.trim();
  let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
  let category: string = 'عام';
  let estimatedMinutes = 30;
  
  if (/عاجل|طارئ|أهمية قصوى|ضروري جداً|urgent/i.test(clean)) {
    priority = 'urgent';
  } else if (/مهم|أولوية عالية|high/i.test(clean)) {
    priority = 'high';
  } else if (/بسيط|غير مستعجل|منخفض|low/i.test(clean)) {
    priority = 'low';
  }

  if (/عمل|اجتماع|شركة|مشروع|عميل|تقرير|work|meeting|project/i.test(clean)) {
    category = 'العمل';
  } else if (/دراسة|مذاكرة|امتحان|كتاب|بحث|درس|study/i.test(clean)) {
    category = 'دراسة';
  } else if (/شراء|تسوق|سوبرماركت|طلبات|buy|shop/i.test(clean)) {
    category = 'تسوق';
  } else if (/صحة|رياضة|طبيب|جيم|دواء|مستشفى|health|gym/i.test(clean)) {
    category = 'صحة';
  } else if (/بيت|عائلة|شخصي|أهل|أصدقاء|personal/i.test(clean)) {
    category = 'شخصي';
  }

  const now = new Date();
  let dueDate = now.toISOString().split('T')[0];
  let dueTime = '12:00';

  if (/غداً|بكرة|بكره|tomorrow/i.test(clean)) {
    const tmrw = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    dueDate = tmrw.toISOString().split('T')[0];
  } else if (/بعد غد|بعد بكرة/i.test(clean)) {
    const afterTmrw = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    dueDate = afterTmrw.toISOString().split('T')[0];
  }

  // Time matching
  const timeMatch = clean.match(/(?:الساعة\s*)?(\d{1,2})(?::(\d{2}))?\s*(صباحاً|مساءً|عصراً|ظهراً|ص|م|am|pm)?/i);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const period = timeMatch[3]?.toLowerCase();

    if (period && (period.includes('م') || period.includes('عصر') || period.includes('ظهر') || period.includes('pm')) && hour < 12) {
      hour += 12;
    } else if (period && (period.includes('ص') || period.includes('am')) && hour === 12) {
      hour = 0;
    }
    dueTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }

  return {
    title: clean.replace(/(?:غداً|بكرة|اليوم|الساعة\s*\d+(?::\d+)?\s*(?:صباحاً|مساءً|عصراً|ظهراً|ص|م)?|أولوية\s*(?:عالية|قصوى|منخفضة|متوسطة))/gi, '').trim() || clean,
    dueDate,
    dueTime,
    priority,
    category,
    estimatedMinutes,
    subtasks: []
  };
}

// 1. Natural Language Task Parsing
app.post('/api/ai/parse-task', async (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text prompt is required' });
  }

  if (!aiClient) {
    return res.json(heuristicParseTask(text));
  }

  try {
    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    const prompt = `أنت مساعد ذكي داخل تطبيق لإدارة المهام اليومية باللغة العربية.
اليوم هو ${currentDate} والوقت الحالي هو ${currentTime}.
حلل النص التالي للمهمة واستخرج الحقول بصيغة JSON نظيفة فقط:
نص المستخدم: "${text}"

المطلوب إرجاع JSON بالشكل التالي حصراً وبدون أي نص إضافي:
{
  "title": "عنوان المهمة بشكل واضح ومختصر باللغة العربية",
  "dueDate": "YYYY-MM-DD",
  "dueTime": "HH:MM (24-hour)",
  "priority": "low" | "medium" | "high" | "urgent",
  "category": "العمل" | "شخصي" | "دراسة" | "صحة" | "تسوق" | "مشاريع" | "عام",
  "estimatedMinutes": 30,
  "subtasks": ["خطوة 1 إذا كانت مذكورة أو بديهية", "خطوة 2"]
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      title: parsed.title || text,
      dueDate: parsed.dueDate || currentDate,
      dueTime: parsed.dueTime || currentTime,
      priority: parsed.priority || 'medium',
      category: parsed.category || 'عام',
      estimatedMinutes: parsed.estimatedMinutes || 30,
      subtasks: Array.isArray(parsed.subtasks) ? parsed.subtasks : []
    });
  } catch (err) {
    console.error('Gemini parse error:', err);
    return res.json(heuristicParseTask(text));
  }
});

// 2. Task Breakdown (Subtasks Generation)
app.post('/api/ai/breakdown-task', async (req: Request, res: Response) => {
  const { title, description } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  if (!aiClient) {
    return res.json({
      subtasks: [
        `التحضير والبدء في: ${title}`,
        'تنفيذ الجزء الأساسي خطوة بخطوة',
        'المراجعة النهائية والتأكد من الاكتمال'
      ]
    });
  }

  try {
    const prompt = `قسم المهمة التالية إلى 3-5 خطوات فرعية عملية ومختصرة باللغة العربية قابلة للتنفيذ:
عنوان المهمة: "${title}"
تفاصيل إضافية: "${description || ''}"

أرجع فقط JSON array من النصوص بالشكل:
{
  "subtasks": [
    "خطوة 1 محددة وقابلة للتنفيذ",
    "خطوة 2",
    "خطوة 3"
  ]
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      subtasks: Array.isArray(parsed.subtasks) ? parsed.subtasks : []
    });
  } catch (err) {
    console.error('Gemini breakdown error:', err);
    return res.json({
      subtasks: [
        `البدء في الخطوة الأولى لـ ${title}`,
        'العمل على التفاصيل الرئيسية',
        'مراجعة النتيجة وإنهاء المهمة'
      ]
    });
  }
});

// 3. Daily Smart Briefing / Scheduling Advice
app.post('/api/ai/daily-plan', async (req: Request, res: Response) => {
  const { tasks } = req.body;
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return res.json({
      advice: 'لا توجد مهام مسجلة لهذا اليوم. استغل وقتك في التخطيط أو إضافة أهدافك اليومية!',
      suggestedFocus: []
    });
  }

  if (!aiClient) {
    const urgentCount = tasks.filter(t => t.priority === 'urgent' || t.priority === 'high').length;
    return res.json({
      advice: `لديك ${tasks.length} مهام اليوم، من بينها ${urgentCount} مهام ذات أولوية مرتفعة. ركّز أولاً على إنجاز المهام الهامة في ساعات الصباح.`,
      suggestedFocus: tasks.slice(0, 3).map(t => t.title)
    });
  }

  try {
    const tasksSummary = tasks.map((t, idx) => `${idx + 1}. ${t.title} [الأولوية: ${t.priority}, الوقت: ${t.dueTime || 'غير محدد'}, التصنيف: ${t.category}]`).join('\n');

    const prompt = `أنت مدرب إنتاجية محترف وذكي.
إليك قائمة مهام المستخدم لليوم:
${tasksSummary}

المطلوب:
1. نصيحة تحفيزية واستراتيجية مقتضبة (2-3 أسطر باللغة العربية الفصحى الودودة والواضحة) حول كيفية إدارة طاقته اليوم وترتيب أولوياته.
2. ترشيح أهم 3 مهام يبدأ بها أولاً.

أرجع JSON حصراً:
{
  "advice": "نصيحة عملية ومباشرة...",
  "suggestedFocus": ["اسم المهمة 1", "اسم المهمة 2", "اسم المهمة 3"]
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      advice: parsed.advice || 'ابدأ بالمهام الأكثر أهمية لإحراز تقدم سريع وشعور بالإنجاز!',
      suggestedFocus: Array.isArray(parsed.suggestedFocus) ? parsed.suggestedFocus : tasks.slice(0, 3).map(t => t.title)
    });
  } catch (err) {
    console.error('Gemini daily plan error:', err);
    return res.json({
      advice: 'نظم مهامك بالبدء بالأصعب والأكثر إلحاحاً أولاً، وتذكر أخذ فترات راحة قصيرة.',
      suggestedFocus: tasks.slice(0, 3).map(t => t.title)
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

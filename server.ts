import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '2mb' }));

interface GenerateMentorNoteBody {
  studentName?: string;
  studentAge?: string;
  period?: string;
  mentorName?: string;
  modules?: string[];
  skills?: string[];
  projects?: string[];
  strengths?: Array<{ title: string; example?: string }>;
  prideText?: string;
  observations?: string;
}

app.post('/api/generate-mentor-note', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({
      error:
        'Ключ GEMINI_API_KEY не настроен на сервере. Добавьте его в Settings > Secrets или заполните текст обращения вручную.',
    });
    return;
  }

  const body = (req.body || {}) as GenerateMentorNoteBody;
  const studentName = String(body.studentName || '').trim();
  const observations = String(body.observations || '').trim();
  const prideText = String(body.prideText || '').trim();

  if (!studentName) {
    res.status(400).json({ error: 'Укажите имя резидента перед генерацией текста.' });
    return;
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const factsSummary = [
    `Имя ученика: ${studentName}${body.studentAge ? ` (${body.studentAge})` : ''}`,
    body.period ? `Учебный период: ${body.period}` : '',
    body.mentorName ? `Имя наставника: ${body.mentorName}` : '',
    body.modules?.length ? `Пройденные модули: ${body.modules.join(', ')}` : '',
    body.skills?.length ? `Приобретённые навыки: ${body.skills.join(', ')}` : '',
    body.projects?.length ? `Выполненные проекты: ${body.projects.join(', ')}` : '',
    body.strengths?.length
      ? `Сильные стороны: ${body.strengths
          .map((s) => (s.example ? `${s.title} (${s.example})` : s.title))
          .join('; ')}`
      : '',
    prideText ? `Момент гордости: ${prideText}` : '',
    observations ? `Наблюдения наставника: ${observations}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: `На основе этих реальных фактов напиши персональное тёплое обращение наставника для страницы журнала резидента KIBERone:\n\n${factsSummary}`,
      config: {
        systemInstruction:
          'Ты — внимательный наставник международной кибершколы KIBERone. Твоя задача: превратить переданные факты и наблюдения наставника в живой, тёплый и естественный личный комментарий для ученика на русском языке. СТРОГОЕ ПРАВИЛО №1: не придумывай новые достижения, проекты, оценки или качества, которых нет во входных данных. Опирайся только на переданные факты. СТРОГОЕ ПРАВИЛО №2 (ГЕНДЕРНАЯ НЕЙТРАЛЬНОСТЬ): всегда используй естественные гендерно-нейтральные формулировки независимо от имени и пола резидента (например: "Дарья, отличный результат за этот период!", "В работе особенно заметны настойчивость и любознательность", "Среди результатов — интересный самостоятельный проект"). Запрещено использовать глаголы прошедшего времени с родовыми окончаниями ("поработал", "проявила", "создал") и конструкции со слэшем или скобками ("создал(а)", "проявил/а"). Пиши без канцелярита и школьных штампов. Поле greeting — 1 короткое обращение до 60 символов (например, "Дарья, отличный результат за этот период!"). Поле body — 2–4 естественных предложения до 280 символов, чтобы текст аккуратно помещался на листке блокнота. Поле signature — подпись до 50 символов (например, "Твой наставник, Алексей").',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            greeting: { type: Type.STRING },
            body: { type: Type.STRING },
            signature: { type: Type.STRING },
          },
          required: ['greeting', 'body', 'signature'],
        },
      },
    });

    const rawText = (response.text || '').trim();
    const parsed = JSON.parse(rawText);
    res.json({
      greeting: String(parsed.greeting || ''),
      body: String(parsed.body || ''),
      signature: String(parsed.signature || ''),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Ошибка обращения к сервису Gemini.';
    res.status(502).json({ error: message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
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
    console.log(`KIBERone Student Journey running at http://0.0.0.0:${PORT}`);
  });
}

startServer();

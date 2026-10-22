import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Shared Server-Side Gemini AI Client
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// =========================================================================
// AI ASSISTED LESSON NOTES PLANNER ENDPOINT (GHANA NaCCA & MONTESSORI)
// =========================================================================
app.post('/api/gemini/lesson-planner', async (req: Request, res: Response) => {
  const { subject, classLevel, weekNumber, topic, curriculumFocus } = req.body;

  if (!topic && !subject) {
    return res.status(400).json({ error: 'Subject and topic are required' });
  }

  // System prompt grounded in Ghana Ministry of Education / NaCCA & Montessori standards
  const systemInstruction = `You are a Senior Curriculum Specialist and Master Teacher for Salem Montessori School in Accra, Ghana.
You specialize in the Ghana National Council for Curriculum and Assessment (NaCCA) standard-based curriculum for Basic Schools (Basic 1 to Basic 9 / JHS 1-3) infused with Montessori tactile and active inquiry-based learning principles.
Generate a complete, rigorous, and practical weekly lesson note following the official NaCCA Lesson Plan format.
Always respond strictly with valid JSON. Do not include markdown code block syntax like \`\`\`json. Output raw JSON only.`;

  const prompt = `Generate an official Ghana NaCCA & Montessori-aligned weekly lesson plan with the following specifications:
- Class / Grade Level: ${classLevel || 'Basic 7 (JHS 1)'}
- Subject: ${subject || 'Computing & ICT'}
- Week Number: Week ${weekNumber || 4}
- Topic: ${topic || 'Computer Systems and Storage'}
${curriculumFocus ? `- Specific Curriculum Focus / Notes: ${curriculumFocus}` : ''}

Output a single JSON object with these exact keys:
{
  "topic": "Clean descriptive topic title",
  "strand": "NaCCA Strand name (e.g., Computing Systems)",
  "subStrand": "NaCCA Sub-strand name",
  "contentStandard": "Official Content Standard with code (e.g., B7.1.2.1: ...)",
  "indicators": [
    "Indicator 1 with code (e.g., B7.1.2.1.1: ...)",
    "Indicator 2 with code (e.g., B7.1.2.1.2: ...)"
  ],
  "coreCompetencies": [
    "Critical Thinking and Problem Solving (CP)",
    "Digital Literacy (DL)",
    "Collaboration and Leadership (CL)"
  ],
  "learningMaterials": [
    "Material 1 (including concrete/tactile/Montessori apparatus or digital lab equipment)",
    "Material 2"
  ],
  "phase1Starter": "Phase 1: Starter (10 mins) - Engaging hook, prior knowledge elicitation, and clear learning intentions.",
  "phase2MainActivities": "Phase 2: Main Teaching & Learning Activities (35-40 mins) - Detailed step-by-step teacher scaffolding, paired student exploration, tactile/Montessori concrete activities, and differentiation.",
  "phase3Reflection": "Phase 3: Reflection & Plenary (10 mins) - Student recap, formative exit question, and synthesis.",
  "assessmentRemarks": "Diagnostic assessment task, class exercise, and homework/project link."
}`;

  try {
    if (!ai) {
      // In case GEMINI_API_KEY is not yet attached, signal offline mode so client uses high-grade curriculum fallback
      return res.status(200).json({
        fallback: true,
        message: 'No GEMINI_API_KEY detected in runtime environment. Using curriculum generator fallback.',
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch {
      // Clean possible wrapper fences
      const clean = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(clean);
    }

    return res.status(200).json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Error generating lesson plan via Gemini API:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate lesson plan',
      fallback: true,
    });
  }
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'Salem VClass Backend', time: new Date().toISOString() });
});

// Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Salem VClass] Server listening on http://0.0.0.0:${PORT} (Mode: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('[Salem VClass] Failed to start server:', err);
  process.exit(1);
});
